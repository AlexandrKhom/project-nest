import { UserEntity } from '@app/shared/db/entities/user/user.entity';

export type UserType = Omit<UserEntity, 'hashPassword'>;
