import { IsNotEmpty } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  readonly description: string;

  readonly body: string;

  readonly filterForBody: string;

  readonly tag?: string;
}
