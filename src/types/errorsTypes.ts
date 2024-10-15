export interface AppError {
  status?: number;
  message: string;
}

export interface HttpError {
  status: number;
  message: string;
  name: string;
}
