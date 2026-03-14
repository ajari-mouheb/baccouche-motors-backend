import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private users;
  constructor() {
    this.users = [];
  }
  getHello(): string {
    return 'Hello World!';
  }
  getAllUsers() {
    return this.users;
  }
  addUser(user) {
    this.users.push(user);
    return { sucess: true,usersList:this.users };
  }
  updateUser(user, id) {
    this.users[id] = user;
    return this.users;
  }
}
