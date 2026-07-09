export class GetFileUrlQuery {
  constructor(
    public readonly filename: string,
    public readonly expiresIn?: number,
  ) {}
}
