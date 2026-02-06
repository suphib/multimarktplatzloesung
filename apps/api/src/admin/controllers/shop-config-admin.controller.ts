import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { UpdateShopConfigDto } from '../dto/update-shop-config.dto';

@Controller('admin/shop-configs')
export class ShopConfigAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll() {
    return this.adminService.findAllShopConfigs();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShopConfigDto) {
    return this.adminService.updateShopConfig(id, dto);
  }

  @Post(':id/sync')
  triggerSync(@Param('id') id: string) {
    return this.adminService.triggerSync(id);
  }
}
