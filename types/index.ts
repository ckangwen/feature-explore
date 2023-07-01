export interface IResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
}
