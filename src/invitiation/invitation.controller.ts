import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@UseGuards(AuthGuard)
@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  private getUserEmail(req: Request): string {
    return req['user'].email;
  }

  @Post()
  create(
    @Req() req: Request,
    @Body() createInvitationDto: CreateInvitationDto,
  ) {
    const email = this.getUserEmail(req);
    return this.invitationService.create({
      ...createInvitationDto,
      senderEmail: email,
    });
  }

  @Get()
  findAll() {
    return this.invitationService.findAll();
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const email = this.getUserEmail(req);
    return this.invitationService.findOne(id, email);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateInvitationDto: UpdateInvitationDto,
  ) {
    const email = this.getUserEmail(req);
    return this.invitationService.update(email, id, updateInvitationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationService.remove(+id);
  }
}
