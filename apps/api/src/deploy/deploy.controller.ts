import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DeployService } from './deploy.service';

@Controller()
export class DeployController {
  constructor(private readonly deploy: DeployService) {}

  @Get('projects/:projectId/deployments')
  list(@Param('projectId') projectId: string) {
    return this.deploy.list(projectId);
  }

  @Post('projects/:projectId/deployments')
  create(
    @Param('projectId') projectId: string,
    @Body() body: { provider?: string },
  ) {
    return this.deploy.create(projectId, body.provider ?? 'vercel');
  }

  @Get('billing/plans')
  plans() {
    return this.deploy.billingPlans();
  }
}
