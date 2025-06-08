import { LangChainService } from './langchain.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function demonstrateLangChain() {
  // Log environment variables for debugging
  console.log('Environment variables:', {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  const langChain = new LangChainService();

  try {
    // Example 1: General Question
    console.log('=== General Question Example ===');
    const question = 'What are the benefits of regular exercise?';
    const response = await langChain.generateResponse(question);
    console.log('Question:', question);
    console.log('Response:', response);
    console.log('\n');

    // Example 2: Financial Analysis
    console.log('=== Financial Analysis Example ===');
    const financialData = `
      Company XYZ Q4 2023 Results:
      Revenue: $50M (↑15% YoY)
      Net Profit: $12M (↑20% YoY)
      Operating Margin: 24%
      Cash Position: $30M
      Market Share: 12%
    `;
    const analysis = await langChain.analyzeFinancialData(financialData);
    console.log('Financial Data:', financialData);
    console.log('Analysis:', analysis);
    console.log('\n');

    // Example 3: Text Summarization
    console.log('=== Text Summarization Example ===');
    const longText = `
      Artificial Intelligence (AI) is transforming the way we live and work. 
      From virtual assistants like Siri and Alexa to recommendation systems on 
      streaming platforms, AI is becoming increasingly integrated into our daily lives. 
      In healthcare, AI is helping doctors diagnose diseases more accurately and 
      develop personalized treatment plans. In finance, AI algorithms are detecting 
      fraudulent transactions and optimizing investment strategies. The transportation 
      industry is being revolutionized by self-driving cars, while manufacturing 
      benefits from AI-powered robots that can work 24/7 without fatigue. However, 
      this rapid advancement also raises important ethical questions about privacy, 
      job displacement, and decision-making transparency. As we continue to develop 
      and implement AI technologies, it's crucial to consider both their potential 
      benefits and the challenges they present to society.
    `;
    const summary = await langChain.summarizeText(longText);
    console.log('Original Text:', longText);
    console.log('Summary:', summary);
  } catch (error) {
    console.error('Error in demonstration:', error);
  }
}

// Run the demonstration
demonstrateLangChain();
