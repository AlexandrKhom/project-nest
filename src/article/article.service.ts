import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/shared/db/entities/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleEntity } from '@app/shared/db/entities/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, In, Repository } from 'typeorm';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.author) {
      queryBuilder.andWhere('articles.author = :id', {
        id: query.author,
      });
    }

    if (query.tag) {
      const tags = query.tag.split(';');
      queryBuilder.andWhere('articles.tag IN (:...tags)', { tags });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne(
        {
          username: query.favorited,
        },
        { relations: ['favorites'] },
      );
      const ids = author.favorites.map((el) => el.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    return { articles, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tag) {
      article.tag = '';
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });

    const isNotFavorited = user.favorites.some((articleInFavorites) => articleInFavorites.id === article.id);

    if (!isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.some((articleInFavorites) => articleInFavorites.id === article.id);

    if (articleIndex) {
      user.favorites = user.favorites.filter((articleInFavorites) => articleInFavorites.id !== article.id);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async addPhotoPath(slug, body): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(article, { body });
    return await this.articleRepository.save(article);
  }

  async updateArticle(
    slug: string,
    updateArticleDto: CreateArticleDto,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUserId) {
      throw new HttpException('U r not an author', HttpStatus.FORBIDDEN);
    }
    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUserId) {
      throw new HttpException('U r not an author', HttpStatus.FORBIDDEN);
    }

    // TODO delete photo from S3

    return await this.articleRepository.delete({ slug });
  }

  async getEmailsFromDescription( dto: CreateArticleDto): Promise<Array<string>> {
    const targetUserNames = dto.description.split(' ').filter(item => item.includes('#')).map(item => item.slice(1));
    const usersForEmail = await this.userRepository.find({where: { username: In(targetUserNames) } })

    return usersForEmail.map(item => item.email);
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
