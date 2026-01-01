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

type WelcomeEmailProps = {
  email: string;
  name: string;
};

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  const shopUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://blackcatmacrame-delta.vercel.app';
  
  return (
    <Html>
      <Preview>Welcome to Macrame Black Cat! 🐱✨</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-slate-950 text-slate-50 m-0 py-10'>
          <Container className='max-w-xl mx-auto px-4'>
            {/* Header */}
            <Section className='text-center mb-6'>
              <Img
                src='https://blackcatmacrame-delta.vercel.app/images/logo.png'
                alt='Macrame Black Cat'
                width='140'
                className='mx-auto mb-3'
              />
            </Section>

            {/* Main Card */}
            <Section className='bg-gradient-to-br from-slate-900 via-violet-950/20 to-slate-900 border border-slate-800 rounded-3xl px-8 py-10 shadow-2xl'>
              <div className='text-center mb-4'>
                <Text className='text-5xl m-0'>🎉</Text>
              </div>
              
              <Heading className='text-3xl font-bold mb-2 text-center bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent'>
                Welcome, {name}!
              </Heading>
              
              <Text className='text-base leading-relaxed text-slate-300 text-center mb-6'>
                You&apos;re officially part of the Macrame Black Cat family! 🐱
              </Text>

              <Text className='text-sm leading-relaxed text-slate-400 text-center mb-8'>
                Get ready to discover unique, handcrafted macrame jewelry made with love and intention. Each piece is one-of-a-kind, just like you.
              </Text>

              {/* Features */}
              <Section className='mb-8'>
                <div className='bg-slate-800/40 rounded-xl p-4 mb-3'>
                  <Text className='text-sm text-slate-200 m-0'>
                    ✨ <strong>Handcrafted Artistry</strong> — Every knot tied with care
                  </Text>
                </div>
                <div className='bg-slate-800/40 rounded-xl p-4 mb-3'>
                  <Text className='text-sm text-slate-200 m-0'>
                    🌙 <strong>Unique Designs</strong> — No two pieces are exactly alike
                  </Text>
                </div>
                <div className='bg-slate-800/40 rounded-xl p-4'>
                  <Text className='text-sm text-slate-200 m-0'>
                    💜 <strong>Made with Intention</strong> — Infused with positive energy
                  </Text>
                </div>
              </Section>

              {/* CTA Button */}
              <Section className='text-center'>
                <Button
                  href={`${shopUrl}/products`}
                  className='inline-block rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-12 py-4 text-base font-bold text-slate-950 shadow-lg'
                >
                  🛍️ Start Shopping
                </Button>
              </Section>
            </Section>

            {/* Footer */}
            <Section className='mt-8 text-center'>
              <Text className='text-xs text-slate-400 mb-4'>
                Have questions? Just reply to this email — we&apos;d love to hear from you!
              </Text>
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
