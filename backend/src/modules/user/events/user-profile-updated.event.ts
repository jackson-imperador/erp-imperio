export class UserProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly previousData: any,
    public readonly newData: any,
  ) {}
}
