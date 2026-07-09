export interface IStorageProvider {
  uploadFile(filename: string, mimetype: string, buffer: Buffer): Promise<string>;
  deleteFile(filename: string): Promise<void>;
  getFileUrl(filename: string, expiresIn?: number): Promise<string>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
