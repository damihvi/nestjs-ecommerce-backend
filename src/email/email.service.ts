import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Aquí integrarías con tu proveedor de email (SendGrid, Mailgun, etc.)
      // Por ahora, solo simulamos el envío
      console.log('Sending email:', {
        to: options.to,
        subject: options.subject,
        from: options.from || this.configService.get('DEFAULT_FROM_EMAIL'),
      });
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <h1>¡Bienvenido ${name}!</h1>
      <p>Gracias por registrarte en nuestro ecommerce.</p>
      <p>Esperamos que disfrutes de tu experiencia de compra.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido a nuestro ecommerce!',
      html,
    });
  }

  async sendOrderConfirmationEmail(email: string, orderId: string, total: number): Promise<boolean> {
    const html = `
      <h1>Confirmación de pedido</h1>
      <p>Tu pedido <strong>#${orderId}</strong> ha sido confirmado.</p>
      <p>Total: $${total.toFixed(2)}</p>
      <p>Te notificaremos cuando tu pedido sea enviado.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Confirmación de pedido #${orderId}`,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Recuperar contraseña</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Restablecer contraseña
      </a>
      <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
      <p>Este enlace expirará en 1 hora.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Recuperar contraseña',
      html,
    });
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`;
    
    const html = `
      <h1>Verificar email</h1>
      <p>Por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verificar email
      </a>
      <p>Si no puedes hacer clic en el enlace, copia y pega la siguiente URL en tu navegador:</p>
      <p>${verificationUrl}</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verificar tu email',
      html,
    });
  }

  async sendOrderShippedEmail(email: string, orderId: string, trackingNumber?: string): Promise<boolean> {
    const html = `
      <h1>Tu pedido ha sido enviado</h1>
      <p>Tu pedido <strong>#${orderId}</strong> ha sido enviado.</p>
      ${trackingNumber ? `<p>Número de seguimiento: <strong>${trackingNumber}</strong></p>` : ''}
      <p>Recibirás tu pedido en los próximos días.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Tu pedido #${orderId} ha sido enviado`,
      html,
    });
  }

  async sendLowStockAlert(email: string, productName: string, currentStock: number): Promise<boolean> {
    const html = `
      <h1>Alerta de stock bajo</h1>
      <p>El producto <strong>${productName}</strong> tiene stock bajo.</p>
      <p>Stock actual: <strong>${currentStock}</strong></p>
      <p>Es recomendable reabastecerlo pronto.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Alerta de stock bajo: ${productName}`,
      html,
    });
  }

  async sendPromotionalEmail(email: string, subject: string, content: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${content}
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}
