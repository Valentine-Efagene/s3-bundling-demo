import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class BundleDto {
  @ApiProperty({
    description: 'Document relative path in S3, without extension',
    example: 'archive/legal',
  })
  @IsNotEmpty()
  archiveKey: string;

  @ApiProperty({
    type: 'array',
    description: 'Array of object keys to be bundled',
    example: [
      "jobs.png"],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  objectKeys: string[]
}