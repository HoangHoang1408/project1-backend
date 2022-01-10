import { Request, Response } from 'express';

export interface CustomContext {
  res: Response;
  req: Request;
}
