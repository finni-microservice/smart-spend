import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataExtractorService } from './service/data-extractor.service';

@Controller('data-extractor')
export class DataExtractorController {
  constructor(private readonly dataExtractorService: DataExtractorService) {}

  @Post('extract')
  @UseInterceptors(FileInterceptor('file'))
  async extractData(
    @UploadedFile() file: Express.Multer.File,
    // @Body() columnMapping?: ColumnMapping,
  ) {
    try {
      const data = await this.dataExtractorService.extractData(file);

      // Validate the extracted data
      if (!this.dataExtractorService.validateData(data)) {
        throw new Error('Invalid data format extracted from file');
      }

      return {
        success: true,
        data,
        preview: data.slice(0, 5), // Return first 5 rows as preview
        totalRows: data.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
