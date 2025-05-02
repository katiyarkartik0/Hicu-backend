import { Test, TestingModule } from '@nestjs/testing';
import { AccountMemberService } from './account-member.service';

describe('AccountMemberService', () => {
  let service: AccountMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountMemberService],
    }).compile();

    service = module.get<AccountMemberService>(AccountMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
