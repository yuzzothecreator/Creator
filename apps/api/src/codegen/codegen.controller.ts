import { Controller, Get, Param, Query } from '@nestjs/common';
import { CodegenService } from './codegen.service';

@Controller('projects/:projectId/files')
export class CodegenController {
  constructor(private readonly codegen: CodegenService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.codegen.listFiles(projectId);
  }

  @Get('explain')
  explain(@Param('projectId') projectId: string, @Query('path') path: string) {
    return this.codegen.explainFile(projectId, path);
  }

  @Get('by-path')
  get(@Param('projectId') projectId: string, @Query('path') path: string) {
    return this.codegen.getFile(projectId, path);
  }
}
