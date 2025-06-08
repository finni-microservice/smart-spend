import { Module } from '@nestjs/common';
import { DataExtractorController } from './first-agent/data-extractor.controller';
import { DataExtractorService } from './first-agent/service/data-extractor.service';
import { LangChainService } from '../libs/langchain/langchain.service';

@Module({
  controllers: [DataExtractorController],
  providers: [DataExtractorService, LangChainService],
  exports: [DataExtractorService],
})
export class DataExtractorModule {}
