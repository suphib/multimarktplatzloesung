import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { OciService } from './oci.service';
import { OciSetupDto } from './dto/oci-setup.dto';
import { OciReturnDto } from './dto/oci-return.dto';

@Controller()
export class OciController {
  constructor(private readonly ociService: OciService) {}

  // ─── OCI Endpoints ─────────────────────────────────────────

  @Post('oci/setup')
  ociSetup(@Body() dto: OciSetupDto, @Req() req: any, @Res() res: any) {
    const session = this.ociService.createOciSession({
      hookUrl: dto.HOOK_URL,
      username: dto.USERNAME,
    });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host?.toString().replace(':3050', ':5500')}`;

    res.redirect(302, `${frontendUrl}/search?oci_session=${session.token}`);
  }

  @Post('oci/return')
  ociReturn(@Body() dto: OciReturnDto, @Res() res: any) {
    const session = this.ociService.validateSession(dto.sessionToken);
    if (!session) {
      throw new BadRequestException('Ungültige oder abgelaufene OCI-Sitzung');
    }

    const html = this.ociService.buildOciReturnForm(session.hookUrl, dto.items);
    res.type('text/html').send(html);
  }

  @Get('oci/session/:token')
  getSession(@Param('token') token: string) {
    const session = this.ociService.validateSession(token);
    if (!session) {
      throw new BadRequestException('Ungültige oder abgelaufene OCI-Sitzung');
    }
    return { valid: true, expiresAt: session.expiresAt };
  }

  @Get('oci/status')
  getStatus() {
    return {
      activeSessions: this.ociService.getActiveSessions(),
    };
  }

  // ─── cXML Endpoints ────────────────────────────────────────

  @Post('cxml/setup')
  cxmlSetup(@Req() req: any, @Res() res: any) {
    let xmlBody = '';
    if (typeof req.body === 'string') {
      xmlBody = req.body;
    } else if (req.rawBody) {
      xmlBody = req.rawBody.toString();
    } else if (req.body && typeof req.body === 'object') {
      xmlBody = JSON.stringify(req.body);
    }

    try {
      const setupRequest = this.ociService.parseCxmlSetupRequest(xmlBody);

      const session = this.ociService.createOciSession({
        hookUrl: setupRequest.browserFormPostUrl,
      });

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host?.toString().replace(':3050', ':5500')}`;

      const startPageUrl = `${frontendUrl}/search?oci_session=${session.token}&buyer_cookie=${encodeURIComponent(setupRequest.buyerCookie)}`;
      const responseXml = this.ociService.buildCxmlSetupResponse(startPageUrl);

      res.type('application/xml').send(responseXml);
    } catch (error) {
      const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<cXML payloadID="error-${Date.now()}" timestamp="${new Date().toISOString()}">
  <Response>
    <Status code="400" text="Bad Request">${error instanceof Error ? error.message : 'Unbekannter Fehler'}</Status>
  </Response>
</cXML>`;
      res.status(400).type('application/xml').send(errorXml);
    }
  }

  @Post('cxml/order')
  cxmlOrder(@Req() req: any, @Res() res: any) {
    let xmlBody = '';
    if (typeof req.body === 'string') {
      xmlBody = req.body;
    } else if (req.rawBody) {
      xmlBody = req.rawBody.toString();
    }

    try {
      const result = this.ociService.processCxmlOrder(xmlBody);
      const responseXml = this.ociService.buildCxmlOrderResponse(result.orderId);
      res.type('application/xml').send(responseXml);
    } catch (error) {
      const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<cXML payloadID="error-${Date.now()}" timestamp="${new Date().toISOString()}">
  <Response>
    <Status code="400" text="Bad Request">${error instanceof Error ? error.message : 'Unbekannter Fehler'}</Status>
  </Response>
</cXML>`;
      res.status(400).type('application/xml').send(errorXml);
    }
  }
}
