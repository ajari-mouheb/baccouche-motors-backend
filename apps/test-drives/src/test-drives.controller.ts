import { Controller, Get } from '@nestjs/common';
import { TestDrivesService } from './test-drives.service';

@Controller()
export class TestDrivesController {
  constructor(private readonly testDrivesService: TestDrivesService) {}

  @Get()
  getHello(): string {
    return this.testDrivesService.getHello();
  }
}
