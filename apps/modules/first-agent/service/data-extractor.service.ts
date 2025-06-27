import { Injectable } from '@nestjs/common';
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

  constructor() {}

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
    columnMapping?: ColumnMapping,
  ): Promise<TransactionData[]> {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    // Handle structured files (CSV, Excel) differently from unstructured (PDF)
    if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
      return this.extractStructuredData(file, columnMapping);
    } else if (fileExtension === 'pdf') {
      const text = await this.extractText(file);
      return this.parseTextToTransactions(text);
    }

    throw new Error(`Unsupported file format: ${fileExtension}`);
  }

  /**
   * Extract structured data from CSV/Excel files
   */
  private async extractStructuredData(
    file: Express.Multer.File,
    columnMapping?: ColumnMapping,
  ): Promise<TransactionData[]> {
    const mapping = columnMapping || this.defaultColumnMapping;
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    let rawData: any[] = [];

    if (fileExtension === 'csv') {
      rawData = await this.parseCSVToObjects(file);
    } else {
      rawData = await this.parseExcelToObjects(file);
    }

    return rawData.map(row => this.mapRowToTransaction(row, mapping)).filter(Boolean);
  }

  /**
   * Parse CSV file to array of objects
   */
  private async parseCSVToObjects(file: Express.Multer.File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];

      const parser = csv.parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read())) {
          results.push(record);
        }
      });

      parser.on('error', error => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      });

      parser.on('end', () => {
        resolve(results);
      });

      parser.write(file.buffer);
      parser.end();
    });
  }

  /**
   * Parse Excel file to array of objects
   */
  private async parseExcelToObjects(file: Express.Multer.File): Promise<any[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with header row as keys
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error('File must contain header row and at least one data row');
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      return rows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
    } catch (error) {
      throw new Error(`Error parsing Excel: ${error.message}`);
    }
  }

  /**
   * Map a raw data row to TransactionData
   */
  private mapRowToTransaction(row: any, mapping: ColumnMapping): TransactionData | null {
    try {
      const date = this.parseDate(row[mapping.date]);
      const description = String(row[mapping.description] || '').trim();
      const withdrawal = this.parseAmount(row[mapping.withdrawal]);
      const deposit = this.parseAmount(row[mapping.deposit]);
      const balance = this.parseAmount(row[mapping.balance]);

      // Skip rows with invalid data
      if (!date || !description) {
        return null;
      }

      return {
        date,
        description,
        withdrawal,
        deposit,
        balance,
        given_to: this.extractGivenTo(description),
        category: this.basicCategorization(description),
        matching_score: 50, // Default score for rule-based categorization
      };
    } catch (error) {
      console.warn('Skipping invalid row:', row, error.message);
      return null;
    }
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(dateValue: any): string {
    if (!dateValue) return '';

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        // Try parsing common date formats
        const formats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
        ];

        for (const format of formats) {
          const match = String(dateValue).match(format);
          if (match) {
            const [, p1, p2, p3] = match;
            // Assume DD/MM/YYYY format
            const parsedDate = new Date(parseInt(p3), parseInt(p2) - 1, parseInt(p1));
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString().split('T')[0];
            }
          }
        }
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  /**
   * Parse amount string to number
   */
  private parseAmount(value: any): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    // Remove currency symbols and commas
    const cleanValue = String(value)
      .replace(/[₹$€£,\s]/g, '')
      .trim();
    const number = parseFloat(cleanValue);
    return isNaN(number) ? 0 : number;
  }

  /**
   * Extract "given_to" from description using basic rules
   */
  private extractGivenTo(description: string): string {
    if (!description) return 'Unknown';

    // Common patterns for payee extraction
    const patterns = [
      /TO\s+([^\/\s]+)/i,
      /UPI-([^\/\s]+)/i,
      /IMPS-([^\/\s]+)/i,
      /NEFT-([^\/\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // If no pattern matches, return first few words
    const words = description.split(/\s+/);
    return words.slice(0, 2).join(' ') || 'Unknown';
  }

  /**
   * Basic categorization based on keywords
   */
  private basicCategorization(description: string): string {
    const desc = description.toLowerCase();

    const categories = {
      Food: ['restaurant', 'cafe', 'food', 'dining', 'swiggy', 'zomato', 'dominos'],
      Transport: ['uber', 'ola', 'taxi', 'metro', 'bus', 'fuel', 'petrol'],
      Entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game'],
      Shopping: ['amazon', 'flipkart', 'mall', 'store', 'shopping'],
      Banking: ['atm', 'bank', 'interest', 'charges', 'fee'],
      Utilities: ['electricity', 'water', 'gas', 'internet', 'mobile'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  /**
   * Basic text parsing for PDF (simplified without AI)
   */
  private parseTextToTransactions(text: string): TransactionData[] {
    // This is a basic implementation - in production you'd want more sophisticated parsing
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: TransactionData[] = [];

    for (const line of lines) {
      // Look for lines that might contain transaction data
      // This is a very basic pattern - you'd need to customize based on your PDF format
      const dateMatch = line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/);
      const amountMatch = line.match(/[\d,]+\.\d{2}/);

      if (dateMatch && amountMatch) {
        const transaction: TransactionData = {
          date: this.parseDate(dateMatch[0]),
          description: line.replace(dateMatch[0], '').replace(amountMatch[0], '').trim(),
          withdrawal: 0,
          deposit: this.parseAmount(amountMatch[0]),
          balance: 0,
          given_to: 'Unknown',
          category: 'Other',
          matching_score: 30, // Lower score for PDF parsing
        };

        transactions.push(transaction);
      }
    }

    return transactions;
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
