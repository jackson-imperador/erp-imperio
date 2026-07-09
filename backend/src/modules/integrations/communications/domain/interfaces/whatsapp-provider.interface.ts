export interface IWhatsAppProvider {
  sendMessage(to: string, message: string): Promise<boolean>;
}
