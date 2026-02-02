import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RahmenvertragEntity } from './entities/rahmenvertrag.entity';
import { RahmenvertragMatch } from '@procurement/shared';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    @InjectRepository(RahmenvertragEntity)
    private readonly rahmenvertragRepo: Repository<RahmenvertragEntity>,
    private readonly config: ConfigService,
  ) {}

  async erstelleEmbedding(text: string): Promise<number[]> {
    const apiKey = this.config.get('AZURE_OPENAI_API_KEY');
    const endpoint = this.config.get('AZURE_OPENAI_ENDPOINT');
    const deployment = this.config.get('AZURE_OPENAI_DEPLOYMENT_EMBEDDING', 'text-embedding-ada-002');
    const apiVersion = this.config.get('AZURE_OPENAI_API_VERSION', '2024-02-01');

    if (!apiKey || !endpoint) {
      this.logger.warn('Azure OpenAI nicht konfiguriert, verwende Dummy-Embedding');
      return this.dummyEmbedding(text);
    }

    try {
      const url = `${endpoint}/openai/deployments/${deployment}/embeddings?api-version=${apiVersion}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({ input: text }),
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API Fehler: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      this.logger.error('Embedding-Erstellung fehlgeschlagen', error);
      return this.dummyEmbedding(text);
    }
  }

  async findeAehnlichenRahmenvertrag(artikelBezeichnung: string): Promise<RahmenvertragMatch | null> {
    // Ohne pgvector-Setup: Einfache textbasierte Suche als Fallback
    try {
      const rahmenvertraege = await this.rahmenvertragRepo.find();

      if (rahmenvertraege.length === 0) {
        return null;
      }

      // Einfache Textähnlichkeit berechnen
      const lower = artikelBezeichnung.toLowerCase();
      let bestMatch: RahmenvertragEntity | null = null;
      let bestScore = 0;

      for (const rv of rahmenvertraege) {
        const rvText = `${rv.bezeichnung} ${rv.beschreibung}`.toLowerCase();
        const worte = lower.split(/\s+/);
        const treffer = worte.filter((w) => rvText.includes(w)).length;
        const score = treffer / worte.length;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = rv;
        }
      }

      if (bestMatch && bestScore > 0.3) {
        return {
          id: bestMatch.id,
          bezeichnung: bestMatch.bezeichnung,
          lieferant: bestMatch.lieferant,
          vertragsnummer: bestMatch.vertragsnummer,
          gueltigBis: bestMatch.gueltigBis.toISOString().split('T')[0],
          aehnlichkeit: Math.min(bestScore * 1.2, 0.99),
        };
      }

      return null;
    } catch (error) {
      this.logger.warn('Rahmenvertrag-Suche fehlgeschlagen', error);
      return null;
    }
  }

  private dummyEmbedding(text: string): number[] {
    // Deterministisches Dummy-Embedding basierend auf Text
    const embedding = new Array(1536).fill(0);
    for (let i = 0; i < text.length && i < 1536; i++) {
      embedding[i] = (text.charCodeAt(i) % 100) / 100;
    }
    return embedding;
  }
}
