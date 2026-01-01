import { Resend } from 'resend';
import { render } from '@react-email/components';
import { APP_NAME } from '@/lib/constants';
import { Order } from '@/types';

import PurchaseReceiptEmail from './purchase-receipt';
import VerifyEmail from './verify-email';
import ResetPassword from './reset-password';
import ContactNotification from './contact-notification';
import WelcomeEmail from './welcome-email';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  try {
    const html = await render(<PurchaseReceiptEmail order={order} />);

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to: order.user.email,
      subject: `🛍️ Order Confirmed! #${order.id.slice(-8).toUpperCase()}`,
      html,
    });

    if (error) throw error;
    console.log('✓ Purchase Receipt Email Sent:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('❌ Error sending Purchase Receipt email:', err);
    return { success: false, error: err };
  }
};

export const sendVerificationEmail = async ({
  email,
  verificationLink,
}: {
  email: string;
  verificationLink: string;
}) => {
  try {
    const html = await render(<VerifyEmail email={email} verificationLink={verificationLink} />);

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to: email,
      subject: '✨ Verify your email address',
      html,
    });

    if (error) throw error;
    console.log('✓ Verification Email Sent:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('❌ Error sending verification email:', err);
    return { success: false, error: err };
  }
};

export const sendPasswordResetEmail = async ({
  email,
  resetLink,
}: {
  email: string;
  resetLink: string;
}) => {
  try {
    const html = await render(<ResetPassword email={email} resetLink={resetLink} />);

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to: email,
      subject: '🔐 Reset your password',
      html,
    });

    if (error) throw error;
    console.log('✓ Password Reset Email Sent:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('❌ Error sending password reset email:', err);
    return { success: false, error: err };
  }
};

export const sendWelcomeEmail = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  try {
    const html = await render(<WelcomeEmail email={email} name={name} />);

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to: email,
      subject: `🎉 Welcome to ${APP_NAME}!`,
      html,
    });

    if (error) throw error;
    console.log('✓ Welcome Email Sent:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('❌ Error sending welcome email:', err);
    return { success: false, error: err };
  }
};

export const sendContactNotification = async ({
  name,
  email,
  subject,
  message,
  projectType,
}: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  projectType?: string;
}) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    const html = await render(
      <ContactNotification
        name={name}
        email={email}
        subject={subject}
        message={message}
        projectType={projectType}
      />
    );

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to: adminEmail,
      replyTo: email,
      subject: `📬 New Contact: ${subject || 'Message from ' + name}`,
      html,
    });

    if (error) throw error;
    console.log('✓ Contact Notification Email Sent:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('❌ Error sending contact notification:', err);
    return { success: false, error: err };
  }
};
