'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Terminal, Plus } from 'lucide-react';

export default function TaskForm() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [attendanceId, setAttendanceId] = useState<number | null>(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.get('/api/attendance/today');
                if (response.data && response.data.status === 'active') {
                    setAttendanceId(response.data.id);
                }
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
            }
        };
        fetchAttendance();
    }, []);

    const submit = async () => {
        if (!title.trim() || !attendanceId) return;
        setLoading(true);
        try {
            await axios.post('/api/tasks', {
                attendanceId: attendanceId,
                title,
            });
            setTitle('');
            // Trigger a refresh or local state update
            window.location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Input Command</span>
            </div>
            
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={attendanceId ? "AUTHENTICATING LOG ENTRY..." : "SYSTEM OFFLINE: TIME IN REQUIRED"}
                        disabled={!attendanceId}
                        className="bg-background/20 border-white/10 font-mono text-sm uppercase focus-visible:ring-primary/50 placeholder:text-muted-foreground/30 h-10"
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                    />
                </div>
                <Button 
                    onClick={submit} 
                    disabled={loading || !title.trim() || !attendanceId}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 h-10 transition-all duration-300 active:scale-95"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                        <Plus className="h-5 w-5" />
                    )}
                </Button>
            </div>
            
            <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase px-1">
                <span>Buffer: <span className={title ? "text-primary" : "text-muted-foreground/30"}>{title.length}/256</span></span>
                <span>{attendanceId ? "System Ready" : "Terminal Locked"}</span>
            </div>
        </div>
    );
}