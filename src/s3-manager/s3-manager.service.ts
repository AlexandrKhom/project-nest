import { Injectable } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3ManagerService {
  constructor(@InjectAwsService(S3) private readonly s3: S3) {}

  async listBucketContents(file: Express.Multer.File, itemId: number): Promise<string> {
    const { buffer, originalname, mimetype } = file;

    const fileName = this._fileNameBuilder(originalname, itemId.toString());

    const response = await this.s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Body: buffer,
      Key: fileName,
      ContentType: mimetype,
      ACL: 'public-read'
    }).promise();

    return response.Location;
  }

  _fileNameBuilder(fileName: string, itemId: string) {
    const fileExtension = extname(fileName);

    return join(itemId, `${uuid()}${fileExtension}`);
  }
}
