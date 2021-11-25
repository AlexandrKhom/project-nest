import { Request } from 'express';
import { UserEntity } from '@app/shared/db/entities/user/user.entity';

export interface ExpressRequestInterface extends Request {
  user?: UserEntity;
}
