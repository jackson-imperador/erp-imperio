import { Global, Module } from "@nestjs/common";
import { CircuitBreakerService } from "./resilience/circuit-breaker.service";
import { RetryService } from "./resilience/retry.service";

@Global()
@Module({
  providers: [CircuitBreakerService, RetryService],
  exports: [CircuitBreakerService, RetryService],
})
export class SharedInfrastructureModule {}
