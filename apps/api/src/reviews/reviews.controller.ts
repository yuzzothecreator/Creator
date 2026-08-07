import { Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('projects/:projectId/reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('latest')
  latest(@Param('projectId') projectId: string) {
    return this.reviews.latest(projectId);
  }

  @Post()
  run(@Param('projectId') projectId: string) {
    return this.reviews.run(projectId);
  }
}
