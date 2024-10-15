import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const runValidation = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};