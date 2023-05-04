import { Injectable } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { hashPwd } from '../utils/hash-pwd';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import { JwtPayload } from './jwt.strategy';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { userFilter } from '../filters/userFilter';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private createToken(currentTokenId: string): {
    accessToken: string;
    expiresIn: number;
  } {
    const payload: JwtPayload = { id: currentTokenId };
    const expiresIn = 60 * 60 * 24;
    const accessToken = sign(
      payload,
      'JDwoi doi o#OOI F#3fOAoJF*#fooiN hf3OIC OJ o jf#OJCOjoJFo#CO#CoqCMoc#OCMOIDoij oCOMowCOcO#OI3J*#*#*#* FfjCNoo@w*&$08@*&@)*#)(C p9',
      { expiresIn },
    );
    return {
      accessToken,
      expiresIn,
    };
  }

  private async generateToken(user: User): Promise<string> {
    let token;
    let userWithThisToken = null;
    do {
      token = uuid();

      userWithThisToken = await this.prisma.user.findFirst({
        where: {
          currentToken: token,
        },
      });
    } while (!!userWithThisToken);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        currentToken: token,
      },
    });

    return token;
  }

  async login(req: AuthLoginDto, res: Response): Promise<any> {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          email: req.email,
          pwdHash: hashPwd(req.pwd),
        },
      });

      const token = this.createToken(await this.generateToken(user));

      if (!user) {
        return res.status(401).json({ error: 'Invalid login data!' });
      }

      return res
        .cookie('jwt', token.accessToken, {
          secure: true,
          httpOnly: true,
          sameSite: 'none',
        })
        .status(200)
        .json(userFilter(user));
    } catch (e) {
      return res.json({ error: e.message });
    }
  }

  async logout(user: User, res: Response) {
    try {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          currentToken: null,
        },
      });
      res.clearCookie('jwt', {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      });
      return res.json({ ok: true });
    } catch (e) {
      return res.json({ error: e.message });
    }
  }
}
