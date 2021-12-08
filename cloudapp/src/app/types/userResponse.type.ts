import { UserSummary } from './userSummary.type'

export type UserListResponse = {
	total_record_count: number
	user: UserSummary[]
}
