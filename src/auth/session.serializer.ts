import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: Function): any {
    done(null, { id: user.id, email: user.email, role: user.role });
  }

  async deserializeUser(
    payload: { id: string; email: string; role: string },
    done: Function,
  ): Promise<any> {
    try {
      const user = await this.usersService.findOne(payload.id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
