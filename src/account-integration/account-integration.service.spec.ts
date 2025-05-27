import { Test, TestingModule } from '@nestjs/testing';
import { AccountIntegrationService } from './account-integration.service';

describe('AccountIntegrationService', () => {
  let service: AccountIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountIntegrationService],
    }).compile();

    service = module.get<AccountIntegrationService>(AccountIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
