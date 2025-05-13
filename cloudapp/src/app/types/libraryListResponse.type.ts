import { Library } from './library.type';

export type LibraryListResponse = {
  total_record_count: number;
  library: Library[];
};
