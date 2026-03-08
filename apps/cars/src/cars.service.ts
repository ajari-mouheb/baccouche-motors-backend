import { Injectable } from '@nestjs/common';

@Injectable()
export class CarsService {
  getHello(): string {
    return 'Hello World!';
  }
}
