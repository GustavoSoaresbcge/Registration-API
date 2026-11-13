import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailStatus } from './email-status.entity';
import { MailConsumer } from './mail.consumer';
import { MailerService } from './mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailStatus])],
  controllers: [MailConsumer],
  providers: [MailerService],
})
export class MailModule {}