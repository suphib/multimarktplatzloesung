import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAGIC_REQUEST_SYSTEM_PROMPT } from './prompts/magic-request.prompt';
import type { MagicRequestItem } from '@procurement/shared';

export interface AiMagicRequestResult {
  positionen: MagicRequestItem[];
  zusammenfassung: string;
}

@Injectable()
export class MagicRequestAiService {
  private readonly logger = new Logger(MagicRequestAiService.name);

  constructor(private readonly config: ConfigService) {}

  async parse(freitext: string): Promise<AiMagicRequestResult> {
    const apiKey = this.config.get('AZURE_OPENAI_API_KEY');
    const endpoint = this.config.get('AZURE_OPENAI_ENDPOINT');
    const deployment = this.config.get('AZURE_OPENAI_DEPLOYMENT_CHAT', 'gpt-4');
    const apiVersion = this.config.get('AZURE_OPENAI_API_VERSION', '2024-02-01');

    if (!apiKey || !endpoint) {
      throw new Error('Azure OpenAI nicht konfiguriert');
    }

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: MAGIC_REQUEST_SYSTEM_PROMPT },
          { role: 'user', content: freitext },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure OpenAI Fehler: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Keine Antwort von Azure OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      const positionen: MagicRequestItem[] = (parsed.positionen ?? []).map((p: any) => ({
        beschreibung: p.beschreibung ?? '',
        menge: Math.max(1, Number(p.menge) || 1),
        einheit: p.einheit ?? 'Stück',
        geschaetzterPreis: p.geschaetzterPreis != null ? Number(p.geschaetzterPreis) : null,
        waehrung: p.waehrung ?? 'EUR',
        lieferantHinweis: p.lieferantHinweis ?? '',
        artikelnummerHinweis: p.artikelnummerHinweis ?? '',
        kategorie: p.kategorie ?? 'Sonstiges',
        konfidenz: Math.min(Math.max(Number(p.konfidenz) || 0.5, 0), 1),
      }));

      return {
        positionen,
        zusammenfassung: parsed.zusammenfassung ?? `${positionen.length} Positionen erkannt`,
      };
    } catch {
      this.logger.error('KI-Antwort konnte nicht geparst werden:', content);
      throw new Error('KI-Antwort ungültig');
    }
  }
}
