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
  given_to?: string;
  category?: string;
  matching_score?: number;
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
   * Extract text from various file formats
   * @param file The uploaded file
   * @returns Extracted text content
   */
  async extractText(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
      case 'pdf':
        return this.extractFromPDF(file);
      case 'xlsx':
      case 'xls':
        return this.extractFromExcel(file);
      case 'csv':
        return this.extractFromCSV(file);
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }
  }
  /**
   * Extract data from uploaded file
   * @param file The uploaded file
   * @param columnMapping Optional custom column mapping
   * @returns Extracted transaction data
   */
  async extractData(
    file: Express.Multer.File,
    // columnMapping?: ColumnMapping,
  ): Promise<TransactionData[]> {
    const text = await this.extractText(file);
    const data = await this.extractDataFromFile(text);

    return data;
  }

  /**
   * Extract data from PDF file
   */
  private async extractDataFromFile(text: string): Promise<TransactionData[]> {
    try {
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
              "balance": number,
              "given_to": "string"
            }
          ]
        }

        The given_to field is the name of the person or entity that the money was given to.
        If the money was given to a person, the given_to field should be the name of the person.
        If the money was given to an entity like a shop, a restaurant, a bank, etc., the given_to field should be the name of the entity.
        If the money is credited to your account, the given_to field should be "Self".
       
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

  private async AutoCategorizeTransactions(transactions: TransactionData[]): Promise<any> {
    const prompt = `
      Categorize the following transactions into categories.
      Return the data in JSON format with the following structure:
      {
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "withdrawal": number,
              "deposit": number,
              "balance": number,
              "given_to": "string",
              "category": "string",
              "matching_score": number
            }
          ]
        }

        The matching_score field is the score of the auto categorization based upon the description and the given_to field.
        Matching score will be in range from 0 to 100
        The category field is the category of the transaction based upon the description and the given_to field.
        Auto categorize the transactions based upon the description and the given_to field.
        The category field could be one of the following or might not be listed here:
        - Food
        - Transport
        - Entertainment
        - Shopping
        - Other

        Text to process:
        ${JSON.stringify(transactions)}
    `;

    const response = await this.langChainService.generateResponse(prompt);
    const parsedData = JSON.parse(response);
    return parsedData.transactions;
  }

  private async MatchTransactionsCategory(
    prevTansactions: TransactionData[],
    currentTransaction: TransactionData,
  ): Promise<any> {
    const prompt = `
      Match the category of the current transaction with the previous transactions.
      Return the data in JSON format with the following structure:
      {
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "withdrawal": number,
              "deposit": number,
              "balance": number,
              "given_to": "string",
              "category": "string",
              "matching_score": number
            }
          ]
        }

        The matching_score field is the score of the auto categorization based upon the category field of the previous transactions.
        Matching score will be in range from 0 to 100
        The category field is the category of the transaction based upon the description and the given_to field.
        Match the category of the current transaction with the previous transactions.
        

        Text to process:
        ${JSON.stringify(prevTansactions)}
        ${JSON.stringify(currentTransaction)}
    `;

    const response = await this.langChainService.generateResponse(prompt);
    const parsedData = JSON.parse(response);
    return parsedData.transactions;
  }

  /**
   * Extract data from PDF file
   */
  private async extractFromPDF(file: Express.Multer.File): Promise<string> {
    try {
      const data = await pdf(file.buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Error extracting text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract data from Excel file
   */
  private async extractFromExcel(file: Express.Multer.File): Promise<string> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to CSV format for consistent text output
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      return csvData;
    } catch (error) {
      throw new Error(`Error extracting text from Excel: ${error.message}`);
    }
  }

  /**
   * Extract data from CSV file
   */
  private async extractFromCSV(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      let textContent = '';

      const parser = csv.parse({
        columns: true,
        skip_empty_lines: true,
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read())) {
          // Convert each row to a string and add to text content
          textContent += Object.values(record).join(', ') + '\n';
        }
      });

      parser.on('error', error => {
        reject(new Error(`Error extracting text from CSV: ${error.message}`));
      });

      parser.on('end', () => {
        resolve(textContent);
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
