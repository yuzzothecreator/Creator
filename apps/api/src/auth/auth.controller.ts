import { Controller, Get, Req, Res, All } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createAuthNodeHandler } from '@creator/auth';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('auth/me')
  async me(): Promise<{ user: { id: string; email: string; name: string | null; mode: string } }> {
    const user = await this.authService.demoUser();
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mode: user.mode,
      },
    };
  }

  @All('auth/*')
  async handle(@Req() req: Request, @Res() res: Response) {
    const handler = createAuthNodeHandler(this.authService.auth);
    return handler(req, res);
  }
}
