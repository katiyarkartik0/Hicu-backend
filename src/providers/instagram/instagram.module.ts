import { Module } from '@nestjs/common';

import { InstagramController } from './instagram.controller';

import { InstagramService } from './instagram.service';
import { CommentService } from './serviceBundle/comment.service';
import { DmService } from './serviceBundle/dm.service';
import { PostService } from './serviceBundle/post.service';
import { PrivateInfoService } from './serviceBundle/privateInfo.service';

import { ConfigurationsModule } from 'src/configurations/configurations.module';

@Module({
  imports: [
    ConfigurationsModule,
  ],
  controllers: [InstagramController],
  providers: [
    InstagramService,
    CommentService,
    DmService,
    PostService,
    PrivateInfoService,
  ],
  exports: [InstagramService],
})
export class InstagramModule {}
