export interface IEmailProvider {
  sendEmail(to: string, subject: string, body: string, isHtml?: boolean): Promise<boolean>;
}
