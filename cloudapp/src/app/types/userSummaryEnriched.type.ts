import { ResponseValue } from './responseValue.type'
import { UserSummary } from './userSummary.type'
import { UserRole } from './usrRole.type'

export type UserSummaryEnriched = UserSummary & {
	user_group?: ResponseValue
	user_role?: UserRole[]
}
