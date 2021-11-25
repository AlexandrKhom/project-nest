import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '@app/shared/db/entities/user/user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
