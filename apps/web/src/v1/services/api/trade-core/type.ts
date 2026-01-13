/** 返回数据 */
export type PageDataResponse<T> = Prettify<{
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: T[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}>
