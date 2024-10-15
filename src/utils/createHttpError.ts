import { HttpError } from "../types/errorsTypes";

export const createHttpError = (status: number, message: string): HttpError => {
  return {
    status,
    message,
    name: "HttpError",
  };
};
