export const PROJECT_STATUS = ['active', 'completed', 'archived'] as const
export const PROJECT_APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const

export type ProjectStatus = (typeof PROJECT_STATUS)[number]
export type ProjectApprovalStatus = (typeof PROJECT_APPROVAL_STATUSES)[number]
