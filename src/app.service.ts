import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Esta es una app hecha con los genios de programacion III';
  }
}
