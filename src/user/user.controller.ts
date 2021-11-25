import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/shared/db/entities/user/user.entity';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';
import { DeleteResult } from 'typeorm';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUsers(
    @Body('user') createUserDto: CreateUserDto
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponce(user);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponce(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(
    @User() user: UserEntity
  ): Promise<UserResponseInterface> {
    return this.userService.buildUserResponce(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(
      currentUserId,
      updateUserDto
    );
    return this.userService.buildUserResponce(user);
  }

  @Delete('user')
  @UseGuards(AuthGuard)
  deleteUser(@Request() req): Promise<DeleteResult> {
    return this.userService.removeUserById(req.user.id);
  }

  @Get('users')
  async getAll(): Promise<any> {
    return this.userService.getAll();
  }
}
