import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { StorageService } from './storage.service';
import { BundleDto } from './storage.dto';
import { StandardApiResponse } from '../common/common.struct';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @Post('storage/bundle')
  async bundleFiles(
    @Body() dto: BundleDto
  ) {
    const data = await this.storageService.bundle(dto.archiveKey, dto.objectKeys);
    return new StandardApiResponse(HttpStatus.OK, 'Bundled', data);
  }
}
