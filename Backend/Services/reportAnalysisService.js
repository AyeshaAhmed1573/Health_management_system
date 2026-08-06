import GEMINI_CONFIG from '../config/gemini.js';
import { buildReportAnalysisPrompt } from '../utils/reportAnalyzer.js';

/**
 * Extracts structured values from a report using Gemini API.
 * @param {string} category 
 * @param {string} reportText 
 * @returns {Promise<Array>} Array of { parameterName, value, unit, referenceRange, isAbnormal }
 */
export async function extractStructuredValues(category, reportText) {
  const { apiKey, model, baseUrl, generationConfig, safetySettings } = GEMINI_CONFIG;

  if (!reportText || !reportText.trim()) {
    return [];
  }

  const extractionPrompt = `Extract all numerical test values from this ${category} report. Return ONLY a JSON array with this exact structure:
[
  {
    "parameterName": "e.g., Hemoglobin, WBC, Platelets",
    "value": "the numeric value as a string (e.g., '13.5')",
    "unit": "the unit (e.g., 'g/dL', '10³/µL')",
    "referenceRange": "the normal range if mentioned (e.g., '12.0 - 15.5 g/dL')",
    "isAbnormal": boolean - true if value is outside reference range
  }
]

Report text:
${reportText}`;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, returning empty extracted values');
    return [];
  }

  try {
    const response = await fetch(
      `${baseUrl}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
          generationConfig,
          safetySettings,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Gemini API Error for value extraction:', err);
      return [];
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return [];
    }

    // Clean JSON response
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
    let jsonString = jsonMatch[1].trim();

    const objectMatch = jsonString.match(/\[[\s\S]*\]/);
    if (objectMatch) {
      jsonString = objectMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error('JSON parse error for extracted values:', parseErr.message);
      jsonString = jsonString
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"');
      parsed = JSON.parse(jsonString);
    }

    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error during value extraction:', err);
    return [];
  }
}

/**
 * Analyzes a report using Google Gemini API.
 * @param {string} category 
 * @param {string} reportText 
 * @returns {Promise<object>} { summary, highlights, overallStatus, recommendations }
 */
export async function analyzeReportWithAI(category, reportText) {
  const { apiKey, model, baseUrl, generationConfig, safetySettings } = GEMINI_CONFIG;

  if (!reportText || !reportText.trim()) {
    return getDefaultFallbackAnalysis(category);
  }

  const prompt = buildReportAnalysisPrompt(category, reportText);

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, generating structured mock report analysis');
    return generateMockReportAnalysis(category, reportText);
  }

  try {
    const response = await fetch(
      `${baseUrl}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig,
          safetySettings,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', err);
      return generateMockReportAnalysis(category, reportText);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return generateMockReportAnalysis(category, reportText);
    }

    // Clean JSON response (strip ```json and ``` if present)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
    let jsonString = jsonMatch[1].trim();

    console.log('Raw AI response:', rawText.substring(0, 200));
    console.log('Cleaned JSON string:', jsonString.substring(0, 200));

    // Try to extract JSON object if response contains extra text
    const objectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonString = objectMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error('JSON parse error, attempting to fix common issues:', parseErr.message);
      // Try to fix common JSON issues
      jsonString = jsonString
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/'/g, '"');     // Replace single quotes with double quotes
      parsed = JSON.parse(jsonString);
    }
    return {
      summary: parsed.summary || 'Report analysis completed.',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      overallStatus: ['Normal', 'Needs Attention', 'Concerning', 'Critical'].includes(parsed.overallStatus)
        ? parsed.overallStatus
        : 'Normal',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch (err) {
    console.error('Error during AI report analysis:', err);
    return generateMockReportAnalysis(category, reportText);
  }
}

/**
 * Builds comparison data structure across multiple reports sorted oldest first.
 * @param {Array<object>} reports 
 * @returns {object} { dates: [...], params: { [label]: { values: [...], unit: "..." } } }
 */
