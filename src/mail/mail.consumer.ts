import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreatedEvent } from '../common/events/user-created';
import { USER_CREATED_EVENT } from '../common/messaging/constants';
import { EmailStatus } from './email-status.entity';
import { EmailStatusType } from './email-status.enum';
import { MailerService } from './mailer.service';

@Controller()
export class MailConsumer {
  private readonly logger = new Logger(MailConsumer.name);

  constructor(
    @InjectRepository(EmailStatus)
    private readonly emailStatusRepository: Repository<EmailStatus>,
    private readonly mailerService: MailerService,
  ) {}

  @EventPattern(USER_CREATED_EVENT)
  async handleUserCreated(
    @Payload() event: UserCreatedEvent,
    @Ctx() context: unknown,
  ): Promise<void> {
    const rmqContext = context as RmqContext;
    const channel = rmqContext.getChannelRef();
    const message = rmqContext.getMessage();

    try {
      await this.process(event);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        `Falha ao processar ${USER_CREATED_EVENT} (userId=${event.userId})`,
        error instanceof Error ? error.stack : String(error),
      );
      channel.nack(message, false, false);
    }
  }

  private async process(event: UserCreatedEvent): Promise<void> {
    let emailStatus = await this.emailStatusRepository.findOne({
      where: { user: { id: event.userId } },
    });

    if (emailStatus?.status === EmailStatusType.SENT) {
      this.logger.warn(
        `E-mail já enviado, evento ignorado (userId=${event.userId})`,
      );
      return;
    }

    if (!emailStatus) {
      emailStatus = await this.emailStatusRepository.save(
        this.emailStatusRepository.create({
          user: { id: event.userId },
          status: EmailStatusType.PENDING,
        }),
      );
    }

    try {
      await this.mailerService.sendWelcomeEmail(event.email, event.name);
      emailStatus.status = EmailStatusType.SENT;
      emailStatus.errorMessage = null;
      this.logger.log(`E-mail enviado (userId=${event.userId})`);
    } catch (error) {
      emailStatus.status = EmailStatusType.ERROR;
      emailStatus.errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Falha ao enviar e-mail (userId=${event.userId}): ${emailStatus.errorMessage}`,
      );
    }

    await this.emailStatusRepository.save(emailStatus);
  }
}