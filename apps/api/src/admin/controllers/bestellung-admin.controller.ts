import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { CreateBestellungDto } from '../dto/create-bestellung.dto';

@Controller('admin/bestellungen')
export class BestellungAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() dto: CreateBestellungDto) {
    return this.adminService.createBestellung(dto);
  }

  @Get()
  findAll() {
    return this.adminService.getBestellungen();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.getBestellung(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.adminService.approveBestellung(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('grund') grund: string) {
    return this.adminService.rejectBestellung(id, grund);
  }
}
