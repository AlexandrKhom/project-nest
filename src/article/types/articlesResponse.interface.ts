import { ArticleEntity } from '@app/shared/db/entities/article/article.entity';

export interface ArticlesResponseInterface {
  articles: ArticleEntity[];
  articlesCount: number;
}
