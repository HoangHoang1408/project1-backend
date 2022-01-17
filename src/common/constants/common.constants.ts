import { Request, Response } from 'express';

export interface CustomContext {
  res: Response;
  req: Request;
}

export const REFRESH_JWT = 'REFRESH_JWT';
export const ACCESS_JWT = 'ACCESS_JWT';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
