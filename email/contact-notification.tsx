import {
  Body,
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

type ContactNotificationProps = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  projectType?: string;
};

export default function ContactNotification({
  name,
  email,
  subject,
  message,
  projectType,
}: ContactNotificationProps) {
  return (
    <Html>
      <Preview>New message from {name}</Preview>
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
              <Text className='text-xs uppercase tracking-[0.25em] text-cyan-400 m-0'>
                New Contact Message
              </Text>
            </Section>

            {/* Main Card */}
            <Section className='bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 rounded-3xl px-8 py-10 shadow-2xl'>
              <div className='text-center mb-4'>
                <Text className='text-4xl m-0'>📬</Text>
              </div>
              
              <Heading className='text-2xl font-bold mb-6 text-center text-slate-50'>
                Message from {name}
              </Heading>

              {/* Contact Details */}
              <Section className='bg-slate-800/50 rounded-xl p-4 mb-6'>
                <div className='mb-3'>
                  <Text className='text-[10px] uppercase tracking-wider text-slate-500 m-0 mb-1'>From</Text>
                  <Text className='text-sm text-slate-200 m-0'>{name}</Text>
                </div>
                <div className='mb-3'>
                  <Text className='text-[10px] uppercase tracking-wider text-slate-500 m-0 mb-1'>Email</Text>
                  <Text className='text-sm text-cyan-400 m-0'>{email}</Text>
                </div>
                {subject && (
                  <div className='mb-3'>
                    <Text className='text-[10px] uppercase tracking-wider text-slate-500 m-0 mb-1'>Subject</Text>
                    <Text className='text-sm text-slate-200 m-0'>{subject}</Text>
                  </div>
                )}
                {projectType && (
                  <div>
                    <Text className='text-[10px] uppercase tracking-wider text-slate-500 m-0 mb-1'>Project Type</Text>
                    <Text className='text-sm text-slate-200 m-0'>{projectType}</Text>
                  </div>
                )}
              </Section>

              {/* Message */}
              <Section className='border border-slate-700/50 rounded-xl p-5'>
                <Text className='text-xs uppercase tracking-wider text-slate-500 mb-3'>Message</Text>
                <Text className='text-sm text-slate-300 leading-relaxed whitespace-pre-wrap m-0'>
                  {message}
                </Text>
              </Section>

              {/* Reply Note */}
              <Section className='mt-6 text-center'>
                <Text className='text-xs text-slate-500'>
                  💡 Reply directly to this email to respond to {name}
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className='mt-8 text-center'>
              <Text className='text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-1'>
                Macrame Black Cat
              </Text>
              <Text className='text-[10px] text-slate-700'>
                Contact Form Notification
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
