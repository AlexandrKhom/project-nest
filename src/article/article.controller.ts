import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/shared/db/entities/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { S3ManagerService } from '@app/s3-manager/s3-manager.service';
import { UserMailerService } from '@app/user-mailer/user-mailer.service';

@Controller("articles")
export class ArticleController {
  constructor(private readonly articleService: ArticleService,
              private readonly s3ManagerService: S3ManagerService,
              private readonly userMailerService: UserMailerService) {}

  @Get()
  async findAll(
    @User("id") currentUserId: number,
    @Query() query: any
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor("body"))
  async create(
    @User() currentUser: UserEntity,
    @UploadedFile() body: Express.Multer.File,
    @Body() createArticleDto: CreateArticleDto
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto
    );

    const emailArr = await this.articleService.getEmailsFromDescription(createArticleDto);

    const promises = emailArr.map(async (email) => await this.userMailerService.sendEmailAdd(email));
    await Promise.allSettled(promises);

    const filePath = await this.s3ManagerService.listBucketContents(body, currentUser.id);
    const articleWithPhoto = await this.articleService.addPhotoPath(article.slug, filePath);

    return this.articleService.buildArticleResponse(articleWithPhoto);
  }

  @Get(":slug")
  async getSingleArticle(
    @Param("slug") slug: string
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(":slug")
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User("id") currentUserId: number,
    @Param("slug") slug: string
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Put(":slug")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @User("id") currentUserId: number,
    @Param("slug") slug: string,
    @Body("article") updateArticleDto: CreateArticleDto
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(
      slug,
      updateArticleDto,
      currentUserId
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Post(":slug/favorite")
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @User("id") currentUserId: number,
    @Param("slug") slug: string
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      currentUserId
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(":slug/favorite")
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(
    @User("id") currentUserId: number,
    @Param("slug") slug: string
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(
      slug,
      currentUserId
    );
    return this.articleService.buildArticleResponse(article);
  }
}


