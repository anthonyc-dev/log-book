'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Clock,
  Play,
  Square,
  Download,
  Calendar as CalendarIcon,
  CalendarDays,
  Activity,
  FileText,
  Sun,
  Sunset,
  Timer,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText as FileTextIcon,
  Printer,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

type ActiveSession = {
  id: number;
  timeIn: string;
  isAfternoon: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PH_TIMEZONE = 'Asia/Manila';

function toLocalDateTimeString(ts: string | null): string {
  if (!ts) return '';
  const date = new Date(ts);
  // Use Intl to get Philippines local time
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

function fmtTime(ts: string | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: PH_TIMEZONE,
  });
}

function fmtDuration(start: string | null, end: string | null, live: Date) {
  if (!start) return '—';
  const s = new Date(start);
  const e = end ? new Date(end) : live;
  const diff = Math.max(0, Math.floor((e.getTime() - s.getTime()) / 1000));
  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const sec = (diff % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function getDayLabel(dateStr: string) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date(dateStr + 'T00:00:00').getDay()];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LogBook() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [task, setTask] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Date range for export
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [exportAction, setExportAction] = useState<'download' | 'print'>('download');

  // Edit/Delete modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    timeIn: '',
    timeOut: '',
    task: '',
    pmTimeIn: '',
    pmTimeOut: '',
    pmTask: '',
  });

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const [logsRes, activeRes] = await Promise.all([
        axios.get<LogEntry[]>('/api/logbook'),
        axios.get<LogEntry | null>('/api/logbook/time-in'),
      ]);

      setLogs(logsRes.data || []);

      const rec = activeRes.data;
      if (rec) {
        const isAfternoon = !!rec.pmTimeIn && !rec.pmTimeOut;
        const timeIn = isAfternoon ? rec.pmTimeIn! : rec.timeIn!;
        setActiveSession({ id: rec.id, timeIn, isAfternoon });
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleTimeIn = async () => {
    setActionLoading(true);
    try {
      const now = new Date();
      const isPM = now.getHours() >= 12;
      const session: 'morning' | 'afternoon' = isPM ? 'afternoon' : 'morning';

      const res = await axios.post<LogEntry>('/api/logbook/time-in', { session });
      const timeIn = session === 'afternoon' ? res.data.pmTimeIn! : res.data.timeIn!;
      setActiveSession({ id: res.data.id, timeIn, isAfternoon: isPM });
      fetchLogs();
    } catch (err: any) {
      console.error('Time in failed:', err?.response?.data?.error ?? err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTimeOut = async () => {
    if (!activeSession) return;
    if (!task.trim()) {
      toast.warning('Please enter a task description before logging out.');
      return;
    }
    setActionLoading(true);
    try {
      await axios.post('/api/logbook/time-out', {
        id: activeSession.id,
        task,
        session: activeSession.isAfternoon ? 'afternoon' : 'morning',
      });
      setActiveSession(null);
      setTask('');
      fetchLogs();
      toast.success('Time out recorded successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to record time out';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));

      const res = await axios.get(`/api/logbook/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'logbook.xlsx');
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Excel exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export Excel');
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrintPDF = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));

      const res = await axios.get(`/api/logbook/export-pdf?${params.toString()}`, { responseType: 'text' });
      const htmlContent = res.data;

      if (!htmlContent || htmlContent.trim() === '') {
        toast.error('No data to print');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        toast.success('Click Print button or press Ctrl+P to print');
      };

    } catch (err) {
      console.error('Print PDF failed:', err);
      toast.error('Failed to print PDF');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));

      const res = await axios.get(`/api/logbook/export-pdf?${params.toString()}`, { responseType: 'text' });
      const htmlContent = res.data;

      console.log('PDF HTML content length:', htmlContent?.length);
      console.log('PDF HTML content preview:', htmlContent?.substring(0, 500));

      if (!htmlContent || htmlContent.trim() === '') {
        toast.error('No data to download');
        return;
      }

      // Open in new window for printing/saving
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to download PDF');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then trigger print/save dialog
      setTimeout(() => {
        printWindow.print();
        toast.success('PDF ready! Use Save As to save as PDF.');
      }, 500);

      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Download PDF failed:', err);
      toast.error('Failed to download PDF');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportConfirm = () => {
    if (exportType === 'excel') {
      handleExportExcel();
    } else if (exportAction === 'print') {
      handlePrintPDF();
    } else {
      handleDownloadPDF();
    }
    setExportModalOpen(false);
  };

  const openExportModal = (type: 'excel' | 'pdf') => {
    setExportType(type);
    if (type === 'excel') {
      // For Excel, show modal for date range selection
      setExportAction('download');
    }
    setExportModalOpen(true);
  };

  // Edit/Delete handlers
  const openEditModal = (log: LogEntry) => {
    setEditingLog(log);
    setEditForm({
      date: log.date,
      timeIn: toLocalDateTimeString(log.timeIn),
      timeOut: toLocalDateTimeString(log.timeOut),
      task: log.task || '',
      pmTimeIn: toLocalDateTimeString(log.pmTimeIn),
      pmTimeOut: toLocalDateTimeString(log.pmTimeOut),
      pmTask: log.pmTask || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingLog) return;
    setActionLoading(true);
    try {
      await axios.patch(`/api/logbook/${editingLog.id}`, {
        date: editForm.date,
        timeIn: editForm.timeIn || null,
        timeOut: editForm.timeOut || null,
        task: editForm.task || null,
        pmTimeIn: editForm.pmTimeIn || null,
        pmTimeOut: editForm.pmTimeOut || null,
        pmTask: editForm.pmTask || null,
      });
      toast.success('Record updated successfully!');
      setEditModalOpen(false);
      fetchLogs();
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update record');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingLog) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/api/logbook/${editingLog.id}`);
      toast.success('Record deleted successfully!');
      setEditModalOpen(false);
      fetchLogs();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete record');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const canStartAfternoon = (log: LogEntry) =>
    log.timeIn && log.timeOut && !log.pmTimeIn;

  const canStartAfternoonOnly = (log: LogEntry) =>
    !log.timeIn && !log.timeOut && !log.pmTimeIn;

  const todayStr = new Date().toLocaleString('en-CA', { timeZone: PH_TIMEZONE });
  const todayDate = todayStr.split('T')[0];
  const todayLog = logs.find((l) => l.date === todayDate);

  // Get dates that have logs for calendar indicators
  const datesWithLogs = logs
    .filter(log => log.timeIn || log.pmTimeIn)
    .map(log => new Date(log.date));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* ── LEFT PANEL ── */}
      <div className="lg:w-80 space-y-4 shrink-0">

        {/* Session clock card */}
        <Card className="bg-zinc-900/80 border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Session Control
            </span>
          </div>

          {/* Clock indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              'relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500',
              activeSession
                ? !activeSession.isAfternoon
                  ? 'bg-amber-500/20 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'bg-indigo-500/20 border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                : 'bg-zinc-800/50 border-2 border-zinc-700'
            )}>
              {actionLoading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
              ) : activeSession ? (
                <>
                  {!activeSession.isAfternoon
                    ? <Sun className="h-8 w-8 text-amber-500" />
                    : <Sunset className="h-8 w-8 text-indigo-400" />
                  }
                  <span className="text-[9px] font-mono text-zinc-400 uppercase mt-1">
                    {!activeSession.isAfternoon ? 'Morning' : 'Afternoon'}
                  </span>
                </>
              ) : (
                <Play className="h-10 w-10 text-zinc-400 ml-1" />
              )}
            </div>

            <div className="text-center">
              <p className={cn(
                'text-sm font-bold tracking-wide',
                activeSession
                  ? !activeSession.isAfternoon ? 'text-amber-500' : 'text-indigo-400'
                  : 'text-zinc-400'
              )}>
                {activeSession
                  ? `${!activeSession.isAfternoon ? 'MORNING' : 'AFTERNOON'} ACTIVE`
                  : 'NOT LOGGED IN'}
              </p>
              {activeSession && (
                <p className="text-xs font-mono text-zinc-500 mt-1">
                  {fmtDuration(activeSession.timeIn, null, currentTime)}
                </p>
              )}
            </div>

            {/* Buttons */}
            {activeSession ? (
              <Button
                id="btn-time-out"
                onClick={handleTimeOut}
                disabled={actionLoading}
                className="w-full h-11 font-medium tracking-wide bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Square className="h-4 w-4 mr-2" />
                TIME OUT
              </Button>
            ) : (
              <Button
                id="btn-time-in"
                onClick={handleTimeIn}
                disabled={actionLoading}
                className="w-full h-11 font-medium tracking-wide bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                TIME IN
              </Button>
            )}
          </div>
        </Card>

        {/* Task input – visible only during active session */}
        {activeSession && (
          <Card className="bg-zinc-900/80 border-zinc-800 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {activeSession.isAfternoon ? 'Afternoon' : 'Morning'} Task
              </span>
            </div>
            <Textarea
              id="task-input"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. BSRS MONITORING (HSK 2B, BPP, FBS 2B, CVG 2B)"
              className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500/20 min-h-[80px] resize-none text-sm"
            />
            <p className="text-[10px] text-zinc-600 font-mono">
              Will be saved when you Time Out
            </p>
          </Card>
        )}

        {/* Export */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center w-full h-11 px-4 font-medium tracking-wide bg-zinc-900/80 border border-zinc-800 text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-orange-500 transition-all disabled:opacity-50 disabled:pointer-events-none">
            <Download className="h-4 w-4 mr-2" />
            {exportLoading ? 'Exporting…' : 'Export'}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-zinc-900 border-zinc-800">
            <DropdownMenuItem
              onClick={() => openExportModal('excel')}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-orange-500 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openExportModal('pdf')}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-orange-500 cursor-pointer"
            >
              <FileTextIcon className="h-4 w-4 mr-2" />
              PDF (HTML)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── RIGHT PANEL – Log list ── */}
      <Card className="flex-1 bg-zinc-900/80 border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Log Book
            </span>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-500">
            {logs.length} entries
          </Badge>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <div className="animate-spin rounded-full h-8 w-8 border border-zinc-700 border-t-orange-500 mb-3" />
              <span className="text-xs tracking-wider">Loading…</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
              <CalendarDays className="h-12 w-12 mb-3 opacity-30" />
              <span className="text-sm">No log entries yet</span>
              <span className="text-xs text-zinc-600 mt-1">Time in to start tracking</span>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {logs.map((log, index) => {
                const isExpanded = expandedLog === log.id;
                const isActive = log.status === 'active';

                return (
                  <div
                    key={log.id}
                    className={cn(
                      'group relative border rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-orange-950/20 border-orange-500/30'
                        : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header row */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <div>
                          <span className="text-sm font-bold text-zinc-200 font-mono">
                            {log.date}
                          </span>
                          <span className="ml-2 text-xs text-orange-500/70 font-mono">
                            {getDayLabel(log.date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {log.totalHours && (
                          <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                            {log.totalHours}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {log.timeIn && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                              AM
                            </span>
                          )}
                          {log.pmTimeIn && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              PM
                            </span>
                          )}
                        </div>
                        <Badge className={cn(
                          'text-[10px] px-2 py-0.5 font-medium',
                          isActive
                            ? 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                            : 'bg-zinc-700/50 text-zinc-400 border-zinc-600'
                        )}>
                          {isActive ? 'ACTIVE' : 'DONE'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {isExpanded
                            ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
                            : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                          }
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(log); }}
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail – mirrors the Excel layout */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        <Separator className="bg-zinc-800" />

                        {/* MORNING block */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sun className="h-3 w-3 text-amber-500" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">
                              Morning
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-zinc-900/60 rounded p-2">
                              <span className="text-zinc-500 block text-[9px] uppercase mb-1">Time In</span>
                              <span className="font-mono text-zinc-200">{fmtTime(log.timeIn)}</span>
                            </div>
                            <div className="bg-zinc-900/60 rounded p-2">
                              <span className="text-zinc-500 block text-[9px] uppercase mb-1">Time Out</span>
                              <span className="font-mono text-zinc-200">{fmtTime(log.timeOut)}</span>
                            </div>
                            <div className="bg-zinc-900/60 rounded p-2">
                              <span className="text-zinc-500 block text-[9px] uppercase mb-1">Duration</span>
                              <span className="font-mono text-zinc-200">
                                {log.timeIn && log.timeOut
                                  ? fmtDuration(log.timeIn, log.timeOut, currentTime)
                                  : isActive && activeSession?.isAfternoon === false
                                    ? fmtDuration(log.timeIn, null, currentTime)
                                    : '—'}
                              </span>
                            </div>
                          </div>
                          {log.task && (
                            <p className="mt-2 text-xs text-zinc-300 bg-zinc-900/60 rounded p-2 leading-relaxed">
                              {log.task}
                            </p>
                          )}
                        </div>

                        {/* AFTERNOON block */}
                        {(log.pmTimeIn || canStartAfternoon(log)) && (
                          <>
                            <Separator className="bg-zinc-800" />
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Sunset className="h-3 w-3 text-indigo-400" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
                                  Afternoon
                                </span>
                              </div>
                              {log.pmTimeIn ? (
                                <>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-zinc-900/60 rounded p-2">
                                      <span className="text-zinc-500 block text-[9px] uppercase mb-1">Time In</span>
                                      <span className="font-mono text-zinc-200">{fmtTime(log.pmTimeIn)}</span>
                                    </div>
                                    <div className="bg-zinc-900/60 rounded p-2">
                                      <span className="text-zinc-500 block text-[9px] uppercase mb-1">Time Out</span>
                                      <span className="font-mono text-zinc-200">{fmtTime(log.pmTimeOut)}</span>
                                    </div>
                                    <div className="bg-zinc-900/60 rounded p-2">
                                      <span className="text-zinc-500 block text-[9px] uppercase mb-1">Duration</span>
                                      <span className="font-mono text-zinc-200">
                                        {log.pmTimeIn && log.pmTimeOut
                                          ? fmtDuration(log.pmTimeIn, log.pmTimeOut, currentTime)
                                          : isActive && activeSession?.isAfternoon === true
                                            ? fmtDuration(log.pmTimeIn, null, currentTime)
                                            : '—'}
                                      </span>
                                    </div>
                                  </div>
                                  {log.pmTask && (
                                    <p className="mt-2 text-xs text-zinc-300 bg-zinc-900/60 rounded p-2 leading-relaxed">
                                      {log.pmTask}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-[11px] text-zinc-600 italic">
                                  Afternoon session not started
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Grand total */}
              <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                {(() => {
                  let ms = 0;
                  logs.forEach((log) => {
                    if (log.timeIn && log.timeOut) {
                      ms += new Date(log.timeOut).getTime() - new Date(log.timeIn).getTime();
                    }
                    if (log.pmTimeIn && log.pmTimeOut) {
                      ms += new Date(log.pmTimeOut).getTime() - new Date(log.pmTimeIn).getTime();
                    }
                  });
                  const h = Math.floor(ms / (1000 * 60 * 60));
                  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                  return (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2 flex items-center gap-3">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-xs font-medium text-zinc-400">Total Hours:</span>
                      <span className="text-sm font-bold text-orange-500">{h}h {m}m</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {exportType === 'excel' ? 'Export Excel' : 'Export PDF'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Select date range to export
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 uppercase tracking-wider">Start Date</label>
                <Input
                  type="date"
                  value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 uppercase tracking-wider">End Date</label>
                <Input
                  type="date"
                  value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-200"
                />
              </div>
            </div>

            {/* Action Options */}
            {exportType === 'pdf' && (
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 uppercase tracking-wider">Action</label>
                <div className="flex gap-2">
                  <Button
                    variant={exportAction === 'download' ? 'default' : 'outline'}
                    onClick={() => setExportAction('download')}
                    className={cn(
                      "flex-1",
                      exportAction === 'download'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
                    )}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant={exportAction === 'print' ? 'default' : 'outline'}
                    onClick={() => setExportAction('print')}
                    className={cn(
                      "flex-1",
                      exportAction === 'print'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
                    )}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportConfirm}
              disabled={exportLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {exportLoading ? 'Processing...' : exportType === 'excel' ? 'Download Excel' : exportAction === 'print' ? 'Print PDF' : 'Download PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Delete Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit Record</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Edit or delete attendance record for {editingLog?.date}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 uppercase tracking-wider">Date</label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-200"
              />
            </div>

            {/* Morning Session */}
            <div className="space-y-2 border border-zinc-700 rounded p-3">
              <div className="flex items-center gap-1.5">
                <Sun className="h-3 w-3 text-amber-500" />
                <span className="text-xs font-mono uppercase tracking-widest text-amber-500">Morning</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Time In</label>
                  <Input
                    type="datetime-local"
                    value={editForm.timeIn}
                    onChange={(e) => setEditForm({ ...editForm, timeIn: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Time Out</label>
                  <Input
                    type="datetime-local"
                    value={editForm.timeOut}
                    onChange={(e) => setEditForm({ ...editForm, timeOut: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Task</label>
                <Textarea
                  value={editForm.task}
                  onChange={(e) => setEditForm({ ...editForm, task: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-200"
                  rows={2}
                />
              </div>
            </div>

            {/* Afternoon Session */}
            <div className="space-y-2 border border-zinc-700 rounded p-3">
              <div className="flex items-center gap-1.5">
                <Sunset className="h-3 w-3 text-indigo-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Afternoon</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Time In</label>
                  <Input
                    type="datetime-local"
                    value={editForm.pmTimeIn}
                    onChange={(e) => setEditForm({ ...editForm, pmTimeIn: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Time Out</label>
                  <Input
                    type="datetime-local"
                    value={editForm.pmTimeOut}
                    onChange={(e) => setEditForm({ ...editForm, pmTimeOut: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Task</label>
                <Textarea
                  value={editForm.pmTask}
                  onChange={(e) => setEditForm({ ...editForm, pmTask: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-200"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={actionLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
