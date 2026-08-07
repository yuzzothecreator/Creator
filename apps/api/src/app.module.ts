import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { ChatModule } from './chat/chat.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsageModule } from './usage/usage.module';
import { AuthModule } from './auth/auth.module';
import { CodegenModule } from './codegen/codegen.module';
import { GeneratorsModule } from './generators/generators.module';
import { DeployModule } from './deploy/deploy.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    ProjectsModule,
    ChatModule,
    PipelineModule,
    CodegenModule,
    ReviewsModule,
    UsageModule,
    GeneratorsModule,
    DeployModule,
  ],
})
export class AppModule {}
