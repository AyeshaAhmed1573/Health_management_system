import MedicalReport from '../Models/MedicalReport.model.js';
import { categorizeReport } from '../utils/reportCategorizer.js';
import { analyzeReportWithAI, buildComparisonData, extractStructuredValues } from '../Services/reportAnalysisService.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../Services/cloudinaryService.js';
import GEMINI_CONFIG from '../config/gemini.js';
import fs from 'fs';
import PatientProfile from '../Models/PatientProfile.model.js';
import HealthReading from '../Models/HealthReading.model.js';
import { analyzeReportFile, loadReportFile, buildHealthInsights } from '../Services/reportFileAnalysis.js';

// Reads the stored file with Gemini and returns fields to merge into a report; never throws.
async function aiFieldsFromFile(source, category, title) {
  try {
    const { buffer, mimeType } = source.buffer ? source : await loadReportFile(source);
    const r = await analyzeReportFile({ buffer, mimeType, category, title });
    return {
      ok: true,
      fields: {
        aiSummary: r.summary,
        aiHighlights: r.highlights,
        aiOverallStatus: r.overallStatus,
        aiRecommendations: r.recommendations,
        aiAnalyzedAt: new Date(),
        extractedValues: r.extractedValues,
        needsManualReview: !r.isMedicalReport || r.extractedValues.length === 0,
      },
    };
  } catch (err) {
    console.error('AI file analysis failed:', err.message);
    return { ok: false, error: err.message };
  }
}

