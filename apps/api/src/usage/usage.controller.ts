import { Controller, Get } from '@nestjs/common';
import { prisma } from '@creator/database';
import { AuthService } from '../auth/auth.service';

@Controller('usage')
export class UsageController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  async summary() {
    const user = await this.auth.demoUser();
    const events = await prisma.usageEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const totals = events.reduce(
      (acc, e) => {
        acc.tokensIn += e.tokensIn;
        acc.tokensOut += e.tokensOut;
        acc.costUsd += e.costUsd;
        return acc;
      },
      { tokensIn: 0, tokensOut: 0, costUsd: 0 },
    );
    return { totals, events };
  }
}
