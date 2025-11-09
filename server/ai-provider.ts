// AI Provider abstraction - supports multiple AI providers
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export interface AIProvider {
  generateText(prompt: string, options?: any): Promise<string>;
  generateJSON(prompt: string, options?: any): Promise<any>;
}

// Ollama Provider (Free, Local, No API Key Required)
export class OllamaProvider implements AIProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const model = options?.model || 'llama3.2:3b'; // Fast, free model
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          top_p: options?.top_p || 0.9,
        }
      }, {
        timeout: 60000, // 60 second timeout
      });

      return response.data.response || '';
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Please install and start Ollama: https://ollama.ai');
      }
      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  async generateJSON(prompt: string, options?: any): Promise<any> {
    const text = await this.generateText(prompt + '\n\nReturn ONLY valid JSON, no markdown or extra text.', options);
    
    // Parse JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      // Try to extract JSON from the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Ollama response');
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

// Groq Provider (Free Tier - Very Fast)
export class GroqProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const model = options?.model || 'llama-3.1-8b-instant'; // Fast, free model
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            { role: 'system', content: options?.systemPrompt || 'You are a helpful AI assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2048,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid Groq API key. Get a free key at https://console.groq.com');
      }
      throw new Error(`Groq error: ${error.message}`);
    }
  }

  async generateJSON(prompt: string, options?: any): Promise<any> {
    const text = await this.generateText(prompt + '\n\nReturn ONLY valid JSON, no markdown or extra text.', options);
    
    // Parse JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      // Try to extract JSON from the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Groq response');
    }
  }
}

// Gemini Provider (Existing)
export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash-exp') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      throw new Error(`Gemini error: ${error.message}`);
    }
  }

  async generateJSON(prompt: string, options?: any): Promise<any> {
    const text = await this.generateText(prompt, options);
    
    // Parse JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      // Try to extract JSON from the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Gemini response');
    }
  }
}

// Factory function to get the best available AI provider
export async function getAIProvider(): Promise<AIProvider> {
  // Priority order:
  // 1. Ollama (free, local, no API key)
  // 2. Groq (free tier, very fast)
  // 3. Gemini (requires API key)

  // Check Ollama first (completely free, no API key needed)
  const ollama = new OllamaProvider(process.env.OLLAMA_BASE_URL || 'http://localhost:11434');
  try {
    const isAvailable = await ollama.isAvailable();
    if (isAvailable) {
      console.log('✅ Using Ollama (free, local AI)');
      return ollama;
    }
  } catch (error) {
    console.log('ℹ️ Ollama not available (install from https://ollama.ai for free local AI)');
  }

  // Check Groq (free tier, very fast)
  if (process.env.GROQ_API_KEY) {
    console.log('✅ Using Groq (free tier, very fast)');
    return new GroqProvider(process.env.GROQ_API_KEY);
  }

  // Fall back to Gemini
  if (process.env.GEMINI_API_KEY) {
    console.log('✅ Using Gemini');
    return new GeminiProvider(process.env.GEMINI_API_KEY);
  }

  // No provider available
  throw new Error(
    'No AI provider available. Please set up one of:\n' +
    '1. Ollama (free, no API key): Install from https://ollama.ai and run "ollama serve"\n' +
    '2. Groq (free tier): Get API key from https://console.groq.com and set GROQ_API_KEY\n' +
    '3. Gemini: Set GEMINI_API_KEY in .env.local'
  );
}

// Helper to get provider with fallback
export async function getAIProviderWithFallback(): Promise<AIProvider> {
  try {
    return await getAIProvider();
  } catch (error: any) {
    // If no provider is available, return a mock provider for demos
    console.warn('⚠️ No AI provider available, using mock responses for demo');
    return new MockProvider();
  }
}

// Mock provider for demos when no AI is available
class MockProvider implements AIProvider {
  async generateText(prompt: string, options?: any): Promise<string> {
    return 'This is a demo response. Please set up an AI provider (Ollama, Groq, or Gemini) to get real AI responses.';
  }

  async generateJSON(prompt: string, options?: any): Promise<any> {
    return {
      executiveSummary: 'This is a demo response. Please set up an AI provider to get real AI responses.',
      northStar: 'Demo metric',
      strategicRecommendations: ['Demo recommendation 1', 'Demo recommendation 2'],
    };
  }
}

