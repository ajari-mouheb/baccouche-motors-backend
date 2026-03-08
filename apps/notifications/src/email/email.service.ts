import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async send(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('[EmailService] SMTP not configured, skipping:', subject, '->', to);
      return false;
    }
    const from = this.config.get<string>('SMTP_FROM', 'noreply@baccouche-motors.com');
    try {
      await this.transporter.sendMail({ from, to, subject, html, text });
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to send:', err);
      return false;
    }
  }
}
