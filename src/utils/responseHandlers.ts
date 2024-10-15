import { Response } from 'express';

export const handleResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: object = {}
): void => {
  res.status(statusCode).send({
    message: message,
    data: data,
  })
}
