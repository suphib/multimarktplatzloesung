import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { XMLParser } from 'fast-xml-parser';
import type { OciSession, OciCartItem, CxmlCredential, CxmlOrderItem } from '@procurement/shared';

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const UNIT_MAP: Record<string, string> = {
  'Stück': 'EA',
  'Packung': 'PK',
  'Karton': 'CT',
  'Palette': 'PF',
  'Liter': 'LT',
  'Kilogramm': 'KG',
  'Meter': 'MT',
  'Set': 'SET',
  'Paar': 'PR',
  'Rolle': 'RL',
};

interface CxmlSetupResult {
  buyerCookie: string;
  browserFormPostUrl: string;
  senderCredential: CxmlCredential;
}

interface CxmlOrderResult {
  orderId: string;
  items: CxmlOrderItem[];
}

@Injectable()
export class OciService {
  private sessions = new Map<string, OciSession>();

  // ─── OCI Session Management ─────────────────────────────────

  createOciSession(params: { hookUrl: string; username?: string }): OciSession {
    const token = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    const session: OciSession = {
      token,
      hookUrl: params.hookUrl,
      username: params.username,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.sessions.set(token, session);
    return session;
  }

  validateSession(token: string): OciSession | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  getActiveSessions(): number {
    // Cleanup expired
    for (const [token, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.sessions.delete(token);
      }
    }
    return this.sessions.size;
  }

  // ─── OCI Return Form ───────────────────────────────────────

  buildOciReturnForm(hookUrl: string, items: OciCartItem[]): string {
    const fields = items
      .map((item, idx) => {
        const n = idx + 1;
        let html = '';
        html += `  <input type="hidden" name="NEW_ITEM-DESCRIPTION[${n}]" value="${this.escapeHtml(item.description)}" />\n`;
        html += `  <input type="hidden" name="NEW_ITEM-QUANTITY[${n}]" value="${item.quantity}" />\n`;
        html += `  <input type="hidden" name="NEW_ITEM-UNIT[${n}]" value="${this.escapeHtml(item.unit)}" />\n`;
        html += `  <input type="hidden" name="NEW_ITEM-PRICE[${n}]" value="${item.price.toFixed(2)}" />\n`;
        html += `  <input type="hidden" name="NEW_ITEM-CURRENCY[${n}]" value="${this.escapeHtml(item.currency)}" />\n`;
        html += `  <input type="hidden" name="NEW_ITEM-VENDORMAT[${n}]" value="${this.escapeHtml(item.vendorMat)}" />\n`;
        html += `  <input type="hidden" name="NEW_ITEM-VENDOR[${n}]" value="${this.escapeHtml(item.vendor)}" />\n`;

        if (item.contract) {
          html += `  <input type="hidden" name="NEW_ITEM-CONTRACT[${n}]" value="${this.escapeHtml(item.contract)}" />\n`;
        }
        if (item.matgroup) {
          html += `  <input type="hidden" name="NEW_ITEM-MATGROUP[${n}]" value="${this.escapeHtml(item.matgroup)}" />\n`;
        }
        if (item.leadtime !== undefined) {
          html += `  <input type="hidden" name="NEW_ITEM-LEADTIME[${n}]" value="${item.leadtime}" />\n`;
        }
        if (item.longtext) {
          html += `  <input type="hidden" name="NEW_ITEM-LONGTEXT_${n}:132[]" value="${this.escapeHtml(item.longtext)}" />\n`;
        }

        return html;
      })
      .join('');

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>OCI Return</title></head>
<body>
<form id="ociForm" method="POST" action="${this.escapeHtml(hookUrl)}">
${fields}</form>
<script>document.getElementById('ociForm').submit();</script>
</body>
</html>`;
  }

  // ─── cXML ─────────────────────────────────────────────────

  parseCxmlSetupRequest(xml: string): CxmlSetupResult {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    let parsed: any;
    try {
      parsed = parser.parse(xml);
    } catch {
      throw new BadRequestException('Ungültiges XML-Format');
    }

    const request = parsed?.cXML?.Request?.PunchOutSetupRequest;
    if (!request) {
      throw new BadRequestException('Kein PunchOutSetupRequest gefunden');
    }

    const buyerCookie = request.BuyerCookie;
    if (!buyerCookie) {
      throw new BadRequestException('BuyerCookie fehlt im PunchOutSetupRequest');
    }

    const browserFormPostUrl = request.BrowserFormPost?.URL;
    if (!browserFormPostUrl) {
      throw new BadRequestException('BrowserFormPost URL fehlt im PunchOutSetupRequest');
    }

    const senderCred = parsed?.cXML?.Header?.Sender?.Credential;
    const senderCredential: CxmlCredential = {
      domain: senderCred?.['@_domain'] || '',
      identity: senderCred?.Identity || '',
      sharedSecret: senderCred?.SharedSecret || '',
    };

    return { buyerCookie, browserFormPostUrl, senderCredential };
  }

  buildCxmlSetupResponse(startPageUrl: string): string {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML payloadID="response-${Date.now()}" timestamp="${timestamp}">
  <Response>
    <Status code="200" text="OK">Success</Status>
    <PunchOutSetupResponse>
      <StartPage>
        <URL>${this.escapeXml(startPageUrl)}</URL>
      </StartPage>
    </PunchOutSetupResponse>
  </Response>
</cXML>`;
  }

  buildCxmlPunchOutOrderMessage(buyerCookie: string, items: OciCartItem[]): string {
    const timestamp = new Date().toISOString();

    const itemsXml = items
      .map(
        (item, idx) => `      <ItemIn quantity="${item.quantity}">
        <ItemID>
          <SupplierPartID>${this.escapeXml(item.vendorMat)}</SupplierPartID>
        </ItemID>
        <ItemDetail>
          <UnitPrice>
            <Money currency="${this.escapeXml(item.currency)}">${item.price.toFixed(2)}</Money>
          </UnitPrice>
          <Description>${this.escapeXml(item.description)}</Description>
          <UnitOfMeasure>${this.escapeXml(item.unit)}</UnitOfMeasure>
        </ItemDetail>
      </ItemIn>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML payloadID="poom-${Date.now()}" timestamp="${timestamp}">
  <Message>
    <PunchOutOrderMessage>
      <BuyerCookie>${this.escapeXml(buyerCookie)}</BuyerCookie>
      <PunchOutOrderMessageHeader operationAllowed="create">
        <Total>
          <Money currency="${items[0]?.currency || 'EUR'}">${items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</Money>
        </Total>
      </PunchOutOrderMessageHeader>
${itemsXml}
    </PunchOutOrderMessage>
  </Message>
</cXML>`;
  }

  processCxmlOrder(xml: string): CxmlOrderResult {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    let parsed: any;
    try {
      parsed = parser.parse(xml);
    } catch {
      throw new BadRequestException('Ungültiges XML-Format');
    }

    const orderRequest = parsed?.cXML?.Request?.OrderRequest;
    if (!orderRequest) {
      throw new BadRequestException('Kein OrderRequest gefunden');
    }

    const orderId = orderRequest.OrderRequestHeader?.['@_orderID'] || '';

    const rawItems = Array.isArray(orderRequest.ItemOut)
      ? orderRequest.ItemOut
      : [orderRequest.ItemOut].filter(Boolean);

    const items: CxmlOrderItem[] = rawItems.map((item: any) => ({
      quantity: Number(item['@_quantity'] || 1),
      description: item.ItemDetail?.Description || '',
      unitPrice: Number(item.ItemDetail?.UnitPrice?.Money?.['#text'] || item.ItemDetail?.UnitPrice?.Money || 0),
      currency: item.ItemDetail?.UnitPrice?.Money?.['@_currency'] || 'EUR',
      supplierPartId: item.ItemID?.SupplierPartID || '',
      uom: item.ItemDetail?.UnitOfMeasure || 'EA',
    }));

    return { orderId, items };
  }

  buildCxmlOrderResponse(orderId: string): string {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML payloadID="order-response-${Date.now()}" timestamp="${timestamp}">
  <Response>
    <Status code="200" text="OK">Bestellung ${this.escapeXml(orderId)} erfolgreich empfangen</Status>
  </Response>
</cXML>`;
  }

  // ─── Unit Mapping ─────────────────────────────────────────

  mapUnitToISO(unit: string): string {
    return UNIT_MAP[unit] || unit;
  }

  // ─── Helpers ──────────────────────────────────────────────

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private escapeXml(text: string): string {
    return this.escapeHtml(text);
  }
}
