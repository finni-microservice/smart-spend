import { LangChainService } from './langchain.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testLangChainService() {
  try {
    // Log environment variables for debugging
    console.log('Environment variables:', {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'API Key is set' : 'API Key is not set',
      NODE_ENV: process.env.NODE_ENV,
    });

    const langChainService = new LangChainService();

    // Test generateResponse with a simple question
    console.log('\nTesting generateResponse...');
    const response = await langChainService.generateResponse('What is the capital of France?');
    console.log('Response:', response);

    // Test analyzeFinancialData
    console.log('\nTesting analyzeFinancialData...');
    const financialData = `
      Monthly Expenses:
      - Rent: $1500
      - Utilities: $200
      - Groceries: $400
      - Entertainment: $300
    `;
    const analysis = await langChainService.analyzeFinancialData(financialData);
    console.log('Financial Analysis:', analysis);

    // Test summarizeText
    console.log('\nTesting summarizeText...');
    const longText = `
      The quick brown fox jumps over the lazy dog. This is a sample text that needs to be summarized.
      The fox was very quick and agile, while the dog was quite lazy and sleepy. The weather was nice
      and sunny that day, perfect for such activities.
    `;
    const summary = await langChainService.summarizeText(longText);
    console.log('Summary:', summary);

    // Test processUserInputWithLcelChain
    console.log('\nTesting processUserInputWithLcelChain...');
    const userInput = 'Can you help me with my budget planning?';
    const lcelResponse = await langChainService.processUserInputWithLcelChain(userInput);
    console.log('LCEL Response:', lcelResponse);

    // Test processExtractedData
    console.log('\nTesting processExtractedData...');
    const extractedData = `
      Transaction Details:
      - Amount: $45.99
      - Merchant: Starbucks
      - Date: 2024-03-15
      - Location: New York
    `;
    const processedData = await langChainService.processExtractedData(extractedData);
    console.log('Processed Data:', processedData);

    // Test processAgent2CategoryMatching
    console.log('\nTesting processAgent2CategoryMatching...');
    const matchingData = `
      Category Matches:
      - Food & Beverage: 0.95
      - Coffee Shops: 0.98
      - Dining Out: 0.85
    `;
    const categoryMatch = await langChainService.processAgent2CategoryMatching(matchingData);
    console.log('Category Match Result:', categoryMatch);

    // Test processAgent3AutoCategorization
    console.log('\nTesting processAgent3AutoCategorization...');
    const categorizationData = `
      Transaction: Starbucks $45.99
      Previous Categories: Coffee Shops, Food & Beverage
      Location: New York
      Time: Morning
    `;
    const autoCategory = await langChainService.processAgent3AutoCategorization(categorizationData);
    console.log('Auto-Categorization Result:', autoCategory);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    console.dir(error, { depth: null, colors: true });
  }
}

// Run the tests
testLangChainService();
