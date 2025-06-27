import { ChatGroq } from '@langchain/groq';
import { AIMessageChunk } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class LangChainService {
  private model: ChatGroq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('API Key:', apiKey); // Debug log

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured in environment variables');
    }
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      apiKey: apiKey,
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

  async processUserInputWithLcelChain(userInput: string): Promise<string> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'You are a helpful AI assistant.'],
        ['user', '{input}'],
      ]);

      const outputParser = new StringOutputParser();

      const chain = prompt.pipe(this.model).pipe(outputParser);

      const response = await chain.invoke({ input: userInput });
      return response;
    } catch (error) {
      throw new Error(`Error processing input with LCEL chain: ${error.message}`);
    }
  }

  /**
   * Process extracted data using LangChain
   * @param extractedData The extracted details to process
   * @returns The processed analysis
   */
  async processExtractedData(extractedData: string): Promise<string> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are an expert in data analysis. Analyze the following extracted data and provide insights.',
        ],
        ['user', '{input}'],
      ]);

      const outputParser = new StringOutputParser();

      const chain = prompt.pipe(this.model).pipe(outputParser);

      const response = await chain.invoke({ input: extractedData });
      return response;
    } catch (error) {
      throw new Error(`Error processing extracted data with LCEL chain: ${error.message}`);
    }
  }

  /**
   * Process category matching results from Agent 2 using LangChain
   * @param matchingData The data about matched categories and scores to process
   * @returns The refined category or further analysis
   */
  async processAgent2CategoryMatching(matchingData: string): Promise<string> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are an AI assistant specialized in refining financial transaction categories based on matching scores.',
        ],
        ['user', '{input}'],
      ]);

      const outputParser = new StringOutputParser();

      const chain = prompt.pipe(this.model).pipe(outputParser);

      const response = await chain.invoke({ input: matchingData });
      return response;
    } catch (error) {
      throw new Error(
        `Error processing Agent 2 category matching with LCEL chain: ${error.message}`,
      );
    }
  }

  /**
   * Perform auto-categorization for Agent 3 using LangChain
   * @param categorizationData The data requiring auto-categorization
   * @returns The auto-categorized result
   */
  async processAgent3AutoCategorization(categorizationData: string): Promise<string> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are an AI assistant specialized in automatically categorizing financial transactions.',
        ],
        ['user', '{input}'],
      ]);

      const outputParser = new StringOutputParser();

      const chain = prompt.pipe(this.model).pipe(outputParser);

      const response = await chain.invoke({ input: categorizationData });
      return response;
    } catch (error) {
      throw new Error(
        `Error performing Agent 3 auto-categorization with LCEL chain: ${error.message}`,
      );
    }
  }
}
