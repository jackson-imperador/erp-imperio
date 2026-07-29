import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { PayrollGeneratedEvent, PayrollPaidEvent } from "./events/hr-events";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createEmployee(companyId: string, data: any, userId: string) {
    // Basic stub for creating an employee profile and emitting the event
    const employee = await this.prisma.employeeProfile.create({
      data: {
        companyId,
        userId: data.userId || userId,
        departmentId: data.departmentId,
        jobTitle: data.jobTitle,
      }
    });

    this.eventEmitter.emit("employee.created", {
      companyId,
      employeeId: employee.id,
      performedBy: userId
    });

    return employee;
  }

  async generatePayroll(companyId: string, totalAmount: number, dueDate: Date, userId: string) {
    // Generate a unique ID for the payroll event since we don't have a specific table for it
    const payrollId = uuidv4();

    this.eventEmitter.emit(
      "payroll.generated",
      new PayrollGeneratedEvent(companyId, payrollId, totalAmount, dueDate, userId)
    );

    return { message: "Payroll generation initiated via EDA", payrollId };
  }

  async payPayroll(companyId: string, payrollId: string, bankAccountId: string, amount: number, userId: string) {
    this.eventEmitter.emit(
      "payroll.paid",
      new PayrollPaidEvent(companyId, payrollId, bankAccountId, amount, userId)
    );

    return { message: "Payroll payment initiated via EDA" };
  }
}
