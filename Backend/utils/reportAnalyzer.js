/**
 * Builds Gemini prompt for analyzing a medical report based on its category and extracted text.
 * @param {string} category 
 * @param {string} reportText 
 * @returns {string} Prompt string
 */
export function buildReportAnalysisPrompt(category, reportText) {
  return `
You are MedAssist AI, an expert medical report analysis system.
Analyze the following medical report text belonging to category "${category}".

REPORT TEXT:
"""
${reportText}
"""

Instructions:
1. Provide a concise, patient-friendly summary (2-4 sentences) explaining the key findings of this report in plain language.
2. Extract all relevant numerical test parameters / laboratory markers as a list of highlights.
   For each parameter, extract:
   - "label": Name of parameter (e.g., "Hemoglobin", "HbA1c", "Fasting Glucose", "Serum Creatinine", "ALT")
   - "value": The extracted value with unit if present (e.g., "10.2 g/dL", "6.5%", "110 mg/dL")
   - "status": One of ["normal", "low", "high", "critical"] based on standard medical reference ranges.
   - "normalRange": Reference range string if present in report or standard range (e.g., "12.0 - 15.5 g/dL").
3. Determine the overall status of the report:
   - "overallStatus": One of ["Normal", "Needs Attention", "Concerning", "Critical"]
4. List 2-4 practical, clear actionable recommendations for the patient based on these findings.

Output Format:
You MUST return ONLY a valid JSON object matching the following structure with no markdown wrapping or additional text:
{
  "summary": "Full summary text here...",
  "highlights": [
    {
      "label": "Parameter Name",
      "value": "10.2 g/dL",
      "status": "normal" | "low" | "high" | "critical",
      "normalRange": "12.0 - 15.5 g/dL"
    }
  ],
  "overallStatus": "Normal" | "Needs Attention" | "Concerning" | "Critical",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}
`;
}

export default buildReportAnalysisPrompt;