// Helper function to normalize custom test types
function normalizeTestType(testType) {
  if (!testType) return null;
  return testType
    .trim()
    .toUpperCase()
    .replace(/[^\w\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();
}

// POST /api/reports - Upload & Analyze Report
export async function uploadReport(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Handle file upload from FormData
    if (req.file) {
      const { title, profileId, testType, testDate, notes } = req.body;

      if (!title || !profileId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, profileId',
        });
      }

      // Auto categorize based on file name
      const fileName = req.file.originalname;
      const category = categorizeReport(fileName);
      const autoCategorized = category !== 'Other';

      // Handle test type (custom or standard)
      let finalTestType = testType || category;
      let isCustomTestType = false;

      const standardTestTypes = [
        'CBC', 'HbA1c', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test',
        'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Thyroid Profile', 'Urine Test',
        'Blood Sugar', 'Stool Test', 'Hormone Test', 'Vitamins & Minerals',
        'Cardiac Markers', 'Inflammation & Autoimmune', 'Infection & Microbiology',
        'Tumor Markers', 'Coagulation Test', 'Nuclear Medicine', 'Biopsy & Pathology'
      ];

      if (testType && !standardTestTypes.includes(testType)) {
        finalTestType = normalizeTestType(testType);
        isCustomTestType = true;
      }

      // Upload to Cloudinary from backend
      let cloudinaryResult;
      try {
        cloudinaryResult = await uploadToCloudinary(req.file.path, userId, profileId, category);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError);
        return res.status(500).json({ success: false, error: 'Failed to upload file to cloud storage' });
      }

      // Perform AI analysis (non-blocking - will be empty for now without OCR)
      let aiResults = {
        summary: '',
        highlights: [],
        overallStatus: 'Normal',
        recommendations: [],
      };
      let extractedValues = [];
      let needsManualReview = true; // Mark for review since we don't have extracted text

      const fileAi = await aiFieldsFromFile(
        { buffer: fs.readFileSync(req.file.path), mimeType: req.file.mimetype },
        category,
        title
      );
      if (fileAi.ok) {
        aiResults = {
          summary: fileAi.fields.aiSummary,
          highlights: fileAi.fields.aiHighlights,
          overallStatus: fileAi.fields.aiOverallStatus,
          recommendations: fileAi.fields.aiRecommendations,
        };
        extractedValues = fileAi.fields.extractedValues;
        needsManualReview = fileAi.fields.needsManualReview;
      }

      console.log('Creating report with data:', { userId, profileId, title, category, testType: finalTestType });
      const report = new MedicalReport({
        userId,
        profileId,
        title,
        category,
        testType: finalTestType,
        isCustomTestType,
        testDate: testDate || new Date(),
        fileUrl: cloudinaryResult.fileUrl,
        publicId: cloudinaryResult.publicId,
        fileName,
        fileType: fileName.split('.').pop().toLowerCase(),
        fileSize: req.file.size || 0,
        folderPath: `reports/${userId}/${profileId}/${category.replace(/\s+/g, '_')}`,
        autoCategorized,
        notes: notes || '',
        extractedText: '',
        extractedValues: extractedValues || [],
        needsManualReview,
        aiSummary: aiResults.summary || '',
        aiHighlights: aiResults.highlights || [],
        aiOverallStatus: aiResults.overallStatus || 'Normal',
        aiRecommendations: aiResults.recommendations || [],
        aiAnalyzedAt: aiResults.summary ? new Date() : undefined,
      });

      console.log('Saving report to database...');
      await report.save();
      console.log('Report saved successfully:', report._id);

      res.status(201).json({
        success: true,
        message: 'Report uploaded successfully',
        report,
      });
    } else {
      // Legacy JSON-based upload (for backward compatibility)
      const {
        title,
        profileId,
        notes,
        fileUrl,
        publicId,
        fileName,
        fileType,
        fileSize,
        extractedText,
        testType,
        testDate,
      } = req.body;

      if (!title || !profileId || !fileUrl || !fileName || !fileType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, profileId, fileUrl, fileName, fileType',
        });
      }

      const category = categorizeReport(fileName);
      const autoCategorized = category !== 'Other';
      const folderPath = `reports/${userId}/${profileId}/${category.replace(/\s+/g, '_')}`;

      let finalTestType = testType || category;
      let isCustomTestType = false;

      const standardTestTypes = [
        'CBC', 'HbA1c', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test',
        'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Thyroid Profile', 'Urine Test',
        'Blood Sugar', 'Stool Test', 'Hormone Test', 'Vitamins & Minerals',
        'Cardiac Markers', 'Inflammation & Autoimmune', 'Infection & Microbiology',
        'Tumor Markers', 'Coagulation Test', 'Nuclear Medicine', 'Biopsy & Pathology'
      ];

      if (testType && !standardTestTypes.includes(testType)) {
        finalTestType = normalizeTestType(testType);
        isCustomTestType = true;
      }

      let aiResults = {
        summary: '',
        highlights: [],
        overallStatus: 'Normal',
        recommendations: [],
      };
      let extractedValues = [];
      let needsManualReview = false;

      if (!extractedText?.trim()) {
        const fileAi = await aiFieldsFromFile({ fileUrl, fileName, fileType }, category, title);
        if (fileAi.ok) {
          aiResults = {
            summary: fileAi.fields.aiSummary,
            highlights: fileAi.fields.aiHighlights,
            overallStatus: fileAi.fields.aiOverallStatus,
            recommendations: fileAi.fields.aiRecommendations,
          };
          extractedValues = fileAi.fields.extractedValues;
          needsManualReview = fileAi.fields.needsManualReview;
        } else {
          needsManualReview = true;
        }
      } else if (extractedText && extractedText.trim()) {
        try {
          extractedValues = await extractStructuredValues(category, extractedText);
          aiResults = await analyzeReportWithAI(category, extractedText);
        } catch (aiError) {
          console.error('AI analysis failed, using fallback:', aiError.message);
          needsManualReview = true;
        }
      }

      const report = new MedicalReport({
        userId,
        profileId,
        title,
        category,
        testType: finalTestType,
        isCustomTestType,
        testDate: testDate || new Date(),
        fileUrl,
        publicId: publicId || `reports/${userId}/${profileId}/${Date.now()}`,
        fileName,
        fileType: fileType.toLowerCase(),
        fileSize: fileSize || 0,
        folderPath,
        autoCategorized,
        notes: notes || '',
        extractedText: extractedText || '',
        extractedValues: extractedValues || [],
        needsManualReview,
        aiLaymanExplanation: aiResults.laymanExplanation || '',
        aiSummary: aiResults.summary || '',
        aiHighlights: aiResults.highlights || [],
        aiOverallStatus: aiResults.overallStatus || 'Normal',
        aiRecommendations: aiResults.recommendations || [],
        aiAnalyzedAt: aiResults.summary ? new Date() : undefined,
      });

      await report.save();

      res.status(201).json({
        success: true,
        message: 'Report uploaded and analyzed successfully',
        report,
      });
    }
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/reports/folders/:profileId - Get grouped report folders by testType
export async function getReportFolders(req, res) {
  try {
    const { profileId } = req.params;

    const reports = await MedicalReport.find({ profileId }).sort({ testDate: -1 });

    const foldersMap = {};

    reports.forEach((report) => {
      // Use testType if available, otherwise fall back to category
      const testType = report.testType || report.category || 'Other';
      if (!foldersMap[testType]) {
        foldersMap[testType] = {
          testType,
          isCustomTestType: report.isCustomTestType || false,
          count: 0,
          latestDate: report.testDate || report.createdAt,
          latestStatus: report.aiOverallStatus || 'Normal',
          needsReviewCount: 0,
          reports: [],
        };
      }

      foldersMap[testType].count += 1;
      foldersMap[testType].reports.push(report);
      if (report.needsManualReview) {
        foldersMap[testType].needsReviewCount += 1;
      }
    });

    res.status(200).json(foldersMap);
  } catch (error) {
    console.error('Error fetching report folders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/reports/profile/:profileId/category/:category - Get reports by category
export async function getReportsByCategory(req, res) {
  try {
    const { profileId, category } = req.params;

    const reports = await MedicalReport.find({ profileId, category }).sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports by category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/reports/compare/:profileId/:category - Get comparison graph data
export async function getComparisonDataController(req, res) {
  try {
    const { profileId, category } = req.params;

    // Fetch reports with aiHighlights sorted oldest first
    const reports = await MedicalReport.find({
      profileId,
      category,
      'aiHighlights.0': { $exists: true },
    }).sort({ createdAt: 1 });

    if (reports.length < 2) {
      return res.status(200).json({
        message: `Need at least 2 ${category} reports to compare trends over time.`,
        count: reports.length,
        dates: [],
        params: {},
      });
    }

    const comparisonData = buildComparisonData(reports);

    res.status(200).json({
      success: true,
      count: reports.length,
      ...comparisonData,
    });
  } catch (error) {
    console.error('Error getting comparison data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/reports/:reportId - Get single report by ID
export async function getReportById(req, res) {
  try {
    const { reportId } = req.params;

    const report = await MedicalReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// DELETE /api/reports/:reportId - Delete report
export async function deleteReport(req, res) {
  try {
    const { reportId } = req.params;

    const report = await MedicalReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Delete from Cloudinary if publicId exists
    if (report.publicId) {
      await deleteFromCloudinary(report.publicId);
    }

    await MedicalReport.findByIdAndDelete(reportId);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/reports/:reportId/analyze - Reanalyze existing report
export async function reanalyzeReport(req, res) {
  try {
    const { reportId } = req.params;

    const report = await MedicalReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Prefer reading the real file with Gemini; fall back to text analysis if that is impossible.
    const fileAi = await aiFieldsFromFile(report, report.category, report.title);
    if (fileAi.ok) {
      Object.assign(report, fileAi.fields);
    } else {
      // Build a comprehensive text that includes extracted values
      let textToAnalyze = report.extractedText || report.notes || report.title;

      // Add extracted values to the text so AI can reference them
      if (report.extractedValues && report.extractedValues.length > 0) {
        textToAnalyze += '\n\nEXTRACTED VALUES:\n';
        report.extractedValues.forEach((val, idx) => {
          textToAnalyze += `${idx + 1}. ${val.parameterName}: ${val.value} ${val.unit || ''} (Normal Range: ${val.referenceRange || 'Standard'})\n`;
        });
      }

      // Add existing highlights if available
      if (report.aiHighlights && report.aiHighlights.length > 0) {
        textToAnalyze += '\n\nPREVIOUS ANALYSIS:\n';
        report.aiHighlights.forEach((h, idx) => {
          textToAnalyze += `${idx + 1}. ${h.label}: ${h.value} (Status: ${h.status}, Normal Range: ${h.normalRange})\n`;
        });
      }

      const aiResults = await analyzeReportWithAI(report.category, textToAnalyze);
      report.aiLaymanExplanation = aiResults.laymanExplanation;
      report.aiSummary = aiResults.summary;
      report.aiHighlights = aiResults.highlights;
      report.aiOverallStatus = aiResults.overallStatus;
      report.aiRecommendations = aiResults.recommendations;
      report.aiAnalyzedAt = new Date();
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report re-analyzed successfully',
      report,
    });
  } catch (error) {
    console.error('Error re-analyzing report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// PATCH /api/reports/:id/values - Update extracted values manually
export async function updateReportValues(req, res) {
  try {
    const { id } = req.params;
    const { extractedValues } = req.body;

    if (!Array.isArray(extractedValues)) {
      return res.status(400).json({ success: false, error: 'extractedValues must be an array' });
    }

    const report = await MedicalReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    report.extractedValues = extractedValues;
    report.needsManualReview = false; // Clear the review flag after manual edit

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report values updated successfully',
      report,
    });
  } catch (error) {
    console.error('Error updating report values:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/reports/folder/:profileId/:testType - Get all reports of a specific test type
export async function getReportsByTestType(req, res) {
  try {
    const { profileId, testType } = req.params;

    const reports = await MedicalReport.find({ 
      profileId, 
      $or: [
        { testType: testType },
        { category: testType }
      ]
    }).sort({ testDate: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports by test type:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/reports/compare/:profileId/:testType - Get comparison data with trend analysis
export async function getComparisonByTestType(req, res) {
  console.log('=== COMPARISON ENDPOINT CALLED ===');
  try {
    const { profileId, testType } = req.params;

    console.log('getComparisonByTestType called with:', { profileId, testType });

    // Fetch reports with extractedValues sorted by testDate (oldest first)
    const reports = await MedicalReport.find({
      profileId,
      $or: [
        { testType: testType },
        { category: testType }
      ]
    }).sort({ testDate: 1 });

    console.log('Found reports:', reports.length, 'for testType:', testType);
    console.log('Reports:', reports.map(r => ({ _id: r._id, testType: r.testType, category: r.category, extractedValues: r.extractedValues?.length })));

    if (reports.length === 0) {
      return res.status(200).json({
        message: `No ${testType} reports found.`,
        count: 0,
        dates: [],
        params: {},
        trendSummary: '',
        needsReviewCount: 0,
      });
    }

    // Count reports needing review
    const needsReviewCount = reports.filter(r => r.needsManualReview).length;

    // Build comparison data from extractedValues
    const dates = reports.map((r) => {
      const dateObj = new Date(r.testDate || r.createdAt);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    });

    const paramsMap = {};

    reports.forEach((report, index) => {
      const values = report.extractedValues || [];
      values.forEach((v) => {
        if (!v.parameterName || v.value === undefined) return;

        const paramName = v.parameterName.trim();
        const rawVal = String(v.value).trim();

        // Extract numeric value
        const numMatch = rawVal.match(/([-+]?[0-9]*\.?[0-9]+)/);
        if (!numMatch) return;

        const numVal = parseFloat(numMatch[1]);
        const unit = v.unit || rawVal.replace(numMatch[0], '').trim();

        if (!paramsMap[paramName]) {
          paramsMap[paramName] = {
            values: new Array(reports.length).fill(null),
            unit: unit || '',
            referenceRanges: new Array(reports.length).fill(null),
          };
        } else if (!paramsMap[paramName].unit && unit) {
          paramsMap[paramName].unit = unit;
        }

        paramsMap[paramName].values[index] = numVal;
        paramsMap[paramName].referenceRanges[index] = v.referenceRange || null;
      });
    });

    // Generate trend summary using Gemini if we have enough data
    let trendSummary = '';
    if (reports.length >= 2 && Object.keys(paramsMap).length > 0) {
      try {
        trendSummary = await generateTrendSummary(testType, reports, paramsMap);
      } catch (aiError) {
        console.error('Trend summary generation failed:', aiError.message);
        trendSummary = generateFallbackTrendSummary(testType, reports, paramsMap);
      }
    } else if (reports.length === 1) {
      trendSummary = `Only one ${testType} report available. Upload more reports to see trends over time.`;
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      dates,
      params: paramsMap,
      trendSummary,
      needsReviewCount,
    });
  } catch (error) {
    console.error('Error getting comparison data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function generateTrendSummary(testType, reports, paramsMap) {
  const { apiKey, model, baseUrl, generationConfig, safetySettings } = GEMINI_CONFIG;

  if (!apiKey) {
    return generateFallbackTrendSummary(testType, reports, paramsMap);
  }

  // Build summary data for Gemini
  const summaryData = Object.entries(paramsMap).map(([param, data]) => {
    const values = data.values.filter(v => v !== null);
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    const change = previous !== null && latest !== null ? (latest - previous).toFixed(2) : 'N/A';
    return `${param}: latest=${latest} ${data.unit}, previous=${previous} ${data.unit}, change=${change}`;
  }).join('\n');

  const prompt = `Generate a brief, plain-language trend summary for ${testType} reports. Focus on:
1. Which values increased/decreased since the last report
2. Any values outside normal reference ranges
3. Overall trend assessment (improving, stable, or concerning)

Data:
${summaryData}

Return a concise 2-3 sentence summary suitable for a patient dashboard.`;

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
      return generateFallbackTrendSummary(testType, reports, paramsMap);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return rawText || generateFallbackTrendSummary(testType, reports, paramsMap);
  } catch (err) {
    return generateFallbackTrendSummary(testType, reports, paramsMap);
  }
}

function generateFallbackTrendSummary(testType, reports, paramsMap) {
  const paramCount = Object.keys(paramsMap).length;
  const reportCount = reports.length;
  
  if (reportCount < 2) {
    return `Only one ${testType} report available. Upload more reports to see trends over time.`;
  }

  return `Based on ${reportCount} ${testType} reports with ${paramCount} parameters tracked. Review individual parameter trends in the chart above for detailed analysis.`;
}


// GET /api/reports/insights/:profileId - AI overview across recent reports + readings
export async function getHealthInsights(req, res) {
  try {
    const profile = await PatientProfile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const since = new Date(Date.now() - 60 * 24 * 3600 * 1000);
    const [reports, readings] = await Promise.all([
      MedicalReport.find({ profileId: profile._id }).sort({ createdAt: -1 }).limit(8)
        .select('title category testType testDate createdAt aiSummary aiOverallStatus aiHighlights'),
      HealthReading.find({ profileId: profile._id, measuredAt: { $gte: since } }).sort({ measuredAt: -1 }).limit(30),
    ]);

    if (reports.length === 0 && readings.length === 0) {
      return res.json({ success: true, empty: true, message: 'Upload a report or add a health reading to get your AI overview.' });
    }

    const insights = await buildHealthInsights({ profile, reports, readings });
    res.json({ success: true, insights, basedOn: { reports: reports.length, readings: readings.length }, generatedAt: new Date() });
  } catch (error) {
    const status = error.code === 'NO_KEY' ? 503 : 502;
    res.status(status).json({ success: false, error: error.code === 'NO_KEY' ? 'AI is not configured on the server (GEMINI_API_KEY).' : `AI insights are unavailable right now: ${error.message}` });
  }
}

// POST /api/reports/upload-file - backend-signed Cloudinary upload (no browser preset needed)
export async function uploadReportFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const userId = req.user?.id || req.user?._id;
    const category = categorizeReport(req.file.originalname);
    const result = await uploadToCloudinary(req.file.path, userId, req.body.profileId, category);
    if (result.storage === 'cloudinary') fs.unlink(req.file.path, () => {});
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('upload-file failed:', error);
    res.status(500).json({ success: false, error: 'Failed to store the file' });
  }
}
