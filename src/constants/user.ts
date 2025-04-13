export const USER_ROLES = ['admin', 'mentor', 'dev', 'company'] as const
export const USER_APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const

export type UserRole = (typeof USER_ROLES)[number]
export type UserApprovalStatus = (typeof USER_APPROVAL_STATUSES)[number]
