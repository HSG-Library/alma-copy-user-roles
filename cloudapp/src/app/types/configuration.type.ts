import { UserDetailsChecked } from './userDetailsChecked';

export type Configuration = {
  allowedRoles: number[];
  allowedUsers: UserDetailsChecked[];
  checkScope: boolean;
};
