import { Injectable } from "@nestjs/common";
import { FinancialRepository } from "./financial.repository";

@Injectable()
export class FinancialService {
  constructor(private readonly financialRepository: FinancialRepository) {}
  // TODO: implement methods
}
