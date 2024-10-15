import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/errorsTypes";

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(error.status || 500).json({
    message: error.message,
  });
};
