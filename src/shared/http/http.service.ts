import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);

  async post(
    url: string,
    data: any,
    config?: { headers?: Record<string, string> },
  ): Promise<any> {
    try {
      this.logger.log(`Making POST request to ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers || {}),
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error(
          `POST request to ${url} failed with status ${response.status}`,
          JSON.stringify(responseData),
        );
        throw new Error(
          responseData?.error?.message || 'HTTP POST request failed',
        );
      }

      return { data: responseData };
    } catch (error) {
      this.logger.error(`POST request to ${url} failed`, error.stack);
      throw error;
    }
  }
}
