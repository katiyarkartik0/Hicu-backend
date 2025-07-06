import { Controller } from '@nestjs/common';
import { DmsService } from './dms.service';

@Controller()
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}
}
