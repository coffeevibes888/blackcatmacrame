import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

type UserThreadParticipant = {
  id: string;
  threadId: string;
  userId: string;
  lastReadAt: Date | null;
  thread: {
    type: string;
    updatedAt: Date;
    messages: {
      content: string | null;
      createdAt: Date | string;
    }[];
  };
};

export default async function UserInboxPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="w-full min-h-screen px-4 py-8 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-200">You need to be signed in to view your inbox.</p>
        </div>
      </main>
    );
  }

  const userId = session.user.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participantThreads = await (prisma as any).threadParticipant.findMany({
    where: { userId },
    include: {
      thread: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { thread: { updatedAt: 'desc' } },
  });

  return (
    <main className="w-full min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Inbox</h1>
          <p className="text-gray-300 text-sm md:text-base">
            Messages and conversations related to your RockEnMyVibe account.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-[0.18em]">
              Conversations
            </h2>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {participantThreads.length === 0 && (
                <p className="text-sm text-slate-400/80">You don&apos;t have any messages yet.</p>
              )}
              {participantThreads.map((p: UserThreadParticipant) => {
                const t = p.thread;
                const last = t.messages[0];
                const preview = last?.content?.slice(0, 80) ?? '';
                const updated = new Date(t.updatedAt).toLocaleString();

                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-3 text-xs text-slate-200/90 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/90">
                        {t.type === 'dm' ? 'Direct Message' : t.type === 'support' ? 'Support' : 'Contact'}
                      </span>
                      <span className="text-[10px] text-slate-400/90">{updated}</span>
                    </div>
                    <p className="text-[11px] text-slate-300/90 line-clamp-2">
                      {preview || 'No message content'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-6 shadow-inner shadow-slate-950/60 space-y-3 text-sm text-slate-200/90">
            <h2 className="text-base font-semibold text-slate-50 mb-1">How messaging works</h2>
            <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-slate-300/90">
              <li>Support conversations with the RockEnMyVibe team may appear here.</li>
              <li>Future direct messages with other members will also show up in this inbox.</li>
              <li>You can keep everything in one place, separate from external email providers.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
