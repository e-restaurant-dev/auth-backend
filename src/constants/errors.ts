export enum CriticalErrorCode {
    DATABASE_REFUSE_CONNECT = 1000,
    CACHE_REFUSE_CONNECT,

    GET_VALUE_FROM_STATE,

    MISSING_REQUIRED_ENV_VARIABLES,
}

export enum AuthErrorCode {
    FAILED_TO_LOGIN = 2000,
}

export enum ValidationErrorCode {
    DEFAULT_VALIDATION_ERROR = 3000,
}
