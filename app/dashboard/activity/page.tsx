'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Activity as ActivityIcon,
  ArrowLeft,
  Clock,
  CalendarDays,
  Flame,
  Target,
  TrendingUp,
  RefreshCcw,
  Loader2,
  Sun,
  Sunset,
  Trophy,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────
interface LogEntry {
  id: number;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  task: string | null;
  pmTimeIn: string | null;
  pmTimeOut: string | null;
  pmTask: string | null;
  totalHours: string | null;
  status: string;
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const PH_TIMEZONE = 'Asia/Manila';
const WEEKLY_GOAL_HOURS = 40;
const HEATMAP_WEEKS = 12;

function phDateKey(d: Date): string {
  // en-CA yields yyyy-mm-dd
  return d.toLocaleDateString('en-CA', { timeZone: PH_TIMEZONE });
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function sessionMinutes(startIso: string | null, endIso: string | null): number {
  if (!startIso || !endIso) return 0;
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return ms > 0 ? Math.floor(ms / 60000) : 0;
}

function entryMinutes(log: LogEntry): number {
  return sessionMinutes(log.timeIn, log.timeOut) + sessionMinutes(log.pmTimeIn, log.pmTimeOut);
}

function fmtHM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

function fmtClock(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: PH_TIMEZONE,
  });
}

function getDayLabel(dateStr: string): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date(dateStr + 'T00:00:00').getDay()];
}

function heatmapLevel(minutes: number): number {
  if (minutes <= 0) return 0;
  const hours = minutes / 60;
  if (hours < 2) return 1;
  if (hours < 4) return 2;
  if (hours < 6) return 3;
  return 4;
}

