import { UserDetails } from './userDetails.type';

export type UserDetailsChecked = UserDetails & {
  rolesChecked?: boolean;
  rolesValid?: boolean;
};
