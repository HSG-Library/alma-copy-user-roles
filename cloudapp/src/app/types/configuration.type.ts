import { UserSummaryEnriched } from './userSummaryEnriched.type'

export type Configuration = {
	allowedRoles: number[]
	allowedUsers: UserSummaryEnriched[]
}
