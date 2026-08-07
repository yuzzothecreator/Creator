import { Body, Controller, Post } from '@nestjs/common';
import { GeneratorsService } from './generators.service';

@Controller('generators')
export class GeneratorsController {
  constructor(private readonly generators: GeneratorsService) {}

  @Post('ui')
  ui(@Body() body: { prompt: string }) {
    return this.generators.generateUi(body.prompt ?? 'Dashboard panel');
  }

  @Post('database')
  database(@Body() body: { entities?: string[] }) {
    return this.generators.generateDatabase(body.entities ?? []);
  }

  @Post('api')
  api(@Body() body: { style?: 'rest' | 'graphql' | 'trpc' }) {
    return this.generators.generateApi(body.style ?? 'rest');
  }

  @Post('devops')
  devops(@Body() body: { appName?: string }) {
    return this.generators.generateDevops(body.appName ?? 'creator-app');
  }

  @Post('security-scan')
  security(@Body() body: { files: Array<{ path: string; content: string }> }) {
    return this.generators.scanSecurity(body.files ?? []);
  }

  @Post('performance-scan')
  performance(@Body() body: { files: Array<{ path: string; content: string }> }) {
    return this.generators.scanPerformance(body.files ?? []);
  }
}
