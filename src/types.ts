/* eslint-disable @typescript-eslint/no-unused-vars */

interface SearchEngine {
  /** Non-negative */
  id: number;
  title: string;
  url: string;
  usePost?: boolean;
  postContentType?: string;
  postData?: string;
}

interface SearchGroup {
  /** Non-negative */
  id: number;
  title: string;
  engineIds: number[];
}

interface Setting {
  currentSearchGroupId: number;
  searchEngines: SearchEngine[];
  searchGroups: SearchGroup[];
}