const LEVEL_STYLES: Record<number, string> = {
  0: 'bg-zinc-800/60 border border-zinc-800',
  1: 'bg-orange-950/80 border border-orange-900/50',
  2: 'bg-orange-700/70 border border-orange-600/40',
  3: 'bg-orange-500/80 border border-orange-400/50',
  4: 'bg-orange-400 border border-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.5)]',
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await axios.get<LogEntry[]>('/api/logbook');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLogs();
    }
  }, [status, fetchLogs]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    // Map date -> minutes
    const dayMinutes = new Map<string, number>();
    let totalMinutes = 0;
    let totalSessions = 0;

    logs.forEach((log) => {
      const am = sessionMinutes(log.timeIn, log.timeOut);
      const pm = sessionMinutes(log.pmTimeIn, log.pmTimeOut);
      const total = am + pm;
      if (am > 0) totalSessions += 1;
      if (pm > 0) totalSessions += 1;
      if (total > 0) {
        totalMinutes += total;
        dayMinutes.set(log.date, (dayMinutes.get(log.date) || 0) + total);
      }
    });

    const activeDays = dayMinutes.size;

    // Streak: walk back from today (PH) while the day is in dayMinutes
    const todayKey = phDateKey(new Date());
    let streak = 0;
    let cursor = new Date(todayKey + 'T12:00:00');
    // If today has no log, start counting from yesterday (common UX)
    if (!dayMinutes.has(todayKey)) {
      cursor = addDays(cursor, -1);
    }
    while (dayMinutes.has(phDateKey(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    // Weekly total (Mon–Sun in PH)
    const now = new Date();
    const todayPh = new Date(phDateKey(now) + 'T12:00:00');
    const weekday = todayPh.getDay(); // 0=Sun..6=Sat
    const diffFromMonday = (weekday + 6) % 7;
    const monday = addDays(todayPh, -diffFromMonday);
    let weeklyMinutes = 0;
    for (let i = 0; i < 7; i++) {
      const key = phDateKey(addDays(monday, i));
      weeklyMinutes += dayMinutes.get(key) || 0;
    }

    // Longest streak across history
    const sortedKeys = Array.from(dayMinutes.keys()).sort();
    let longestStreak = 0;
    let running = 0;
    let prev: Date | null = null;
    for (const k of sortedKeys) {
      const d = new Date(k + 'T12:00:00');
      if (prev && (d.getTime() - prev.getTime()) / 86400000 === 1) {
        running += 1;
      } else {
        running = 1;
      }
      if (running > longestStreak) longestStreak = running;
      prev = d;
    }

    return {
      totalMinutes,
      totalSessions,
      activeDays,
      streak,
      longestStreak,
      weeklyMinutes,
      dayMinutes,
    };
  }, [logs]);

  // ── Heatmap grid (12 weeks x 7 days, Mon..Sun) ───────────────────────────
  const heatmap = useMemo(() => {
    const todayPh = new Date(phDateKey(new Date()) + 'T12:00:00');
    const weekday = todayPh.getDay();
    const diffFromMonday = (weekday + 6) % 7;
    const thisMonday = addDays(todayPh, -diffFromMonday);
    const startMonday = addDays(thisMonday, -(HEATMAP_WEEKS - 1) * 7);

    const weeks: { key: string; minutes: number; isFuture: boolean; dayIdx: number }[][] = [];
    for (let w = 0; w < HEATMAP_WEEKS; w++) {
      const row: { key: string; minutes: number; isFuture: boolean; dayIdx: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const cell = addDays(startMonday, w * 7 + d);
        const key = phDateKey(cell);
        const isFuture = cell.getTime() > todayPh.getTime();
        row.push({
          key,
          minutes: stats.dayMinutes.get(key) || 0,
          isFuture,
          dayIdx: d,
        });
      }
      weeks.push(row);
    }
    return weeks;
  }, [stats.dayMinutes]);

  // Recent activity (last 10 by date)
  const recent = useMemo(() => {
    return [...logs]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 10);
  }, [logs]);

  // ── Guards ───────────────────────────────────────────────────────────────
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  const weeklyPct = Math.min(100, Math.round((stats.weeklyMinutes / (WEEKLY_GOAL_HOURS * 60)) * 100));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 p-4 md:p-8 w-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.35)]">
                <ActivityIcon className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
                  Activity Tracker
                </h1>
                <p className="text-zinc-500 text-sm">
                  {session?.user?.name ? `${session.user.name}'s ` : ''}productivity at a glance
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:border-orange-500/50 hover:text-orange-500 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            <span className="text-sm">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
            <span className="text-sm tracking-wider">Loading activity…</span>
          </div>
        ) : logs.length === 0 ? (
          <Card className="bg-zinc-900/80 border-zinc-800 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/70 mb-4">
              <ActivityIcon className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-1">No activity yet</h3>
            <p className="text-sm text-zinc-500 mb-5">
              Start tracking by clocking in from your dashboard.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </Card>
        ) : (
          <>
            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <KpiCard
                label="Total Hours"
                value={fmtHM(stats.totalMinutes)}
                hint={`${stats.totalSessions} sessions`}
                icon={<Clock className="w-4 h-4" />}
                accent="orange"
              />
              <KpiCard
                label="Active Days"
                value={String(stats.activeDays)}
                hint="unique days logged"
                icon={<CalendarDays className="w-4 h-4" />}
                accent="amber"
              />
              <KpiCard
                label="Current Streak"
                value={`${stats.streak}d`}
                hint={`longest ${stats.longestStreak}d`}
                icon={<Flame className="w-4 h-4" />}
                accent="rose"
              />
              <KpiCard
                label="This Week"
                value={fmtHM(stats.weeklyMinutes)}
                hint={`${weeklyPct}% of goal`}
                icon={<TrendingUp className="w-4 h-4" />}
                accent="emerald"
              />
            </div>

            {/* ── Weekly goal ── */}
            <Card className="bg-zinc-900/80 border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">Weekly Goal</div>
                    <div className="text-[11px] text-zinc-500">
                      {fmtHM(stats.weeklyMinutes)} of {WEEKLY_GOAL_HOURS}h 0m
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'border-zinc-700 text-xs font-mono',
                    weeklyPct >= 100
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : weeklyPct >= 60
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                        : 'text-zinc-400'
                  )}
                >
                  {weeklyPct}%
                </Badge>
              </div>

              <div className="relative h-3 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    weeklyPct >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : 'bg-gradient-to-r from-orange-500 to-amber-400'
                  )}
                  style={{ width: `${weeklyPct}%` }}
                />
              </div>

              {weeklyPct >= 100 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Goal reached for this week!</span>
                </div>
              )}
            </Card>

            {/* ── Heatmap + Recent list ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Heatmap */}
              <Card className="lg:col-span-3 bg-zinc-900/80 border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">Activity Heatmap</div>
                      <div className="text-[11px] text-zinc-500">
                        Last {HEATMAP_WEEKS} weeks
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <span>Less</span>
                    {[0, 1, 2, 3, 4].map((lvl) => (
                      <div key={lvl} className={cn('w-3 h-3 rounded-sm', LEVEL_STYLES[lvl])} />
                    ))}
                    <span>More</span>
                  </div>
                </div>

                <ScrollArea className="w-full">
                  <div className="flex gap-3 pb-2">
                    {/* Weekday labels */}
                    <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-600 pt-[2px]">
                      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                        <div key={d} className="h-3.5 flex items-center">{d}</div>
                      ))}
                    </div>

                    {/* Weeks */}
                    <div className="flex gap-1">
                      {heatmap.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1">
                          {week.map((cell) => {
                            const level = cell.isFuture ? -1 : heatmapLevel(cell.minutes);
                            const tooltip = cell.isFuture
                              ? cell.key
                              : `${cell.key} — ${fmtHM(cell.minutes)}`;
                            return (
                              <div
                                key={cell.key}
                                title={tooltip}
                                className={cn(
                                  'w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-default',
                                  level === -1
                                    ? 'bg-transparent border border-dashed border-zinc-800/60'
                                    : LEVEL_STYLES[level]
                                )}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>

                {/* Mobile legend */}
                <div className="flex sm:hidden items-center justify-end gap-1.5 text-[10px] text-zinc-500 mt-2">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((lvl) => (
                    <div key={lvl} className={cn('w-3 h-3 rounded-sm', LEVEL_STYLES[lvl])} />
                  ))}
                  <span>More</span>
                </div>
              </Card>

              {/* Recent activity timeline */}
              <Card className="lg:col-span-2 bg-zinc-900/80 border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <ActivityIcon className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">Recent Activity</div>
                      <div className="text-[11px] text-zinc-500">Latest {recent.length} entries</div>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[360px] pr-3">
                  <div className="space-y-3">
                    {recent.map((log, i) => {
                      const mins = entryMinutes(log);
                      return (
                        <div
                          key={log.id}
                          className="relative pl-6 pr-1"
                        >
                          {/* Timeline line */}
                          {i !== recent.length - 1 && (
                            <div className="absolute left-[7px] top-5 bottom-[-12px] w-px bg-zinc-800" />
                          )}
                          {/* Dot */}
                          <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-orange-500/20 border border-orange-500/60 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          </div>

                          <div className="rounded-lg bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition-colors p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-zinc-200">
                                  {log.date}
                                </span>
                                <span className="text-[10px] font-mono text-orange-500/80">
                                  {getDayLabel(log.date)}
                                </span>
                              </div>
                              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] font-mono">
                                {fmtHM(mins)}
                              </Badge>
                            </div>

                            <div className="space-y-1.5">
                              {log.timeIn && (
                                <div className="flex items-center gap-2 text-[11px]">
                                  <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="font-mono text-zinc-400">
                                    {fmtClock(log.timeIn)} – {fmtClock(log.timeOut)}
                                  </span>
                                  {log.task && (
                                    <span className="text-zinc-500 truncate">· {log.task}</span>
                                  )}
                                </div>
                              )}
                              {log.pmTimeIn && (
                                <div className="flex items-center gap-2 text-[11px]">
                                  <Sunset className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="font-mono text-zinc-400">
                                    {fmtClock(log.pmTimeIn)} – {fmtClock(log.pmTimeOut)}
                                  </span>
                                  {log.pmTask && (
                                    <span className="text-zinc-500 truncate">· {log.pmTask}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>
            </div>

            {/* Footer summary */}
            <Separator className="bg-zinc-800" />
            <div className="flex items-center justify-between text-[11px] text-zinc-600 font-mono pb-2">
              <span>TOTAL ENTRIES · {logs.length}</span>
              <span>TIMEZONE · {PH_TIMEZONE}</span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
type AccentColor = 'orange' | 'amber' | 'rose' | 'emerald';

const ACCENT_STYLES: Record<AccentColor, { icon: string; glow: string }> = {
  orange: {
    icon: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    glow: 'shadow-[0_0_20px_-8px_rgba(249,115,22,0.4)]',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    glow: 'shadow-[0_0_20px_-8px_rgba(245,158,11,0.4)]',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    glow: 'shadow-[0_0_20px_-8px_rgba(251,113,133,0.4)]',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    glow: 'shadow-[0_0_20px_-8px_rgba(16,185,129,0.4)]',
  },
};

function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  accent: AccentColor;
}) {
  const styles = ACCENT_STYLES[accent];
  return (
    <Card className={cn('bg-zinc-900/80 border-zinc-800 p-4 hover:border-zinc-700 transition-colors')}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          {label}
        </span>
        <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center', styles.icon)}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</div>
      {hint && <div className="text-[11px] text-zinc-500 mt-0.5">{hint}</div>}
    </Card>
  );
}
