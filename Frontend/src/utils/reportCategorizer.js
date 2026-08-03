/**
 * Frontend utility for auto-detecting report category from filename instantly upon selection.
 * @param {string} fileName 
 * @returns {string} Category name
 */
export function categorizeReport(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return 'Other';
  }

  const name = fileName.toLowerCase();

  if (/\b(cbc|hemogram|haematology|blood count|complete blood count)\b/i.test(name)) {
    return 'CBC';
  }
  if (/\b(hba1c|a1c|glycated|glycohemoglobin)\b/i.test(name)) {
    return 'HbA1c';
  }
  if (/\b(lipid|cholesterol|triglyceride|hdl|ldl)\b/i.test(name)) {
    return 'Lipid Profile';
  }
  if (/\b(lft|liver|bilirubin|sgot|sgpt|alt|ast)\b/i.test(name)) {
    return 'Liver Function Test';
  }
  if (/\b(kft|rft|kidney|renal|creatinine|urea|uric acid)\b/i.test(name)) {
    return 'Kidney Function Test';
  }
  if (/\b(x-?ray|radiograph|chest x)\b/i.test(name)) {
    return 'X-Ray';
  }
  if (/\b(ct-?scan|cat scan|computed tomography)\b/i.test(name)) {
    return 'CT Scan';
  }
  if (/\b(mri|magnetic resonance)\b/i.test(name)) {
    return 'MRI';
  }
  if (/\b(ultrasound|usg|sonogram|sonography)\b/i.test(name)) {
    return 'Ultrasound';
  }
  if (/\b(thyroid|t3|t4|tsh)\b/i.test(name)) {
    return 'Thyroid Profile';
  }
  if (/\b(urine|urinalysis)\b/i.test(name)) {
    return 'Urine Test';
  }
  if (/\b(glucose|blood sugar|fbs|ppbs|sugar)\b/i.test(name)) {
    return 'Blood Sugar';
  }
  if (/\b(stool|fecal)\b/i.test(name)) {
    return 'Stool Test';
  }
  if (/\b(hormone|testosterone|estrogen|progesterone|cortisol|prolactin)\b/i.test(name)) {
    return 'Hormone Test';
  }
  if (/\b(vitamin|vit|iron|ferritin|calcium|b12)\b/i.test(name)) {
    return 'Vitamins & Minerals';
  }
  if (/\b(troponin|cardiac|ck-mb|bnp)\b/i.test(name)) {
    return 'Cardiac Markers';
  }
  if (/\b(crp|esr|ana|rheumatoid|inflammation|c-reactive)\b/i.test(name)) {
    return 'Inflammation & Autoimmune';
  }
  if (/\b(culture|swab|microbiology|infection|widal|dengue|covid)\b/i.test(name)) {
    return 'Infection & Microbiology';
  }
  if (/\b(psa|cea|ca-?125|afp|tumor)\b/i.test(name)) {
    return 'Tumor Markers';
  }
  if (/\b(pt|inr|aptt|coagulation|prothrombin)\b/i.test(name)) {
    return 'Coagulation Test';
  }
  if (/\b(pet scan|nuclear|scintigraphy)\b/i.test(name)) {
    return 'Nuclear Medicine';
  }
  if (/\b(biopsy|histopathology|pathology|cytology)\b/i.test(name)) {
    return 'Biopsy & Pathology';
  }

  return 'Other';
}

export default categorizeReport;
