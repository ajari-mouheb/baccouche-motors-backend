import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async send(options: SendMailOptions): Promise<boolean> {
    if (!this.transporter) {
      // No SMTP configured - log and skip (useful for dev)
      console.warn('[EmailService] SMTP not configured, skipping email:', options.subject, '->', options.to);
      return false;
    }

    const from = this.configService.get<string>('SMTP_FROM', 'noreply@baccouche-motors.com');

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to send email:', err);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const fullLink = resetLink.startsWith('http') ? resetLink : `${appUrl}/reset-password?token=${resetLink}`;

    return this.send({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Baccouche Motors',
      html: `
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="${fullLink}">Cliquez ici pour réinitialiser votre mot de passe</a></p>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        <p>— L'équipe Baccouche Motors</p>
      `,
      text: `Réinitialisation de votre mot de passe. Cliquez sur ce lien: ${fullLink}`,
    });
  }

  async sendTestDriveConfirmationEmail(
    email: string,
    name: string,
    model: string,
    preferredDate: string,
    timeSlot: string,
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Demande d\'essai reçue - Baccouche Motors',
      html: `
        <h2>Bonjour ${name},</h2>
        <p>Nous avons bien reçu votre demande d'essai pour le véhicule <strong>${model}</strong>.</p>
        <p><strong>Date préférée:</strong> ${preferredDate}</p>
        <p><strong>Créneau:</strong> ${timeSlot === 'morning' ? 'Matin' : 'Après-midi'}</p>
        <p>Notre équipe vous contactera prochainement pour confirmer votre rendez-vous.</p>
        <p>— L'équipe Baccouche Motors</p>
      `,
    });
  }

  async sendContactConfirmationEmail(name: string, email: string, subject: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Nous avons bien reçu votre message - Baccouche Motors',
      html: `
        <h2>Bonjour ${name},</h2>
        <p>Nous avons bien reçu votre message concernant: <strong>${subject}</strong>.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>— L'équipe Baccouche Motors</p>
      `,
    });
  }

  async sendTestDriveStatusChangeEmail(
    email: string,
    name: string,
    model: string,
    status: string,
  ): Promise<boolean> {
    const statusText =
      status === 'confirmed'
        ? 'confirmé'
        : status === 'completed'
          ? 'terminé'
          : status === 'rejected'
            ? 'refusé'
            : status;

    return this.send({
      to: email,
      subject: `Mise à jour de votre essai - Baccouche Motors`,
      html: `
        <h2>Bonjour ${name},</h2>
        <p>Votre demande d'essai pour le véhicule <strong>${model}</strong> a été <strong>${statusText}</strong>.</p>
        <p>— L'équipe Baccouche Motors</p>
      `,
    });
  }
}
