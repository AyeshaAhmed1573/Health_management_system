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
1. Provide a clear, detailed layman explanation (4-8 sentences) explaining the key findings of this report in simple, non-medical terms that any patient can understand.
   - MUST include the actual test values with their units (e.g., "Your hemoglobin is 13.5 g/dL")
   - MUST include the normal range for each value mentioned (e.g., "The normal range is 12.0-15.5 g/dL")
   - Explain in simple terms what each value means and whether it's normal, low, or high
   - Avoid complex medical jargon, but do include the actual numbers and ranges
   - Example: "Your hemoglobin level is 13.5 g/dL, which is within the normal range of 12.0-15.5 g/dL. This means your red blood cell count is healthy and your body can carry oxygen properly."

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
  "laymanExplanation": "Your hemoglobin is 13.5 g/dL, which is within the normal range of 12.0-15.5 g/dL. This means your red blood cell count is healthy. Your HbA1c is 6.5%, which is slightly above the normal range of below 5.7%. This indicates your average blood sugar has been higher than optimal over the past 3 months...",
  "summary": "Brief summary for medical context...",
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
