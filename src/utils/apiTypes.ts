export enum ResponseType {
    failed = 'failed',
    success = 'success',
}

export interface ResponseBody<T> {
    type: ResponseType;
    payload: T;
}
