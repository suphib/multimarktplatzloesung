import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HealthResponse } from '@procurement/shared';

@Injectable()
export class HealthService {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async check(): Promise<HealthResponse> {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();
    const aiStatus = await this.checkAzureOpenAI();

    const allUp = dbStatus.status === 'up' && redisStatus.status === 'up' && aiStatus.status === 'up';
    const allDown = dbStatus.status === 'down' && redisStatus.status === 'down' && aiStatus.status === 'down';

    return {
      status: allUp ? 'ok' : allDown ? 'error' : 'degraded',
      version: '0.1.0',
      services: {
        database: dbStatus,
        redis: redisStatus,
        azureOpenAI: aiStatus,
      },
    };
  }

  private async checkDatabase() {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      return { status: 'up' as const, latenzMs: Date.now() - start };
    } catch {
      return { status: 'down' as const };
    }
  }

  private async checkRedis() {
    try {
      const host = this.config.get('REDIS_HOST', 'localhost');
      const port = this.config.get('REDIS_PORT', '6379');
      const start = Date.now();

      // Einfacher TCP-Check
      await new Promise<void>((resolve, reject) => {
        const net = require('net');
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.connect(parseInt(port), host, () => {
          socket.destroy();
          resolve();
        });
        socket.on('error', reject);
        socket.on('timeout', () => {
          socket.destroy();
          reject(new Error('Timeout'));
        });
      });

      return { status: 'up' as const, latenzMs: Date.now() - start };
    } catch {
      return { status: 'down' as const };
    }
  }

  private async checkAzureOpenAI() {
    const apiKey = this.config.get('AZURE_OPENAI_API_KEY');
    const endpoint = this.config.get('AZURE_OPENAI_ENDPOINT');

    if (!apiKey || !endpoint) {
      return { status: 'down' as const };
    }

    try {
      const start = Date.now();
      const response = await fetch(`${endpoint}/openai/models?api-version=2024-02-01`, {
        headers: { 'api-key': apiKey },
        signal: AbortSignal.timeout(5000),
      });

      return {
        status: response.ok ? ('up' as const) : ('down' as const),
        latenzMs: Date.now() - start,
      };
    } catch {
      return { status: 'down' as const };
    }
  }
}
