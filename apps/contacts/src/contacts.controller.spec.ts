import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

describe('ContactsController', () => {
  let contactsController: ContactsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [ContactsService],
    }).compile();

    contactsController = app.get<ContactsController>(ContactsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(contactsController.getHello()).toBe('Hello World!');
    });
  });
});
