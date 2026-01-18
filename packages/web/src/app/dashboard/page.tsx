import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PromptComposer } from '@/components/prompt/PromptComposer';
import { ResponseGrid } from '@/components/response/ResponseGrid';
import { User } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth.getSession();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-12">
      <div className="border-b border-neon-blue/30 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
             <User className="w-8 h-8 text-neon-blue" />
             OPERATOR_DASHBOARD
          </h1>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-2 h-2 bg-neon-green animate-pulse rounded-full"></div>
             <p className="font-mono text-xs text-cyber-text-muted uppercase tracking-widest">
                SESSION_ID: <span className="text-neon-blue">{session.user.id}</span>
             </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <PromptComposer />
        <ResponseGrid />
      </div>
    </div>
  );
}
