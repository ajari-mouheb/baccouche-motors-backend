import { Test, TestingModule } from '@nestjs/testing';
import { EventsHandler } from './notifications/events.handler';
import { EmailService } from './email/email.service';

describe('EventsHandler', () => {
  let eventsHandler: EventsHandler;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventsHandler],
      providers: [
        {
          provide: EmailService,
          useValue: { send: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    eventsHandler = app.get<EventsHandler>(EventsHandler);
  });

  it('should be defined', () => {
    expect(eventsHandler).toBeDefined();
  });
});
