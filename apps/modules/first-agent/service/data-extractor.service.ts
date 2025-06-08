import { Injectable } from '@nestjs/common';

import { LangChainService } from '../../../libs/langchain/langchain.service';
import * as pdf from 'pdf-parse';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parse';

export interface TransactionData {
  date: string;
  description: string;
  withdrawal: number;
  deposit: number;
  balance: number;
}

export interface ColumnMapping {
  date: string;
  description: string;
  withdrawal: string;
  deposit: string;
  balance: string;
}

@Injectable()
export class DataExtractorService {
  private defaultColumnMapping: ColumnMapping = {
    date: 'Date',
    description: 'Particulars/Description',
    withdrawal: 'Withdrawal',
    deposit: 'Deposit',
    balance: 'Balance',
  };

  constructor(private readonly langChainService: LangChainService) {}

  /**
   * Extract data from uploaded file
   * @param file The uploaded file
   * @param columnMapping Optional custom column mapping
   * @returns Extracted transaction data
   */
  async extractData(
    file: Express.Multer.File,
    columnMapping?: ColumnMapping,
  ): Promise<TransactionData[]> {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const effectiveMapping = columnMapping || this.defaultColumnMapping;

    switch (fileExtension) {
      case 'pdf':
        return this.extractFromPDF(file);
      case 'xlsx':
      case 'xls':
        return this.extractFromExcel(file, effectiveMapping);
      case 'csv':
        return this.extractFromCSV(file, effectiveMapping);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  /**
   * Extract data from PDF file
   */
  private async extractFromPDF(file: Express.Multer.File): Promise<TransactionData[]> {
    try {
      // Parse PDF
      const data = await pdf(file.buffer);
      const text = data.text;

      // Use LangChain to extract structured data
      const prompt = `
        Extract transaction data from the following text. 
        Return the data in JSON format with the following structure:
        {
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "withdrawal": number,
              "deposit": number,
              "balance": number
            }
          ]
        }

        Text to process:
        ${text}
      `;

      const response = await this.langChainService.generateResponse(prompt);
      const parsedData = JSON.parse(response);
      return parsedData.transactions;
    } catch (error) {
      throw new Error(`Error extracting data from PDF: ${error.message}`);
    }
  }

  /**
   * Extract data from Excel file
   */
  private async extractFromExcel(
    file: Express.Multer.File,
    _mapping: ColumnMapping,
  ): Promise<TransactionData[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      return data.map((row: any) => ({
        date: row[_mapping.date],
        description: row[_mapping.description],
        withdrawal: parseFloat(row[_mapping.withdrawal]) || 0,
        deposit: parseFloat(row[_mapping.deposit]) || 0,
        balance: parseFloat(row[_mapping.balance]) || 0,
      }));
    } catch (error) {
      throw new Error(`Error extracting data from Excel: ${error.message}`);
    }
  }

  /**
   * Extract data from CSV file
   */
  private async extractFromCSV(
    file: Express.Multer.File,
    _mapping: ColumnMapping,
  ): Promise<TransactionData[]> {
    return new Promise((resolve, reject) => {
      const transactions: TransactionData[] = [];
      const parser = csv.parse({
        columns: true,
        skip_empty_lines: true,
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read())) {
          transactions.push({
            date: record[_mapping.date],
            description: record[_mapping.description],
            withdrawal: parseFloat(record[_mapping.withdrawal]) || 0,
            deposit: parseFloat(record[_mapping.deposit]) || 0,
            balance: parseFloat(record[_mapping.balance]) || 0,
          });
        }
      });

      parser.on('error', error => {
        reject(new Error(`Error extracting data from CSV: ${error.message}`));
      });

      parser.on('end', () => {
        resolve(transactions);
      });

      parser.write(file.buffer);
      parser.end();
    });
  }

  /**
   * Validate extracted data
   */
  validateData(data: TransactionData[]): boolean {
    return data.every(transaction => {
      return (
        transaction.date &&
        transaction.description &&
        typeof transaction.withdrawal === 'number' &&
        typeof transaction.deposit === 'number' &&
        typeof transaction.balance === 'number'
      );
    });
  }
}
