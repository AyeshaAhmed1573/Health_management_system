import AuditLog from '../Models/AuditLog.model.js';

/**
 * Create an audit log entry for sensitive actions
 * @param {Object} data - Audit log data
 * @param {String} data.userId - User ID who performed the action
 * @param {String} data.vendorId - Vendor ID (if applicable)
 * @param {String} data.action - Action type (enum from schema)
 * @param {String} data.entityType - Type of entity affected
 * @param {String} data.entityId - ID of entity affected
 * @param {Object} data.changes - Changes made
 * @param {Object} data.previousState - Previous state before change
 * @param {Object} data.newState - New state after change
 * @param {String} data.reason - Reason for action
 * @param {String} data.ipAddress - IP address of requester
 * @param {String} data.userAgent - User agent of requester
 */
export async function createAuditLog(data) {
  try {
    const auditLog = await AuditLog.create(data);
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit log failures shouldn't break the main operation
  }
}

/**
 * Get audit logs for a specific vendor
 */
export async function getVendorAuditLogs(vendorId, options = {}) {
  const { limit = 50, skip = 0, action, entityType } = options;

  const query = { vendorId };
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await AuditLog.countDocuments(query);

  return { logs, total };
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId, options = {}) {
  const { limit = 50, skip = 0, action, entityType } = options;

  const query = { userId };
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;

  const logs = await AuditLog.find(query)
    .populate('vendorId', 'businessName type')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await AuditLog.countDocuments(query);

  return { logs, total };
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(entityType, entityId, options = {}) {
  const { limit = 50, skip = 0 } = options;

  const logs = await AuditLog.find({ entityType, entityId })
    .populate('userId', 'name email')
    .populate('vendorId', 'businessName type')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await AuditLog.countDocuments({ entityType, entityId });

  return { logs, total };
}
