import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../admin.service';

@Controller('admin/dashboard')
export class DashboardAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
