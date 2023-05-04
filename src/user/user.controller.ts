import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UserObj } from '../decorators/user-obj.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Post('/register')
  register(@Body() newUser: RegisterDto) {
    return this.userService.register(newUser);
  }

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  userInfo(@UserObj() user: User) {
    return this.userService.getFilteredUser(user);
  }
}
