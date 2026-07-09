import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreateWebhookEndpointDto } from "./dto/webhook.dto";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  async createEndpoint(companyId: string, dto: CreateWebhookEndpointDto) {
    return this.prisma.webhookEndpoint.create({
      data: {
        companyId,
        ...dto,
      },
    });
  }

  async findAllEndpoints(companyId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { companyId },
    });
  }

  // ── Global Event Interceptor for Webhooks ─────────────────────────

  /**
   * Listen to all events emitted in the system (wildcard)
   * If any webhook is subscribed to this event, schedule delivery.
   */
  @OnEvent("**")
  async handleGlobalEvent(payload: any, eventData: any) {
    // Note: In @nestjs/event-emitter with wildcard, the event name might be injected via context or args.
    // Assuming payload has { companyId, eventName, data } or we pass it explicitly.
    // For this example, we assume payload is a standard object containing companyId and we know the eventName.

    // Safety check: this requires a standard event structure.
    const companyId = payload?.companyId;
    if (!companyId) return; // Cannot dispatch webhook without tenant context

    // Just a placeholder for actual event name retrieval from emitter context.
    const eventName = "dynamic.event";

    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: {
        companyId,
        isActive: true,
        events: { has: eventName },
      },
    });

    if (endpoints.length === 0) return;

    for (const endpoint of endpoints) {
      // Create a delivery record (acting as a queue outbox)
      await this.prisma.webhookDelivery.create({
        data: {
          companyId,
          webhookEndpointId: endpoint.id,
          eventId: crypto.randomUUID(),
          eventName,
          payload: payload,
          status: "PENDING",
        },
      });

      // We would then push this delivery ID to a BullMQ worker to actually make the HTTP request
      // and handle retries, dead-letter, etc.
      this.logger.log(
        `Scheduled webhook delivery to ${endpoint.url} for event ${eventName}`,
      );
    }
  }
}
