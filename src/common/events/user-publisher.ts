import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { UserCreatedEvent } from './user-created';
import {
  MAIL_SERVICE,
  USER_CREATED_EVENT,
} from '../messaging/constants';
import { User } from '../../users/user.entity';

@Injectable()
export class UserEventsPublisher {
  private readonly logger = new Logger(UserEventsPublisher.name);

  constructor(@Inject(MAIL_SERVICE) private readonly client: ClientProxy) {}

  async publishUserCreated(user: User): Promise<void> {
    const event: UserCreatedEvent = {
      userId: user.id,
      name: user.name,
      email: user.email,
    };

    try {
      await lastValueFrom(
        this.client.emit(USER_CREATED_EVENT, event).pipe(timeout(5000)),
        { defaultValue: undefined },
      );
      this.logger.log(
        `Evento ${USER_CREATED_EVENT} publicado (userId=${user.id})`,
      );
    } catch (error) {
      this.logger.error(
        `Falha ao publicar ${USER_CREATED_EVENT} (userId=${user.id})`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}