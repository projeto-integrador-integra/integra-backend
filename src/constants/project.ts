export const PROJECT_STATUS = ['draft', 'active', 'closed', 'cancelled'] as const
export const PROJECT_APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const

export type ProjectStatus = (typeof PROJECT_STATUS)[number]
export type ProjectApprovalStatus = (typeof PROJECT_APPROVAL_STATUSES)[number]
