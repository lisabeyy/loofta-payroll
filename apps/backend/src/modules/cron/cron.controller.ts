import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('cron')
@Controller('cron')
export class CronController {
  /**
   * Get cron processing status
   */
  @Get('status')
  @ApiOperation({ summary: 'Get cron processing status' })
  @ApiResponse({ status: 200, description: 'Processing status' })
  getStatus(): { status: string } {
    return { status: 'ok' };
  }
}
