import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.from = config.getOrThrow<string>('MAIL_FROM');
    this.transporter = createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port: Number(config.getOrThrow('SMTP_PORT')),
      secure: false,
      ignoreTLS: true,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Bem-vindo(a)!',
      text: `Olá, ${name}! Seu cadastro foi realizado com sucesso.`,
    });
  }
}