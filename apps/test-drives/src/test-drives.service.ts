import { Injectable } from '@nestjs/common';

@Injectable()
export class TestDrivesService {
  getHello(): string {
    return 'Hello World!';
  }
}
