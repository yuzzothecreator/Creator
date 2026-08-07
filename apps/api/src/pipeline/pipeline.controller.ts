import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { PipelineStepType } from '@creator/database';
import { PipelineService } from './pipeline.service';

@Controller('projects/:projectId/pipeline')
export class PipelineController {
  constructor(private readonly pipeline: PipelineService) {}

  @Get()
  get(@Param('projectId') projectId: string) {
    return this.pipeline.getRun(projectId);
  }

  @Post('advance')
  advance(
    @Param('projectId') projectId: string,
    @Body() body: { userAnswers?: string },
  ) {
    return this.pipeline.advance(projectId, body?.userAnswers);
  }

  @Post('approve')
  approve(@Param('projectId') projectId: string) {
    return this.pipeline.approve(projectId);
  }

  @Post('steps/:stepType/regenerate')
  regenerate(
    @Param('projectId') projectId: string,
    @Param('stepType') stepType: PipelineStepType,
  ) {
    return this.pipeline.regenerateStep(projectId, stepType);
  }
}
