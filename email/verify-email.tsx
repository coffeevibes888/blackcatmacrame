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

type VerifyEmailProps = {
  email: string;
  verificationLink: string;
};

export default function VerifyEmail({ email, verificationLink }: VerifyEmailProps) {
  return (
    <Html>
      <Preview>Verify your email to get started with Macrame Black Cat</Preview>
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
              <Text className='text-xs uppercase tracking-[0.25em] text-violet-400 m-0'>
                Welcome Aboard
              </Text>
            </Section>

            {/* Main Card */}
            <Section className='bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/50 border border-slate-800 rounded-3xl px-8 py-10 shadow-2xl'>
              <Heading className='text-3xl font-bold mb-2 text-center bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent'>
                Verify Your Email
              </Heading>
              
              <Text className='text-sm leading-relaxed text-slate-300 text-center mb-2'>
                Hey there! 👋
              </Text>
              <Text className='text-sm leading-relaxed text-slate-400 text-center mb-8'>
                Thanks for signing up at Macrame Black Cat! Click the button below to verify your email and unlock your account.
              </Text>

              {/* CTA Button */}
              <Section className='text-center mb-8'>
                <Button
                  href={verificationLink}
                  className='inline-block rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-12 py-4 text-base font-bold text-slate-950 shadow-lg'
                >
                  ✨ Verify My Email
                </Button>
              </Section>

              {/* Divider */}
              <Section className='border-t border-slate-700/50 pt-6 mt-6'>
                <Text className='text-xs text-slate-500 text-center mb-2'>
                  Or copy this link into your browser:
                </Text>
                <Text className='text-xs text-violet-400 break-all text-center bg-slate-800/50 rounded-lg p-3'>
                  {verificationLink}
                </Text>
              </Section>

              {/* Footer Note */}
              <Section className='mt-6 text-center'>
                <Text className='text-[11px] text-slate-500'>
                  This link expires in 24 hours. If you didn&apos;t create an account, just ignore this email.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className='mt-8 text-center'>
              <Text className='text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-1'>
                Macrame Black Cat
              </Text>
              <Text className='text-[10px] text-slate-700'>
                Handcrafted with love & intention ✨
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
