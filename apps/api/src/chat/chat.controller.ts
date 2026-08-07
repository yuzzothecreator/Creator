import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('sessions')
  list() {
    return this.chat.listSessions();
  }

  @Get('sessions/:id')
  get(@Param('id') id: string) {
    return this.chat.getSession(id);
  }

  @Post('messages')
  send(@Body() body: unknown) {
    return this.chat.send(body);
  }
}
