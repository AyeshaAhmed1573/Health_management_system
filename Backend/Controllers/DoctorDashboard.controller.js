import { getDoctorDashboardOverview } from '../Services/doctorDashboardService.js';
import { getUserId } from '../utils/access.js';

export async function getDoctorDashboardOverviewController(req, res) {
  try {
    const data = await getDoctorDashboardOverview(getUserId(req));
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
}
