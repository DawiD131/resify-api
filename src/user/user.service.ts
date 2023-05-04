import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { hashPwd } from '../utils/hash-pwd';
import { userFilter } from '../filters/userFilter';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(newUser: RegisterDto) {
    const isUserExists = await this.prisma.user.count({
      where: {
        OR: [{ email: newUser.email }, { username: newUser.username }],
      },
    });

    if (isUserExists) {
      return new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const user = await this.prisma.user.create({
      data: {
        email: newUser.email,
        pwdHash: hashPwd(newUser.pwd),
        name: newUser.name,
        surname: newUser.surname,
        username: newUser.username,
      },
    });

    return userFilter(user);
  }

  async getFilteredUser(user: User) {
    return userFilter(user);
  }
}
