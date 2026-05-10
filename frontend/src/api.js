// Dynamic API base URL configuration
export const getApiBaseUrl = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  // API always uses port 80 (Apache), not dev server port
  return `${protocol}//${host}/instrument_system/backend/api`;
};

export const getBaseUrl = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${host}/instrument_system`;
};

export const getImageUrl = (path) => {
  if (!path) return null;
  // If path already contains 'backend/uploads', just prepend base URL
  if (path.startsWith('backend/uploads')) {
    return `${getBaseUrl()}/${path}`;
  }
  // Fallback for older data or different formats
  return `${getBaseUrl()}/backend/uploads/images/${path}`;
};

export const apiEndpoints = {
  login: () => `${getApiBaseUrl()}/auth/login.php`,
  logout: () => `${getApiBaseUrl()}/auth/logout.php`,
  register: () => `${getApiBaseUrl()}/auth/register.php`,
  getTree: () => `${getApiBaseUrl()}/common/get_tree.php`,
  addItem: () => `${getApiBaseUrl()}/staff/add_item.php`,
  getUsers: () => `${getApiBaseUrl()}/admin/get_users.php`,
  updateUser: () => `${getApiBaseUrl()}/admin/update_user.php`,
  deleteUser: () => `${getApiBaseUrl()}/admin/delete_user.php`,
  getInstrumentDetails: () => `${getApiBaseUrl()}/common/get_instrument_details.php`,
  usageLog: () => `${getApiBaseUrl()}/student/usage_log.php`,
  booking: () => `${getApiBaseUrl()}/student/booking.php`,
  reportMaintenance: () => `${getApiBaseUrl()}/staff/report_maintenance.php`,
  getBookings: () => `${getApiBaseUrl()}/staff/get_bookings.php`,
  updateBooking: () => `${getApiBaseUrl()}/staff/update_booking.php`,
  getUsageReports: () => `${getApiBaseUrl()}/staff/get_usage_reports.php`,
  manageSpareParts: () => `${getApiBaseUrl()}/staff/manage_spare_parts.php`,
  resolveMaintenance: () => `${getApiBaseUrl()}/staff/resolve_maintenance.php`,
  getNotifications: () => `${getApiBaseUrl()}/common/get_notifications_list.php`,
  markRead: () => `${getApiBaseUrl()}/common/mark_notification_read.php`,
  sendNotification: () => `${getApiBaseUrl()}/staff/send_notification.php`,
  getEquipmentDetails: () => `${getApiBaseUrl()}/staff/get_equipment_details.php`,
  updateEquipment: () => `${getApiBaseUrl()}/staff/update_equipment.php`,
  deleteEquipment: () => `${getApiBaseUrl()}/staff/delete_equipment.php`,
  getBuildings: () => `${getApiBaseUrl()}/staff/get_buildings.php`,
  getRooms: () => `${getApiBaseUrl()}/staff/get_rooms.php`,
  getCategories: () => `${getApiBaseUrl()}/staff/get_categories.php`,
  addBuilding: () => `${getApiBaseUrl()}/staff/add_building.php`,
  updateBuilding: () => `${getApiBaseUrl()}/staff/update_building.php`,
  deleteBuilding: () => `${getApiBaseUrl()}/staff/delete_building.php`,
  addRoom: () => `${getApiBaseUrl()}/staff/add_room.php`,
  updateRoom: () => `${getApiBaseUrl()}/staff/update_room.php`,
  deleteRoom: () => `${getApiBaseUrl()}/staff/delete_room.php`,
  logEquipmentStatus: () => `${getApiBaseUrl()}/staff/log_equipment_status.php`,
  getEquipmentStatusHistory: () => `${getApiBaseUrl()}/staff/get_equipment_status_history.php`,
  getUsageStatistics: () => `${getApiBaseUrl()}/staff/get_usage_statistics.php`,
  reportIssue: () => `${getApiBaseUrl()}/student/report_issue.php`,
  getEquipmentComments: () => `${getApiBaseUrl()}/student/get_equipment_comments.php`,
  addEquipmentComment: () => `${getApiBaseUrl()}/student/add_equipment_comment.php`,
  getPersonalStatistics: () => `${getApiBaseUrl()}/student/get_personal_statistics.php`,
  getAuditLogs: () => `${getApiBaseUrl()}/admin/get_audit_logs.php`,
  getStaffApprovals: () => `${getApiBaseUrl()}/admin/get_staff_approvals.php`,
  approveStaff: () => `${getApiBaseUrl()}/admin/approve_staff.php`,
  suspendUser: () => `${getApiBaseUrl()}/admin/suspend_user.php`,
  getUserActivity: () => `${getApiBaseUrl()}/admin/get_user_activity.php`,
  getSystemDashboard: () => `${getApiBaseUrl()}/admin/get_system_dashboard.php`,
  getExecutiveDashboard: () => `${getApiBaseUrl()}/ceo/get_executive_dashboard.php`,
  getCostAnalysis: () => `${getApiBaseUrl()}/ceo/get_cost_analysis.php`,
  getLabComparison: () => `${getApiBaseUrl()}/ceo/get_lab_comparison.php`,
  getMonthlyStatistics: () => `${getApiBaseUrl()}/ceo/get_monthly_statistics.php`,
  getEquipmentRecommendations: () => `${getApiBaseUrl()}/ceo/get_equipment_recommendations.php`,
  getUsageTrends: () => `${getApiBaseUrl()}/ceo/get_usage_trends.php`,
};
