import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts/contacts.controller';
import { ContactsService } from './contacts/contacts.service';

describe('ContactsController', () => {
  let contactsController: ContactsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: { getStats: jest.fn().mockResolvedValue({ unread: 0 }) },
        },
      ],
    }).compile();

    contactsController = app.get<ContactsController>(ContactsController);
  });

  describe('getStats', () => {
    it('should return stats from service', async () => {
      const result = await contactsController.getStats();
      expect(result).toEqual({ unread: 0 });
    });
  });
});
