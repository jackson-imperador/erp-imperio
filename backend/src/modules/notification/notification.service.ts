import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { SendNotificationDto } from "./dto/notification.dto";
import { NotificationStatus } from "@prisma/client";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async send(companyId: string, dto: SendNotificationDto) {
    // 1. Log to Notification History
    const notification = await this.prisma.notification.create({
      data: {
        companyId,
        userId: dto.userId, // Can be null if external
        type: dto.type,
        priority: dto.priority,
        status: NotificationStatus.PENDING,
        title: dto.title,
        body: dto.body,
        dataJson: dto.dataJson,
      },
    });

    // 2. Add to Notification Queue for processing (BullMQ simulation via DB)
    await this.prisma.notificationQueue.create({
      data: {
        companyId,
        userId: dto.userId,
        type: dto.type,
        status: "PENDING",
        recipient: dto.recipient || "system",
        subject: dto.title,
        body: dto.body,
        metadata: dto.dataJson || {},
      },
    });

    return notification;
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    userId?: string,
  ) {
    const where: any = { companyId };
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  // Automatic Listener for System Events
  @OnEvent("sale.confirmed")
  async handleSaleConfirmed(event: {
    companyId: string;
    saleOrderId: string;
    customerId: string;
  }) {
    if (!event.customerId) return;

    // In a real scenario, we fetch the customer email and send a notification
    await this.prisma.notificationQueue.create({
      data: {
        companyId: event.companyId,
        type: "EMAIL",
        status: "PENDING",
        recipient: "customer@example.com",
        subject: `Sale Confirmed: ${event.saleOrderId}`,
        body: `Your sale order has been confirmed!`,
      },
    });
  }
}
