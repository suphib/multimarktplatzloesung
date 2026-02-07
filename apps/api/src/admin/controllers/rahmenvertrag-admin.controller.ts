import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
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

  @Post(':id/dokumente')
  @UseInterceptors(FileInterceptor('datei', { limits: { fileSize: 20 * 1024 * 1024 } }))
  uploadDokument(@Param('id') id: string, @UploadedFile() file: any) {
    return this.adminService.uploadDokument(id, file);
  }

  @Delete(':id/dokumente/:dokId')
  @HttpCode(200)
  deleteDokument(@Param('id') id: string, @Param('dokId') dokId: string) {
    return this.adminService.deleteDokument(id, dokId);
  }

  @Get(':id/dokumente/:dokId')
  async getDokument(
    @Param('id') id: string,
    @Param('dokId') dokId: string,
    @Res({ passthrough: true }) res: any,
  ): Promise<StreamableFile> {
    const { path: filepath, dateiname } = await this.adminService.getDokumentFile(id, dokId);
    res.set({
      'Content-Disposition': `attachment; filename="${encodeURIComponent(dateiname)}"`,
    });
    const fileStream = fs.createReadStream(filepath);
    return new StreamableFile(fileStream);
  }
}
