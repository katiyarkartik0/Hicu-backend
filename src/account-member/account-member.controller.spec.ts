import { Test, TestingModule } from '@nestjs/testing';
import { AccountMemberController } from './account-member.controller';
import { AccountMemberService } from './account-member.service';

describe('AccountMemberController', () => {
  let controller: AccountMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountMemberController],
      providers: [AccountMemberService],
    }).compile();

    controller = module.get<AccountMemberController>(AccountMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
