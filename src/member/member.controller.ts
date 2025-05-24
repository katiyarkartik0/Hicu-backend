import { Get, Param } from '@nestjs/common';
import { MemberService } from './member.service';

export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get(':id')
  getMemberById(@Param('id') memberId: number) {
    return this.memberService.findOne(memberId);
  }
}
