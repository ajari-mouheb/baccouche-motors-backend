import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_PATTERNS } from '@app/shared';
import { EmailService } from '../email/email.service';

@Controller()
export class EventsHandler {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern(EVENT_PATTERNS.AUTH_FORGOT_PASSWORD_REQUESTED)
  async handleForgotPassword(@Payload() payload: { email: string; resetLink: string }) {
    await this.emailService.send(
      payload.email,
      'Réinitialisation de votre mot de passe - Baccouche Motors',
      `
      <h2>Réinitialisation de votre mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p><a href="${payload.resetLink}">Cliquez ici pour réinitialiser votre mot de passe</a></p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>— L'équipe Baccouche Motors</p>
    `,
      `Réinitialisation: ${payload.resetLink}`,
    );
  }

  @EventPattern(EVENT_PATTERNS.TEST_DRIVE_CREATED)
  async handleTestDriveCreated(
    @Payload() payload: { email: string; name: string; model: string; preferredDate: string; timeSlot: string },
  ) {
    await this.emailService.send(
      payload.email,
      "Demande d'essai reçue - Baccouche Motors",
      `
      <h2>Bonjour ${payload.name},</h2>
      <p>Nous avons bien reçu votre demande d'essai pour le véhicule <strong>${payload.model}</strong>.</p>
      <p><strong>Date préférée:</strong> ${payload.preferredDate}</p>
      <p><strong>Créneau:</strong> ${payload.timeSlot === 'morning' ? 'Matin' : 'Après-midi'}</p>
      <p>Notre équipe vous contactera prochainement.</p>
      <p>— L'équipe Baccouche Motors</p>
    `,
    );
  }

  @EventPattern(EVENT_PATTERNS.TEST_DRIVE_STATUS_CHANGED)
  async handleTestDriveStatusChanged(
    @Payload() payload: { email: string; name: string; model: string; status: string },
  ) {
    const statusText =
      payload.status === 'confirmed'
        ? 'confirmé'
        : payload.status === 'completed'
          ? 'terminé'
          : payload.status === 'rejected'
            ? 'refusé'
            : payload.status;
    await this.emailService.send(
      payload.email,
      'Mise à jour de votre essai - Baccouche Motors',
      `
      <h2>Bonjour ${payload.name},</h2>
      <p>Votre demande d'essai pour <strong>${payload.model}</strong> a été <strong>${statusText}</strong>.</p>
      <p>— L'équipe Baccouche Motors</p>
    `,
    );
  }

  @EventPattern(EVENT_PATTERNS.CONTACT_CREATED)
  async handleContactCreated(
    @Payload() payload: { email: string; name: string; subject: string },
  ) {
    await this.emailService.send(
      payload.email,
      'Nous avons bien reçu votre message - Baccouche Motors',
      `
      <h2>Bonjour ${payload.name},</h2>
      <p>Nous avons bien reçu votre message concernant: <strong>${payload.subject}</strong>.</p>
      <p>Notre équipe vous répondra dans les plus brefs délais.</p>
      <p>— L'équipe Baccouche Motors</p>
    `,
    );
  }
}
