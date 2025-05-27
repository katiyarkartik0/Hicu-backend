import { Test, TestingModule } from '@nestjs/testing';
import { AccountIntegrationController } from './account-integration.controller';
import { AccountIntegrationService } from './account-integration.service';

describe('AccountIntegrationController', () => {
  let controller: AccountIntegrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountIntegrationController],
      providers: [AccountIntegrationService],
    }).compile();

    controller = module.get<AccountIntegrationController>(AccountIntegrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
