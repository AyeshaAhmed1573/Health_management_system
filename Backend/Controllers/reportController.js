import MedicalReport from '../Models/MedicalReport.model.js';
import { categorizeReport } from '../utils/reportCategorizer.js';
import { analyzeReportWithAI, buildComparisonData } from '../Services/reportAnalysisService.js';
import { deleteFromCloudinary } from '../Services/cloudinaryService.js';

// POST /api/reports - Upload & Analyze Report
export async function uploadReport(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

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
    } = req.body;

    if (!title || !profileId || !fileUrl || !fileName || !fileType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, profileId, fileUrl, fileName, fileType',
      });
    }

    // Auto categorize based on fileName
    const category = categorizeReport(fileName);
    const autoCategorized = category !== 'Other';
    const folderPath = `reports/${userId}/${profileId}/${category.replace(/\s+/g, '_')}`;

    // Perform AI analysis if text is provided
    let aiResults = {};
    if (extractedText && extractedText.trim()) {
      aiResults = await analyzeReportWithAI(category, extractedText);
    }

    const report = new MedicalReport({
      userId,
      profileId,
      title,
      category,
      fileUrl,
      publicId: publicId || `reports/${userId}/${profileId}/${Date.now()}`,
      fileName,
      fileType: fileType.toLowerCase(),
      fileSize: fileSize || 0,
      folderPath,
      autoCategorized,
      notes: notes || '',
      extractedText: extractedText || '',
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
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/reports/folders/:profileId - Get grouped report folders
export async function getReportFolders(req, res) {
  try {
    const { profileId } = req.params;

    const reports = await MedicalReport.find({ profileId }).sort({ createdAt: -1 });

    const foldersMap = {};

    reports.forEach((report) => {
      const cat = report.category || 'Other';
      if (!foldersMap[cat]) {
        foldersMap[cat] = {
          count: 0,
          latestDate: report.createdAt,
          latestStatus: report.aiOverallStatus || 'Normal',
          reports: [],
        };
      }

      foldersMap[cat].count += 1;
      foldersMap[cat].reports.push(report);
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

    const textToAnalyze = report.extractedText || report.notes || report.title;
    const aiResults = await analyzeReportWithAI(report.category, textToAnalyze);

    report.aiSummary = aiResults.summary;
    report.aiHighlights = aiResults.highlights;
    report.aiOverallStatus = aiResults.overallStatus;
    report.aiRecommendations = aiResults.recommendations;
    report.aiAnalyzedAt = new Date();

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
