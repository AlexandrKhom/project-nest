import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthMiddleware } from '@app/user/middlewares/auth.middleware';
import { ArticleModule } from './article/article.module';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { GoogleOauthController } from './google-oauth/google-oauth.controller';
import { GoogleOauthModule } from './google-oauth/google-oauth.module';

//MY TYPEORM(psql), AWS and other
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [__dirname + '/shared/db/entities/**/*.entity.{js,ts}'],
      migrationsTableName: 'migration',
      migrations: [__dirname + '/migrations/*.js'],
      cli: {
        migrationsDir: 'src/migrations'
      },
      synchronize: true
    }),
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: process.env.S3_BUCKET_REGION,
        accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY
      },
      services: [S3]
    }),
    UserModule,
    ArticleModule,
    GoogleOauthModule
  ],
  controllers: [AppController, GoogleOauthController],
  providers: [AppService]
})
// user/middlewares/auth.middleware.ts FOR headers.authorization
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    });
  }
}


//docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres -h postgres
