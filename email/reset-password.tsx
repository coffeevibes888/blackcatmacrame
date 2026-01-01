import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type ResetPasswordProps = {
  email: string;
  resetLink: string;
};

export default function ResetPassword({ email, resetLink }: ResetPasswordProps) {
  return (
    <Html>
      <Preview>Reset your Macrame Black Cat password</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-slate-950 text-slate-50 m-0 py-10'>
          <Container className='max-w-xl mx-auto px-4'>
            {/* Header */}
            <Section className='text-center mb-6'>
              <Img
                src='https://blackcatmacrame-delta.vercel.app/images/logo.png'
                alt='Macrame Black Cat'
                width='120'
                className='mx-auto mb-3'
              />
              <Text className='text-xs uppercase tracking-[0.25em] text-amber-400 m-0'>
                Account Security
              </Text>
            </Section>

            {/* Main Card */}
            <Section className='bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-3xl px-8 py-10 shadow-2xl'>
              <div className='text-center mb-4'>
                <Text className='text-4xl m-0'>🔐</Text>
              </div>
              
              <Heading className='text-3xl font-bold mb-2 text-center text-slate-50'>
                Reset Your Password
              </Heading>
              
              <Text className='text-sm leading-relaxed text-slate-300 text-center mb-2'>
                Hey {email.split('@')[0]}!
              </Text>
              <Text className='text-sm leading-relaxed text-slate-400 text-center mb-8'>
                We received a request to reset your password. No worries, it happens to the best of us! Click below to create a new one.
              </Text>

              {/* CTA Button */}
              <Section className='text-center mb-8'>
                <Button
                  href={resetLink}
                  className='inline-block rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-12 py-4 text-base font-bold text-white shadow-lg'
                >
                  🔑 Reset Password
                </Button>
              </Section>

              {/* Security Notice */}
              <Section className='bg-slate-800/50 rounded-xl p-4 mb-6'>
                <Text className='text-xs text-slate-400 text-center m-0'>
                  ⏰ This link expires in <strong className='text-amber-400'>1 hour</strong> for your security.
                </Text>
              </Section>

              {/* Divider */}
              <Section className='border-t border-slate-700/50 pt-6'>
                <Text className='text-xs text-slate-500 text-center mb-2'>
                  Or copy this link into your browser:
                </Text>
                <Text className='text-xs text-amber-400 break-all text-center bg-slate-800/50 rounded-lg p-3'>
                  {resetLink}
                </Text>
              </Section>

              {/* Footer Note */}
              <Section className='mt-6 text-center'>
                <Text className='text-[11px] text-slate-500'>
                  Didn&apos;t request this? You can safely ignore this email and your password will remain unchanged.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className='mt-8 text-center'>
              <Text className='text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-1'>
                Macrame Black Cat
              </Text>
              <Text className='text-[10px] text-slate-700'>
                Keeping your account safe ✨
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
