import { HttpStatusCode } from "axios";

export enum ErrorControl {
    SUCCESS = 0,
    ERROR = 1,
    PERSONALIZED = 2
}

export type DaoResponse = [ErrorControl, any, HttpStatusCode] 