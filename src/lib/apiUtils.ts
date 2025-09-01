// API Utilities for managing API keys and configurations

export interface APIConfig {
  geminiKey: string;
  openaiKey: string;
  pythonBackendUrl: string;
}

export class APIUtils {
  private static readonly GEMINI_KEY = 'gemini-api-key';
  private static readonly OPENAI_KEY = 'openai-api-key';
  private static readonly PYTHON_URL = 'python-backend-url';

  // Default values - No hardcoded API keys or URLs
  private static readonly DEFAULTS = {
    geminiKey: '',
    openaiKey: '', 
    pythonBackendUrl: ''
  };

  static getAPIConfig(): APIConfig {
    return {
      geminiKey: localStorage.getItem(this.GEMINI_KEY) || this.DEFAULTS.geminiKey,
      openaiKey: localStorage.getItem(this.OPENAI_KEY) || this.DEFAULTS.openaiKey,
      pythonBackendUrl: localStorage.getItem(this.PYTHON_URL) || this.DEFAULTS.pythonBackendUrl
    };
  }

  static saveAPIConfig(config: Partial<APIConfig>): void {
    if (config.geminiKey !== undefined) {
      localStorage.setItem(this.GEMINI_KEY, config.geminiKey);
    }
    if (config.openaiKey !== undefined) {
      localStorage.setItem(this.OPENAI_KEY, config.openaiKey);
    }
    if (config.pythonBackendUrl !== undefined) {
      localStorage.setItem(this.PYTHON_URL, config.pythonBackendUrl);
    }
  }

  static getGeminiKey(): string {
    return this.getAPIConfig().geminiKey;
  }

  static getOpenAIKey(): string {
    return this.getAPIConfig().openaiKey;
  }

  static getPythonBackendUrl(): string {
    // Use the backend URL from config, fallback to empty string
    return this.getAPIConfig().pythonBackendUrl;
  }

  static saveGeminiKey(key: string): void {
    localStorage.setItem(this.GEMINI_KEY, key);
  }

  static saveOpenAIKey(key: string): void {
    localStorage.setItem(this.OPENAI_KEY, key);
  }

  static savePythonBackendUrl(url: string): void {
    localStorage.setItem(this.PYTHON_URL, url);
  }

  static clearAll(): void {
    localStorage.removeItem(this.GEMINI_KEY);
    localStorage.removeItem(this.OPENAI_KEY);
    localStorage.removeItem(this.PYTHON_URL);
  }

  // Test connections
  static async testGeminiConnection(): Promise<boolean> {
    try {
      const key = this.getGeminiKey();
      
      // Skip test for empty or demo keys
      if (!key || key.includes('Demo') || key.includes('YOUR_')) {
        console.log('No valid Gemini key provided - skipping connection test');
        return false;
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      return response.ok;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  static async testOpenAIConnection(): Promise<boolean> {
    try {
      const key = this.getOpenAIKey();
      
      // Skip test for empty or demo keys
      if (!key || key.includes('demo') || key.includes('YOUR_')) {
        console.log('No valid OpenAI key provided - skipping connection test');
        return false;
      }
      
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  static async testPythonBackend(): Promise<boolean> {
    try {
      const url = this.getPythonBackendUrl();
      if (!url) {
        console.log('No Python backend URL provided - skipping connection test');
        return false;
      }
      const response = await fetch(`${url}/health`);
      return response.ok;
    } catch (error) {
      console.error('Python backend test failed:', error);
      return false;
    }
  }
}

// Initialize API keys on first load
export const initializeAPIKeys = (): void => {
  const config = APIUtils.getAPIConfig();

  // Save defaults if not already saved
  if (!localStorage.getItem(APIUtils['GEMINI_KEY']) && config.geminiKey) {
    APIUtils.saveGeminiKey(config.geminiKey);
  }
  if (!localStorage.getItem(APIUtils['OPENAI_KEY']) && config.openaiKey) {
    APIUtils.saveOpenAIKey(config.openaiKey);
  }
  if (!localStorage.getItem(APIUtils['PYTHON_URL']) && config.pythonBackendUrl) {
    APIUtils.savePythonBackendUrl(config.pythonBackendUrl);
  }
};
