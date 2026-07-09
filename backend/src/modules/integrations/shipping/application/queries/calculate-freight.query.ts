export class CalculateFreightQuery {
  constructor(
    public readonly provider: string,
    public readonly originZipCode: string,
    public readonly destinationZipCode: string,
    public readonly weight: number,
  ) {}
}
