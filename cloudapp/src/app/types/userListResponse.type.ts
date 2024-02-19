import { UserDetails } from './userDetails.type'

export type UserListResponse = {
	total_record_count: number
	user: UserDetails[]
}
