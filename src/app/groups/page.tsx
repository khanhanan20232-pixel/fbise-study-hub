'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Plus, KeyRound, Crown, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MyGroup {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  ownerName: string;
  memberCount: number;
  sharedCount: number;
  myRole: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [groups, setGroups] = useState<MyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinMsg, setJoinMsg] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/groups');
    }
  }, [user, isLoading, router]);

  async function loadGroups() {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setGroups(data.groups || []);
      setLoadError('');
    } catch {
      setLoadError('Groups load nahi ho sake. Page refresh karke dobara try karein.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    if (newName.trim().length < 3) {
      setCreateError('Group ka naam kam az kam 3 characters ka ho.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      router.push(`/groups/${data.group.id}`);
    } catch (err: any) {
      setCreateError(err.message || 'Group nahi ban saka.');
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError('');
    setJoinMsg('');
    if (!joinCode.trim()) {
      setJoinError('Invite code likhein.');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Join nahi ho saka.');
      setJoinMsg(`Aap "${data.group.name}" group mein shamil ho gaye hain!`);
      setJoinCode('');
      await loadGroups();
      router.push(`/groups/${data.group.id}`);
    } catch (err: any) {
      setJoinError(err.message || 'Join nahi ho saka.');
      setJoining(false);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-fbise-600 p-3 text-white">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Groups</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Doston ke sath group banayein, quizzes share karein, group chat karein aur leaderboard par muqabla karein.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-3">
            <Plus className="h-5 w-5 text-fbise-600" /> Naya Group Banayein
          </h2>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Group ka naam (masalan: Physics Squad 9th)"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-fbise-500"
            maxLength={60}
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Chhoti si tafseel (optional)"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-fbise-500"
            maxLength={200}
          />
          {createError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{createError}</p>}
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-xl bg-fbise-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fbise-700 disabled:opacity-60"
          >
            {creating ? 'Ban raha hai...' : 'Group Banayein'}
          </button>
        </form>

        <form onSubmit={handleJoin} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-3">
            <KeyRound className="h-5 w-5 text-fbise-600" /> Invite Code Se Join Karein
          </h2>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Invite code (masalan: K7MP2Q)"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm mb-3 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-fbise-500"
            maxLength={8}
          />
          {joinError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{joinError}</p>}
          {joinMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">{joinMsg}</p>}
          <button
            type="submit"
            disabled={joining}
            className="w-full rounded-xl bg-fbise-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fbise-700 disabled:opacity-60"
          >
            {joining ? 'Join ho raha hai...' : 'Group Join Karein'}
          </button>
          <p className="text-xs text-slate-400 mt-2">Dost se us ke group ka invite code mangwayein — code group page par dikhta hai.</p>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Mere Groups</h2>
      {loading ? (
        <div className="flex items-center text-slate-500 py-8">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Groups load ho rahe hain...
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Abhi aap kisi group mein nahi hain. Upar se naya group banayein ya invite code se dost ke group mein shamil hon.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-fbise-400 hover:shadow transition"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{g.name}</h3>
                {g.myRole === 'OWNER' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                    <Crown className="h-3 w-3" /> Owner
                  </span>
                )}
              </div>
              {g.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{g.description}</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.memberCount} members</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {g.sharedCount} shared quizzes</span>
                <span>Owner: {g.ownerName}</span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono tracking-widest">{g.inviteCode}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
