import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.projects.get(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.projects.create(body);
  }

  @Get(':id/export')
  async export(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.projects.exportZip(id);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="creator-${id}.zip"`);
    res.send(buffer);
  }
}
