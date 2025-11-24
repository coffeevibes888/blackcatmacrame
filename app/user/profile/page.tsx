import { Metadata } from 'next';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import ProfileForm from './profile-form';

export const metadata: Metadata = {
  title: 'Customer Profile',
};

const Profile = async () => {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className='w-full min-h-screen px-4 py-8 md:px-8'>
        <div className='max-w-7xl mx-auto space-y-8'>
          <div className='flex flex-col gap-4'>
            <div>
              <h1 className='text-4xl md:text-5xl font-bold text-white mb-2'>Profile Settings</h1>
              <p className='text-gray-300'>Manage your account information and preferences</p>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4 shadow-inner shadow-slate-950/60 space-y-2 text-sm text-slate-200/90'>
                <h2 className='text-base font-semibold text-slate-50'>Contact Support</h2>
                <p className='text-xs text-slate-300/90'>
                  Need help with an order, your account, or a custom project? Reach out to RockEnMyVibe support.
                </p>
                <div className='flex flex-wrap gap-2 pt-1 text-xs'>
                  <a
                    href='/contact'
                    className='inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-3 py-1.5 font-semibold text-slate-950 shadow-lg shadow-violet-500/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300'
                  >
                    Send a message
                  </a>
                  <a
                    href='tel:+1-000-000-0000'
                    className='inline-flex items-center justify-center rounded-lg border border-white/15 bg-slate-900/60 px-3 py-1.5 font-medium text-slate-100 hover:bg-slate-800/80 transition'
                  >
                    Call support
                  </a>
                  <a
                    href='mailto:support@rockenmyvibe.com'
                    className='inline-flex items-center justify-center rounded-lg border border-white/15 bg-slate-900/60 px-3 py-1.5 font-medium text-slate-100 hover:bg-slate-800/80 transition'
                  >
                    Email support
                  </a>
                </div>
              </div>
            </div>
          </div>
          <ProfileForm />
        </div>
      </div>
    </SessionProvider>
  );
};

export default Profile;
