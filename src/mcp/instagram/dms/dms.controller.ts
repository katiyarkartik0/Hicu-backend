import { Controller } from '@nestjs/common';
import { DmsService } from './dms.service';

@Controller("/dm-control")
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}
}
