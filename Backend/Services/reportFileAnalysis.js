import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini, parseJsonLoose } from './geminiClient.js';

const UPLOAD_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'uploads');
const MIME = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
const MAX_BYTES = 15 * 1024 * 1024; // keep the inline request well under Gemini's limit

export const mimeFor = (name = '') => MIME[String(name).split('.').pop().toLowerCase()] || null;

/** Loads a stored report (Cloudinary URL or local /uploads path) into memory. */
export async function loadReportFile({ fileUrl, fileName, fileType }) {
  const mimeType = mimeFor(fileType) || mimeFor(fileName) || mimeFor(fileUrl);
  if (!mimeType) throw new Error('Unsupported file type for AI analysis');

  console.log('loadReportFile:', { fileUrl, fileName, fileType, mimeType });

  if (/^https?:\/\//i.test(fileUrl)) {
    console.log('Downloading from URL:', fileUrl);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Could not download the file (${res.status}). If it is a PDF on Cloudinary, enable PDF delivery in Cloudinary settings.`);
      const buffer = Buffer.from(await res.arrayBuffer());
      console.log('Downloaded file size:', buffer.length);
      return { buffer, mimeType };
    } catch (err) {
      console.error('Failed to download from URL:', err.message);
      throw new Error(`Could not download file from ${fileUrl}: ${err.message}`);
    }
  }
  const rel = decodeURIComponent(fileUrl).replace(/^\/?uploads\//, '');
  const full = path.resolve(UPLOAD_ROOT, rel);
  console.log('Loading from local path:', full);
  if (!full.startsWith(UPLOAD_ROOT + path.sep) || !fs.existsSync(full)) throw new Error('Stored file not found');
  return { buffer: fs.readFileSync(full), mimeType };
}

const STATUSES = ['normal', 'low', 'high', 'critical'];
const OVERALL = ['Normal', 'Needs Attention', 'Concerning', 'Critical'];

/**
 * Reads the actual report (PDF or image) with Gemini and returns everything the platform stores:
 * extracted values, highlights, a plain-language summary, overall status, recommendations.
 * Informational only - never a diagnosis.
 */
export async function analyzeReportFile({ buffer, mimeType, category = 'Other', title = '' }) {
  if (!buffer?.length) throw new Error('Empty file');
  if (buffer.length > MAX_BYTES) throw new Error('File too large for AI analysis (max 15 MB)');

  const prompt = `You are a careful medical-report reading assistant for patients. The attached file is a medical report (category: "${category}", title: "${title}").
Read it and return ONLY a JSON object with this exact shape:
{
  "isMedicalReport": true,
  "summary": "2-4 plain-language sentences explaining the key findings to a patient",
  "overallStatus": "Normal" | "Needs Attention" | "Concerning" | "Critical",
  "values": [
    { "parameterName": "Hemoglobin", "value": "10.2", "unit": "g/dL", "referenceRange": "12.0 - 15.5 g/dL", "status": "normal" | "low" | "high" | "critical" }
  ],
  "recommendations": ["2-4 practical, non-prescriptive next steps, e.g. discuss X with your doctor"]
}
Rules:
- Use only values that are actually printed in the report; use the report's own reference range when present, otherwise a standard adult range.
- If the file is not a medical report or is unreadable, set "isMedicalReport": false, put a short explanation in "summary", and leave "values" empty.
- Do NOT diagnose a disease and do NOT prescribe or change medication. Recommend seeing a doctor for anything abnormal.
- Output JSON only, no markdown.`;

  const text = await callGemini(
    [{ text: prompt }, { inlineData: { mimeType, data: buffer.toString('base64') } }],
    { maxOutputTokens: 8192, temperature: 0.1 }
  );
  const parsed = parseJsonLoose(text);

  const values = (Array.isArray(parsed.values) ? parsed.values : [])
    .filter((v) => v?.parameterName)
    .map((v) => ({
      parameterName: String(v.parameterName).trim(),
      value: v.value ?? '',
      unit: v.unit ? String(v.unit) : '',
      referenceRange: v.referenceRange ? String(v.referenceRange) : '',
      status: STATUSES.includes(String(v.status).toLowerCase()) ? String(v.status).toLowerCase() : 'normal',
    }));

  return {
    isMedicalReport: parsed.isMedicalReport !== false,
    summary: parsed.summary || 'Report analysis completed.',
    overallStatus: OVERALL.includes(parsed.overallStatus) ? parsed.overallStatus : 'Normal',
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String).slice(0, 6) : [],
    extractedValues: values.map((v) => ({
      parameterName: v.parameterName, value: v.value, unit: v.unit,
      referenceRange: v.referenceRange, isAbnormal: v.status !== 'normal',
    })),
    highlights: values.map((v) => ({
      label: v.parameterName,
      value: `${v.value}${v.unit ? ' ' + v.unit : ''}`.trim(),
      status: v.status,
      normalRange: v.referenceRange,
    })),
  };
}

/**
 * Cross-report health summary for the dashboard: recent reports + latest readings + profile.
 */
export async function buildHealthInsights({ profile, reports, readings }) {
  const age = profile.dateOfBirth ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / 31557600000) : null;
  const data = {
    person: { age, gender: profile.gender, bloodGroup: profile.bloodGroup, allergies: profile.allergies, conditions: profile.medicalConditions },
    reports: reports.map((r) => ({
      title: r.title, type: r.testType || r.category, date: r.testDate || r.createdAt,
      status: r.aiOverallStatus, summary: r.aiSummary,
      abnormal: (r.aiHighlights || []).filter((h) => h.status && h.status !== 'normal').map((h) => `${h.label} ${h.value} (${h.status})`),
    })),
    readings: readings.map((x) => ({
      type: x.type, value: x.type === 'blood_pressure' ? `${x.systolic}/${x.diastolic}` : x.value,
      unit: x.unit, date: x.measuredAt,
    })),
  };

  const prompt = `You are a supportive health-information assistant. Using ONLY the data below, write a short personal health overview for the patient.
Return ONLY JSON:
{
  "summary": "2-3 friendly sentences on the overall picture",
  "positives": ["up to 3 things that look good"],
  "concerns": ["up to 4 things worth attention, each naming the report/reading it comes from"],
  "suggestions": ["up to 4 general lifestyle or follow-up suggestions"],
  "followUp": "one sentence on whether/when to see a doctor"
}
Rules: no diagnosis, no medication advice, say "talk to your doctor" for anything abnormal, don't invent data, keep it short.

DATA:
${JSON.stringify(data)}`;

  const parsed = parseJsonLoose(await callGemini([{ text: prompt }], { maxOutputTokens: 2048, temperature: 0.3 }));
  const list = (v, n) => (Array.isArray(v) ? v.map(String).slice(0, n) : []);
  return {
    summary: parsed.summary || '',
    positives: list(parsed.positives, 3),
    concerns: list(parsed.concerns, 4),
    suggestions: list(parsed.suggestions, 4),
    followUp: parsed.followUp || '',
  };
}
