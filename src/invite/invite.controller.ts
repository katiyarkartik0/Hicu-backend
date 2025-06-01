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
  NotFoundException,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { MemberService } from 'src/member/member.service';

@UseGuards(AuthGuard)
@Controller('invite')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly memberService: MemberService,
  ) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() body: Omit<CreateInviteDto, 'inviterEmail'>,
  ) {
    const { id } = req['user'];
    const inviter = await this.memberService.findOne(id);
    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }
    const { email: inviterEmail } = inviter;
    return await this.inviteService.create({ ...body, inviterEmail });
  }

  @Get()
  findAll() {
    return this.inviteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inviteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInviteDto: UpdateInviteDto) {
    return this.inviteService.update(+id, updateInviteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inviteService.remove(+id);
  }
}
