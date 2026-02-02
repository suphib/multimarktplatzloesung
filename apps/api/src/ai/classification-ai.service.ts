import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Konfidenz } from '@procurement/shared';
import { CLASSIFICATION_SYSTEM_PROMPT } from './prompts/classification.prompt';

export interface AiClassificationResult {
  cpvCode: string;
  cpvBezeichnung: string;
  konfidenz: Konfidenz;
  konfidenzWert: number;
  begruendung: string;
}

@Injectable()
export class ClassificationAiService {
  private readonly logger = new Logger(ClassificationAiService.name);

  constructor(private readonly config: ConfigService) {}

  async classify(
    artikelBezeichnung: string,
    artikelBeschreibung?: string,
  ): Promise<AiClassificationResult> {
    const apiKey = this.config.get('AZURE_OPENAI_API_KEY');
    const endpoint = this.config.get('AZURE_OPENAI_ENDPOINT');
    const deployment = this.config.get('AZURE_OPENAI_DEPLOYMENT_CHAT', 'gpt-4');
    const apiVersion = this.config.get('AZURE_OPENAI_API_VERSION', '2024-02-01');

    if (!apiKey || !endpoint) {
      throw new Error('Azure OpenAI nicht konfiguriert');
    }

    const userMessage = artikelBeschreibung
      ? `Artikel: ${artikelBezeichnung}\nBeschreibung: ${artikelBeschreibung}`
      : `Artikel: ${artikelBezeichnung}`;

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 500,
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
      const konfidenzWert = Math.min(Math.max(parsed.konfidenzWert ?? 0.5, 0), 1);

      return {
        cpvCode: parsed.cpvCode ?? '30190000',
        cpvBezeichnung: parsed.cpvBezeichnung ?? 'Nicht klassifiziert',
        konfidenz: this.konfidenzAusWert(konfidenzWert),
        konfidenzWert,
        begruendung: parsed.begruendung ?? 'Keine Begründung verfügbar',
      };
    } catch {
      this.logger.error('KI-Antwort konnte nicht geparst werden:', content);
      throw new Error('KI-Antwort ungültig');
    }
  }

  private konfidenzAusWert(wert: number): Konfidenz {
    if (wert >= 0.8) return Konfidenz.HOCH;
    if (wert >= 0.5) return Konfidenz.MITTEL;
    return Konfidenz.NIEDRIG;
  }
}
