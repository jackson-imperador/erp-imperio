import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import {
  CreateWorkflowDefinitionDto,
  StartWorkflowDto,
  ApproveRequestDto,
} from "./dto/workflow.dto";
import { ApprovalStatus } from "@prisma/client";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createDefinition(companyId: string, dto: CreateWorkflowDefinitionDto) {
    return this.prisma.workflowDefinition.create({
      data: {
        companyId,
        ...dto,
      },
    });
  }

  async startWorkflow(
    companyId: string,
    definitionCode: string,
    userId: string,
    dto: StartWorkflowDto,
  ) {
    const definition = await this.prisma.workflowDefinition.findUnique({
      where: { companyId_code: { companyId, code: definitionCode } },
    });

    if (!definition)
      throw new NotFoundException("Workflow definition not found");

    const instance = await this.prisma.workflowInstance.create({
      data: {
        companyId,
        workflowDefinitionId: definition.id,
        entityId: dto.entityId,
        entityType: definition.entityType,
        startedBy: userId,
        status: "PENDING",
      },
    });

    // Generate first approval request
    await this.generateApprovalRequestsForCurrentStep(instance.id, companyId);

    return instance;
  }

  private async generateApprovalRequestsForCurrentStep(
    instanceId: string,
    companyId: string,
  ) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflowDefinition: true },
    });

    if (!instance) return;

    const steps = instance.workflowDefinition.steps as any[];
    if (instance.currentStepIndex >= steps.length) {
      // Completed workflow
      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: "APPROVED", completedAt: new Date() },
      });
      this.eventEmitter.emit(
        `workflow.${instance.entityType.toLowerCase()}.approved`,
        {
          companyId,
          entityId: instance.entityId,
          instanceId,
        },
      );
      return;
    }

    const currentStep = steps[instance.currentStepIndex];

    if (currentStep.approverUserId) {
      await this.prisma.approvalRequest.create({
        data: {
          companyId,
          workflowInstanceId: instance.id,
          approverUserId: currentStep.approverUserId,
          status: ApprovalStatus.PENDING,
        },
      });
    } else if (currentStep.approverRoleId) {
      await this.prisma.approvalRequest.create({
        data: {
          companyId,
          workflowInstanceId: instance.id,
          approverRoleId: currentStep.approverRoleId,
          status: ApprovalStatus.PENDING,
        },
      });
    }
  }

  async approveRequest(
    companyId: string,
    requestId: string,
    userId: string,
    dto: ApproveRequestDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.approvalRequest.findFirst({
        where: { id: requestId, companyId, status: ApprovalStatus.PENDING },
      });

      if (!request)
        throw new NotFoundException("Pending approval request not found");

      // Update Request
      const updatedRequest = await tx.approvalRequest.update({
        where: { id: requestId },
        data: {
          status: ApprovalStatus.APPROVED,
          comments: dto.comments,
          actionTakenAt: new Date(),
        },
      });

      // Advance instance
      const instance = await tx.workflowInstance.findUnique({
        where: { id: request.workflowInstanceId },
      });

      await tx.workflowInstance.update({
        where: { id: instance.id },
        data: {
          currentStepIndex: instance.currentStepIndex + 1,
        },
      });

      // We trigger the next step async to decouple transaction
      this.eventEmitter.emit("workflow.step.advanced", {
        instanceId: instance.id,
        companyId,
      });

      return updatedRequest;
    });
  }

  // Listener to generate next step requests outside the transaction
  @OnEvent("workflow.step.advanced")
  async handleWorkflowAdvanced(event: {
    instanceId: string;
    companyId: string;
  }) {
    await this.generateApprovalRequestsForCurrentStep(
      event.instanceId,
      event.companyId,
    );
  }
}
