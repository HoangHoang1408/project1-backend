export interface EmailOptions {
  user: string;
  pass: string;
  from: string;
  clientDomain: string;
}
export interface SendOptions {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}
