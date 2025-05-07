import { UserBase } from './userBase';
import { UserDetails } from './userDetails.type';

export type UserDetailsChecked = UserDetails &
  UserBase & {
    rolesChecked?: boolean;
    rolesValid?: boolean;
  };
