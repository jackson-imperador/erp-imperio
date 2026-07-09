export interface INfseProvider {
  buildXml(data: any): string;
  transmit(xml: string): Promise<any>;
  cancel(nfseId: string, reason: string): Promise<any>;
}
