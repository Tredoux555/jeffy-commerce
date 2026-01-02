/**
 * Alibaba Qwen-MT-Image API Integration
 * Handles Chinese→English product image translation
 * 
 * API Documentation: https://www.alibabacloud.com/help/en/model-studio/qwen-mt-image-api
 */

// Types
export interface TranslationRequest {
  imageUrl: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  glossary?: Array<{ source: string; target: string }>;
  domain?: 'e-commerce' | 'general';
}

export interface TranslationResponse {
  success: boolean;
  taskId?: string;
  resultUrl?: string;
  detectedText?: Array<{
    original: string;
    translated: string;
    bbox: number[];
  }>;
  error?: string;
}

export interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
}

// Main API Class
export class AlibabaImageTranslator {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1';
  }

  /**
   * Submit an image for translation
   * Returns a task ID for polling
   */
  async submitTranslation(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/services/aigc/image2image/image-synthesis`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable', // Enable async mode
          },
          body: JSON.stringify({
            model: 'qwen-mt-image',
            input: {
              image_url: request.imageUrl,
            },
            parameters: {
              source_lang: request.sourceLanguage || 'zh',
              target_lang: request.targetLanguage || 'en',
              domain_list: [request.domain || 'e-commerce'],
              // Glossary for brand names, product terms that shouldn't be translated
              term_list: request.glossary?.map(g => ({
                source_term: g.source,
                target_term: g.target,
              })) || [],
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `API error: ${response.status}`,
        };
      }

      return {
        success: true,
        taskId: data.output?.task_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check the status of a translation task
   */
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tasks/${taskId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          status: 'failed',
          progress: 0,
          error: data.message || `API error: ${response.status}`,
        };
      }

      const taskStatus = data.output?.task_status;
      
      // Map Alibaba status to our status
      const statusMap: Record<string, TaskStatus['status']> = {
        'PENDING': 'pending',
        'RUNNING': 'processing',
        'SUCCEEDED': 'completed',
        'FAILED': 'failed',
      };

      return {
        status: statusMap[taskStatus] || 'processing',
        progress: taskStatus === 'SUCCEEDED' ? 100 : taskStatus === 'RUNNING' ? 50 : 0,
        resultUrl: data.output?.result_url,
        error: data.output?.message,
      };
    } catch (error) {
      return {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Convenience method: Submit and poll until complete
   * Use for simple single-image translations
   */
  async translateAndWait(
    request: TranslationRequest,
    onProgress?: (progress: number) => void,
    maxWaitMs: number = 120000, // 2 minutes max
    pollIntervalMs: number = 2000
  ): Promise<TranslationResponse> {
    // Submit the task
    const submitResult = await this.submitTranslation(request);
    
    if (!submitResult.success || !submitResult.taskId) {
      return submitResult;
    }

    const taskId = submitResult.taskId;
    const startTime = Date.now();

    // Poll for completion
    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getTaskStatus(taskId);
      
      if (onProgress) {
        onProgress(status.progress);
      }

      if (status.status === 'completed') {
        return {
          success: true,
          taskId,
          resultUrl: status.resultUrl,
        };
      }

      if (status.status === 'failed') {
        return {
          success: false,
          taskId,
          error: status.error || 'Translation failed',
        };
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    return {
      success: false,
      taskId,
      error: 'Translation timed out',
    };
  }
}

// Singleton instance factory
let instance: AlibabaImageTranslator | null = null;

export function getImageTranslator(): AlibabaImageTranslator {
  if (!instance) {
    const apiKey = process.env.ALIBABA_DASHSCOPE_API_KEY;
    
    if (!apiKey) {
      throw new Error('ALIBABA_DASHSCOPE_API_KEY environment variable is not set');
    }
    
    instance = new AlibabaImageTranslator(apiKey);
  }
  
  return instance;
}

// Alternative: Direct function exports for simpler usage
export async function translateImage(
  imageUrl: string,
  options?: Partial<TranslationRequest>
): Promise<TranslationResponse> {
  const translator = getImageTranslator();
  return translator.translateAndWait({
    imageUrl,
    ...options,
  });
}

export async function submitImageTranslation(
  imageUrl: string,
  options?: Partial<TranslationRequest>
): Promise<TranslationResponse> {
  const translator = getImageTranslator();
  return translator.submitTranslation({
    imageUrl,
    ...options,
  });
}

export async function checkTranslationStatus(taskId: string): Promise<TaskStatus> {
  const translator = getImageTranslator();
  return translator.getTaskStatus(taskId);
}

