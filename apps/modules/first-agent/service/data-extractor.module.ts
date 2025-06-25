import { Module } from '@nestjs/common';
import { DataExtractorController } from '../data-extractor.controller';
import { DataExtractorService } from './data-extractor.service';

@Module({
  controllers: [DataExtractorController],
  providers: [DataExtractorService],
  exports: [DataExtractorService],
})
export class DataExtractorModule {}
