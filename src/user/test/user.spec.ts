import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserRepository } from '@app/user/user.repository';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  const mockUser = {
    id: 1,
    username: 'string',
    email: 'string',
    bio: 'string',
    image: 'string',
    password: 'string',
    articles: [],
    favorites: []
  };

  const mockCreateUser: CreateUserDto = {
    username: 'string',
    email: 'string',
    password: 'string'
  };

  const mockUserId = 1;

  const mockUserNameOrEmail = 'string';

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository
        }
      ]
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(UserRepository));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    describe('when create user', () => {
      it('should return success', async () => {
        mockUserRepository.findOne.mockReturnValue(Promise.resolve(undefined));

        mockUserRepository.findOne.mockReturnValue(Promise.resolve(undefined));

        mockUserRepository.save.mockReturnValue(Promise.resolve(mockUser));

        expect(await userService.createUser(mockCreateUser)).toEqual(mockUser);
      });
      it('should return an error when username or email is already exist', async () => {
        mockUserRepository.findOne.mockReturnValue(
          Promise.resolve(mockUserNameOrEmail)
        );

        await expect(userService.createUser(mockCreateUser)).rejects.toThrow(
          'email or username are taken'
        );
      });
    });
  });
});