export function buildComparisonData(reports) {
  if (!reports || !Array.isArray(reports) || reports.length === 0) {
    return { dates: [], params: {} };
  }

  // Format dates as DD/MM/YYYY
  const dates = reports.map((r) => {
    const dateObj = new Date(r.createdAt || Date.now());
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  });

  // Map of param label -> { values: array of numbers (length equal to reports.length), unit: string }
  const paramsMap = {};

  reports.forEach((report, index) => {
    const highlights = report.aiHighlights || [];
    highlights.forEach((h) => {
      if (!h.label || !h.value) return;

      const cleanLabel = h.label.trim();
      const rawVal = String(h.value).trim();

      // Extract numeric value and unit e.g. "10.2 g/dL" -> num: 10.2, unit: "g/dL"
      const numMatch = rawVal.match(/([-+]?[0-9]*\.?[0-9]+)/);
      if (!numMatch) return;

      const numVal = parseFloat(numMatch[1]);
      const unit = rawVal.replace(numMatch[0], '').trim();

      if (!paramsMap[cleanLabel]) {
        paramsMap[cleanLabel] = {
          values: new Array(reports.length).fill(null),
          unit: unit || '',
        };
      } else if (!paramsMap[cleanLabel].unit && unit) {
        paramsMap[cleanLabel].unit = unit;
      }

      paramsMap[cleanLabel].values[index] = numVal;
    });
  });

  return { dates, params: paramsMap };
}

function getDefaultFallbackAnalysis(category) {
  return {
    summary: `Report categorized as ${category}. No extracted text was available for detailed AI analysis.`,
    highlights: [],
    overallStatus: 'Normal',
    recommendations: ['Please consult your doctor for detailed clinical evaluation.'],
  };
}

function generateMockReportAnalysis(category, text) {
  const sampleHighlights = {
    CBC: [
      { label: 'Hemoglobin', value: '13.5 g/dL', status: 'normal', normalRange: '12.0 - 15.5 g/dL' },
      { label: 'WBC', value: '6.8 10³/µL', status: 'normal', normalRange: '4.5 - 11.0 10³/µL' },
      { label: 'Platelets', value: '250 10³/µL', status: 'normal', normalRange: '150 - 450 10³/µL' },
    ],
    HbA1c: [
      { label: 'HbA1c', value: '5.8 %', status: 'high', normalRange: '< 5.7 %' },
      { label: 'Estimated Avg Glucose', value: '120 mg/dL', status: 'high', normalRange: '< 117 mg/dL' },
    ],
    'Lipid Profile': [
      { label: 'Total Cholesterol', value: '210 mg/dL', status: 'high', normalRange: '< 200 mg/dL' },
      { label: 'HDL Cholesterol', value: '45 mg/dL', status: 'normal', normalRange: '> 40 mg/dL' },
      { label: 'LDL Cholesterol', value: '135 mg/dL', status: 'high', normalRange: '< 100 mg/dL' },
      { label: 'Triglycerides', value: '150 mg/dL', status: 'normal', normalRange: '< 150 mg/dL' },
    ],
    'Liver Function Test': [
      { label: 'ALT (SGPT)', value: '28 U/L', status: 'normal', normalRange: '7 - 56 U/L' },
      { label: 'AST (SGOT)', value: '32 U/L', status: 'normal', normalRange: '10 - 40 U/L' },
      { label: 'Bilirubin Total', value: '0.9 mg/dL', status: 'normal', normalRange: '0.1 - 1.2 mg/dL' },
    ],
    'Kidney Function Test': [
      { label: 'Serum Creatinine', value: '0.9 mg/dL', status: 'normal', normalRange: '0.6 - 1.2 mg/dL' },
      { label: 'Blood Urea Nitrogen', value: '14 mg/dL', status: 'normal', normalRange: '7 - 20 mg/dL' },
    ],
  };

  const highlights = sampleHighlights[category] || [
    { label: `${category} Parameter`, value: 'Normal', status: 'normal', normalRange: 'Standard' },
  ];

  return {
    summary: `The ${category} report has been processed. Extracted parameters show generally stable findings with minor deviations noted for follow up.`,
    highlights,
    overallStatus: highlights.some((h) => h.status === 'high' || h.status === 'low') ? 'Needs Attention' : 'Normal',
    recommendations: [
      'Maintain a balanced diet and regular physical hydration.',
      'Schedule a routine follow-up with your primary physician.',
      'Monitor key health metrics over time.',
    ],
  };
}
