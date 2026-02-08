import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { AdminService } from '../admin.service';

@Controller('admin/system-settings')
export class SystemSettingsAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('modus')
  getModus() {
    return this.adminService.getModus();
  }

  @Patch('modus')
  setModus(@Body('modus') modus: string) {
    return this.adminService.setModus(modus);
  }

  @Post('sandbox-daten')
  importSandboxDaten(@Body('modus') modus: string) {
    return this.adminService.importSandboxDaten(modus as 'ADDITIV' | 'ERSETZEND');
  }
}
