import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check (root)' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthRoot() {
    return { status: 'ok', service: 'gateway' };
  }

  @Get('api')
  @ApiOperation({ summary: 'Health check (api)' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthApi() {
    return { status: 'ok', service: 'gateway' };
  }
}
