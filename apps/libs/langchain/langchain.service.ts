import { ChatOpenAI } from '@langchain/openai';
import { AIMessageChunk } from '@langchain/core/messages';

export class LangChainService {
  private model: ChatOpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API Key:', apiKey); // Debug log

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }

    this.model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: apiKey,
    });
  }

  /**
   * Generate a response using LangChain
   * @param question The question or input to process
   * @returns The generated response
   */
  async generateResponse(question: string): Promise<string> {
    try {
      const response = await this.model.invoke(question);
      return String((response as AIMessageChunk).content);
    } catch (error) {
      throw new Error(`Error generating response: ${error.message}`);
    }
  }

  /**
   * Analyze financial data using LangChain
   * @param data The financial data to analyze
   * @returns The analysis result
   */
  async analyzeFinancialData(data: string): Promise<string> {
    try {
      const prompt = `As a financial expert, analyze this data and provide insights: ${data}`;
      const response = await this.model.invoke(prompt);
      return String((response as AIMessageChunk).content);
    } catch (error) {
      throw new Error(`Error analyzing data: ${error.message}`);
    }
  }

  /**
   * Summarize text using LangChain
   * @param text The text to summarize
   * @returns The summarized text
   */
  async summarizeText(text: string): Promise<string> {
    try {
      const prompt = `Please provide a concise summary of the following text: ${text}`;
      const response = await this.model.invoke(prompt);
      return String((response as AIMessageChunk).content);
    } catch (error) {
      throw new Error(`Error summarizing text: ${error.message}`);
    }
  }
}
