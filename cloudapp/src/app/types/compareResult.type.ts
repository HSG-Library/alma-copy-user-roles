import { UserRole } from './userRole.type';

export type CompareResult = {
  intersection: UserRole[];
  onlyInSoure: UserRole[];
  onlyInTarget: UserRole[];
  sourceDuplicates: UserRole[];
  targetDuplicates: UserRole[];
};
