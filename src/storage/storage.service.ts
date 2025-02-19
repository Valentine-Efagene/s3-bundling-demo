import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassThrough, Readable } from 'node:stream'
import * as archiver from 'archiver'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ByteLogger } from './util/ByteLogger';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  private config: {
    credentials: {
      accessKeyId: string,
      secretAccessKey: string,
    },
    region: string
  };

  private s3Client: S3Client
  private bucketName: string

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('CUSTOM_AWS_S3_BUCKET_NAME');

    this.config = {
      credentials: {
        accessKeyId: this.configService.get<string>('CUSTOM_AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('CUSTOM_AWS_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get<string>('CUSTOM_AWS_REGION'),
    };

    this.s3Client = new S3Client(this.config);
  }

  public async getObject(key: string) {
    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
    const response = await this.s3Client.send(command)
    return response
  }

  public async uploadStream(key: string, fileStream: PassThrough) {
    try {
      const uploadTask = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileStream, // Can be an unknown-length stream
          ContentType: "application/zip",
        },
      });

      await uploadTask.done()
      this.logger.log(`File uploaded successfully to S3: ${this.bucketName}/${key}`);
    } catch (error) {
      this.logger.error('S3 Upload Error:', error);
      throw error;
    }
  }

  async bundle(archiveKey: string, objectKeys: string[]): Promise<string> {
    const FORMAT = 'zip'
    const archiveStream = archiver(FORMAT)

    archiveStream.on('error', (error: any) => {
      this.logger.error('Archival encountered an error:', error)
      throw new Error(error)
    })

    const passthrough = new PassThrough()
    const byteLogger = new ByteLogger();
    archiveStream.pipe(byteLogger).pipe(passthrough)

    const responses = await Promise.all(objectKeys.map((key) => this.getObject(key)
    ))

    responses.forEach((response, index) => {
      archiveStream.append(response.Body as Readable,
        { name: objectKeys[index].split('/').at(-1) }
      )
    })

    const key = `${archiveKey}.${FORMAT}`

    /**
     * The order of these calls matter
     * You need to initialize the promise for the upload first,
     * so it's open for passthrough, wait for the archive to finalize, 
     * then await the upload promise, else the process gets stuck for 
     * large files
     */

    const uploadPromise = this.uploadStream(key, passthrough)
    await archiveStream.finalize()
    await uploadPromise
    return key
  }
}
