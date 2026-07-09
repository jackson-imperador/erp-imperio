export class TrackShipmentQuery {
  constructor(
    public readonly provider: string,
    public readonly trackingCode: string,
  ) {}
}
