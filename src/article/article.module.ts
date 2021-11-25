import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/shared/db/entities/article/article.entity';
import { UserEntity } from '@app/shared/db/entities/user/user.entity';
import { S3ManagerModule } from '@app/s3-manager/s3-manager.module';
import { UserMailerModule } from '@app/user-mailer/user-mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, UserEntity]),
    S3ManagerModule,
    UserMailerModule
  ],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {}
