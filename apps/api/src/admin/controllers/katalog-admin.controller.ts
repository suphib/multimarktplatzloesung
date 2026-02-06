import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { CreateKatalogArtikelDto } from '../dto/create-katalog-artikel.dto';
import { QueryFrameworkItemsDto } from '../dto/query-framework-items.dto';

@Controller('admin/katalog')
export class KatalogAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll(@Query() query: QueryFrameworkItemsDto) {
    return this.adminService.findKatalogArtikel(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOneKatalogArtikel(id);
  }

  @Post()
  create(@Body() dto: CreateKatalogArtikelDto) {
    return this.adminService.createKatalogArtikel(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateKatalogArtikelDto>) {
    return this.adminService.updateKatalogArtikel(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.adminService.deleteKatalogArtikel(id);
  }
}
