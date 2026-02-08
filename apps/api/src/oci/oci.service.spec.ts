import { OciService } from './oci.service';

describe('OciService', () => {
  let service: OciService;

  beforeEach(() => {
    service = new OciService();
  });

  // ─── OCI Session Management ─────────────────────────────────

  describe('createOciSession', () => {
    it('should generate a session with a token', () => {
      const session = service.createOciSession({
        hookUrl: 'http://sap.example.com/oci-return',
      });

      expect(session.token).toBeDefined();
      expect(session.token.length).toBeGreaterThan(16);
      expect(session.hookUrl).toBe('http://sap.example.com/oci-return');
      expect(session.createdAt).toBeDefined();
      expect(session.expiresAt).toBeDefined();
    });

    it('should store username when provided', () => {
      const session = service.createOciSession({
        hookUrl: 'http://sap.example.com/oci-return',
        username: 'sap_user',
      });

      expect(session.username).toBe('sap_user');
    });

    it('should set expiration 30 minutes in the future', () => {
      const before = Date.now();
      const session = service.createOciSession({
        hookUrl: 'http://sap.example.com/oci-return',
      });
      const after = Date.now();

      const expiresAt = new Date(session.expiresAt).getTime();
      const thirtyMinMs = 30 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(before + thirtyMinMs - 1000);
      expect(expiresAt).toBeLessThanOrEqual(after + thirtyMinMs + 1000);
    });
  });

  describe('validateSession', () => {
    it('should return session for valid token', () => {
      const created = service.createOciSession({
        hookUrl: 'http://sap.example.com/oci-return',
      });

      const session = service.validateSession(created.token);
      expect(session).toBeDefined();
      expect(session!.hookUrl).toBe('http://sap.example.com/oci-return');
    });

    it('should return null for unknown token', () => {
      const session = service.validateSession('invalid-token-xyz');
      expect(session).toBeNull();
    });

    it('should return null for expired session', () => {
      const created = service.createOciSession({
        hookUrl: 'http://sap.example.com/oci-return',
      });

      // Manually expire the session
      service['sessions'].get(created.token)!.expiresAt = new Date(
        Date.now() - 1000,
      ).toISOString();

      const session = service.validateSession(created.token);
      expect(session).toBeNull();
    });
  });

  // ─── OCI Return Form ───────────────────────────────────────

  describe('buildOciReturnForm', () => {
    it('should generate HTML form with correct action URL', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Dell Latitude 5550',
            quantity: 3,
            unit: 'EA',
            price: 1049.0,
            currency: 'EUR',
            vendorMat: 'LAT-5550',
            vendor: 'Bechtle AG',
            contract: 'RV-2024-IT-001',
          },
        ],
      );

      expect(html).toContain('action="http://sap.example.com/oci-return"');
      expect(html).toContain('method="POST"');
    });

    it('should include all OCI NEW_ITEM fields', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Dell Latitude 5550',
            quantity: 3,
            unit: 'EA',
            price: 1049.0,
            currency: 'EUR',
            vendorMat: 'LAT-5550',
            vendor: 'Bechtle AG',
          },
        ],
      );

      expect(html).toContain('NEW_ITEM-DESCRIPTION[1]');
      expect(html).toContain('Dell Latitude 5550');
      expect(html).toContain('NEW_ITEM-QUANTITY[1]');
      expect(html).toContain('3');
      expect(html).toContain('NEW_ITEM-UNIT[1]');
      expect(html).toContain('EA');
      expect(html).toContain('NEW_ITEM-PRICE[1]');
      expect(html).toContain('1049.00');
      expect(html).toContain('NEW_ITEM-CURRENCY[1]');
      expect(html).toContain('EUR');
      expect(html).toContain('NEW_ITEM-VENDORMAT[1]');
      expect(html).toContain('LAT-5550');
      expect(html).toContain('NEW_ITEM-VENDOR[1]');
      expect(html).toContain('Bechtle AG');
    });

    it('should include CONTRACT field when present', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Dell Latitude',
            quantity: 1,
            unit: 'EA',
            price: 1000,
            currency: 'EUR',
            vendorMat: 'LAT',
            vendor: 'Bechtle',
            contract: 'RV-2024-IT-001',
          },
        ],
      );

      expect(html).toContain('NEW_ITEM-CONTRACT[1]');
      expect(html).toContain('RV-2024-IT-001');
    });

    it('should include MATGROUP when present', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Dell Latitude',
            quantity: 1,
            unit: 'EA',
            price: 1000,
            currency: 'EUR',
            vendorMat: 'LAT',
            vendor: 'Bechtle',
            matgroup: '30213100',
          },
        ],
      );

      expect(html).toContain('NEW_ITEM-MATGROUP[1]');
      expect(html).toContain('30213100');
    });

    it('should include LEADTIME when present', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Dell Latitude',
            quantity: 1,
            unit: 'EA',
            price: 1000,
            currency: 'EUR',
            vendorMat: 'LAT',
            vendor: 'Bechtle',
            leadtime: 5,
          },
        ],
      );

      expect(html).toContain('NEW_ITEM-LEADTIME[1]');
      expect(html).toContain('5');
    });

    it('should include LONGTEXT when present', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Dell Latitude',
            quantity: 1,
            unit: 'EA',
            price: 1000,
            currency: 'EUR',
            vendorMat: 'LAT',
            vendor: 'Bechtle',
            longtext: 'Business laptop with 16GB RAM',
          },
        ],
      );

      expect(html).toContain('NEW_ITEM-LONGTEXT_1:132[]');
      expect(html).toContain('Business laptop with 16GB RAM');
    });

    it('should handle multiple items with correct indices', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Item A',
            quantity: 1,
            unit: 'EA',
            price: 100,
            currency: 'EUR',
            vendorMat: 'A',
            vendor: 'V',
          },
          {
            description: 'Item B',
            quantity: 2,
            unit: 'EA',
            price: 200,
            currency: 'EUR',
            vendorMat: 'B',
            vendor: 'V',
          },
        ],
      );

      expect(html).toContain('NEW_ITEM-DESCRIPTION[1]');
      expect(html).toContain('NEW_ITEM-DESCRIPTION[2]');
      expect(html).toContain('Item A');
      expect(html).toContain('Item B');
    });

    it('should auto-submit the form', () => {
      const html = service.buildOciReturnForm(
        'http://sap.example.com/oci-return',
        [
          {
            description: 'Item',
            quantity: 1,
            unit: 'EA',
            price: 100,
            currency: 'EUR',
            vendorMat: 'A',
            vendor: 'V',
          },
        ],
      );

      expect(html).toContain('document.getElementById');
      expect(html).toContain('.submit()');
    });
  });

  // ─── cXML ─────────────────────────────────────────────────

  describe('parseCxmlSetupRequest', () => {
    const validCxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML payloadID="test123" timestamp="2024-06-15T10:00:00+02:00">
  <Header>
    <From>
      <Credential domain="NetworkId">
        <Identity>buyer@example.com</Identity>
      </Credential>
    </From>
    <To>
      <Credential domain="NetworkId">
        <Identity>supplier@example.com</Identity>
      </Credential>
    </To>
    <Sender>
      <Credential domain="NetworkId">
        <Identity>sender@example.com</Identity>
        <SharedSecret>secret123</SharedSecret>
      </Credential>
    </Sender>
  </Header>
  <Request>
    <PunchOutSetupRequest operation="create">
      <BuyerCookie>bc-12345</BuyerCookie>
      <BrowserFormPost>
        <URL>http://ariba.example.com/punchout/return</URL>
      </BrowserFormPost>
    </PunchOutSetupRequest>
  </Request>
</cXML>`;

    it('should extract BuyerCookie', () => {
      const result = service.parseCxmlSetupRequest(validCxml);
      expect(result.buyerCookie).toBe('bc-12345');
    });

    it('should extract BrowserFormPost URL', () => {
      const result = service.parseCxmlSetupRequest(validCxml);
      expect(result.browserFormPostUrl).toBe(
        'http://ariba.example.com/punchout/return',
      );
    });

    it('should extract sender credentials', () => {
      const result = service.parseCxmlSetupRequest(validCxml);
      expect(result.senderCredential).toBeDefined();
      expect(result.senderCredential.identity).toBe('sender@example.com');
      expect(result.senderCredential.sharedSecret).toBe('secret123');
    });

    it('should throw on invalid XML', () => {
      expect(() => service.parseCxmlSetupRequest('not xml')).toThrow();
    });

    it('should throw on missing BuyerCookie', () => {
      const noCookie = validCxml.replace(
        '<BuyerCookie>bc-12345</BuyerCookie>',
        '',
      );
      expect(() => service.parseCxmlSetupRequest(noCookie)).toThrow();
    });

    it('should throw on missing BrowserFormPost URL', () => {
      const noUrl = validCxml.replace(
        /\s*<BrowserFormPost>[\s\S]*?<\/BrowserFormPost>/,
        '',
      );
      expect(() => service.parseCxmlSetupRequest(noUrl)).toThrow();
    });
  });

  describe('buildCxmlSetupResponse', () => {
    it('should generate valid XML response', () => {
      const xml = service.buildCxmlSetupResponse(
        'http://localhost:5500/search?oci_session=abc123',
      );

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<cXML');
      expect(xml).toContain('<PunchOutSetupResponse');
      expect(xml).toContain('<StartPage');
      expect(xml).toContain(
        'http://localhost:5500/search?oci_session=abc123',
      );
    });

    it('should include success status code 200', () => {
      const xml = service.buildCxmlSetupResponse('http://example.com');
      expect(xml).toContain('code="200"');
      expect(xml).toContain('Success');
    });
  });

  describe('buildCxmlPunchOutOrderMessage', () => {
    it('should generate cXML PunchOutOrderMessage with items', () => {
      const xml = service.buildCxmlPunchOutOrderMessage('bc-12345', [
        {
          description: 'Dell Latitude 5550',
          quantity: 3,
          unit: 'EA',
          price: 1049.0,
          currency: 'EUR',
          vendorMat: 'LAT-5550',
          vendor: 'Bechtle AG',
        },
      ]);

      expect(xml).toContain('<PunchOutOrderMessage>');
      expect(xml).toContain('<BuyerCookie>bc-12345</BuyerCookie>');
      expect(xml).toContain('<ItemIn quantity="3">');
      expect(xml).toContain('<Money currency="EUR">1049.00</Money>');
      expect(xml).toContain('Dell Latitude 5550');
      expect(xml).toContain('LAT-5550');
    });
  });

  describe('processCxmlOrder', () => {
    it('should parse OrderRequest and return order items', () => {
      const orderXml = `<?xml version="1.0" encoding="UTF-8"?>
<cXML payloadID="order-001" timestamp="2024-06-15T10:00:00Z">
  <Header>
    <From><Credential domain="NetworkId"><Identity>buyer@example.com</Identity></Credential></From>
    <To><Credential domain="NetworkId"><Identity>supplier@example.com</Identity></Credential></To>
    <Sender><Credential domain="NetworkId"><Identity>sender@example.com</Identity><SharedSecret>secret</SharedSecret></Credential></Sender>
  </Header>
  <Request>
    <OrderRequest>
      <OrderRequestHeader orderID="PO-001" orderDate="2024-06-15">
        <Total><Money currency="EUR">3147.00</Money></Total>
      </OrderRequestHeader>
      <ItemOut quantity="3" lineNumber="1">
        <ItemID><SupplierPartID>LAT-5550</SupplierPartID></ItemID>
        <ItemDetail>
          <UnitPrice><Money currency="EUR">1049.00</Money></UnitPrice>
          <Description>Dell Latitude 5550</Description>
          <UnitOfMeasure>EA</UnitOfMeasure>
        </ItemDetail>
      </ItemOut>
    </OrderRequest>
  </Request>
</cXML>`;

      const result = service.processCxmlOrder(orderXml);
      expect(result.orderId).toBe('PO-001');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].description).toBe('Dell Latitude 5550');
      expect(result.items[0].quantity).toBe(3);
      expect(result.items[0].unitPrice).toBe(1049.0);
      expect(result.items[0].supplierPartId).toBe('LAT-5550');
    });

    it('should throw on invalid OrderRequest XML', () => {
      expect(() => service.processCxmlOrder('not xml')).toThrow();
    });
  });

  describe('buildCxmlOrderResponse', () => {
    it('should generate order confirmation response', () => {
      const xml = service.buildCxmlOrderResponse('PO-001');
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('code="200"');
      expect(xml).toContain('PO-001');
    });
  });

  // ─── Unit Mapping ─────────────────────────────────────────

  describe('mapUnitToISO', () => {
    it('should map German unit names to ISO codes', () => {
      expect(service.mapUnitToISO('Stück')).toBe('EA');
      expect(service.mapUnitToISO('Packung')).toBe('PK');
      expect(service.mapUnitToISO('Karton')).toBe('CT');
      expect(service.mapUnitToISO('Palette')).toBe('PF');
      expect(service.mapUnitToISO('Liter')).toBe('LT');
      expect(service.mapUnitToISO('Kilogramm')).toBe('KG');
      expect(service.mapUnitToISO('Meter')).toBe('MT');
    });

    it('should return input if no mapping exists', () => {
      expect(service.mapUnitToISO('EA')).toBe('EA');
      expect(service.mapUnitToISO('PCE')).toBe('PCE');
    });
  });
});
