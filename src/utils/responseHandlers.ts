import { Response } from 'express';

export const handleResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: object
): void => {
  const body: { message: string; data?: object } = { message }
  if (data !== undefined) body.data = data
  res.status(statusCode).send(body)
}
