import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { CreateRahmenvertragDto } from '../dto/create-rahmenvertrag.dto';
import { UpdateRahmenvertragDto } from '../dto/update-rahmenvertrag.dto';

@Controller('admin/rahmenvertraege')
export class RahmenvertragAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll() {
    return this.adminService.findAllRahmenvertraege();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOneRahmenvertrag(id);
  }

  @Post()
  create(@Body() dto: CreateRahmenvertragDto) {
    return this.adminService.createRahmenvertrag(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRahmenvertragDto) {
    return this.adminService.updateRahmenvertrag(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.adminService.deleteRahmenvertrag(id);
  }
}
