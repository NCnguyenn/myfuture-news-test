import { Module } from '@nestjs/common';
import { ContentSanitizerService } from './content-sanitizer.service';

@Module({
  providers: [ContentSanitizerService],
  exports: [ContentSanitizerService],
})
export class ContentModule {}
