'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Power, Timer } from 'lucide-react';

export default function TimeTracker() {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await axios.get('/api/attendance/today');
                if (response.data && response.data.status === 'active') {
                    setActive(true);
                }
            } catch (error) {
                console.error('Failed to sync status:', error);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handleTimeIn = async () => {
        setLoading(true);
        try {
            await axios.post('/api/attendance/time-in');
            setActive(true);
            // Refresh page to sync everything
            window.location.reload();
        } finally {
            setLoading(false);
        }
    };

    const handleTimeOut = async () => {
        setLoading(true);
        try {
            await axios.post('/api/attendance/time-out');
            setActive(false);
            // Refresh page to sync everything
            window.location.reload();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
                <div className={cn(
                    "absolute -inset-0.5 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000",
                    active ? "bg-amber-400 group-hover:duration-200" : "bg-cyan-400"
                )} />
                
                <Button 
                    disabled={loading}
                    onClick={active ? handleTimeOut : handleTimeIn}
                    className={cn(
                        "relative h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500",
                        active 
                            ? "bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(255,176,0,0.3)] hover:shadow-[0_0_25px_rgba(255,176,0,0.5)]" 
                            : "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]"
                    )}
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                    ) : (
                        <Power className={cn("h-10 w-10", active ? "text-amber-500" : "text-cyan-500")} />
                    )}
                </Button>
            </div>
            
            <div className="text-center">
                <p className={cn(
                    "font-mono text-sm uppercase tracking-widest",
                    active ? "text-amber-500 font-bold" : "text-muted-foreground"
                )}>
                    {active ? "TRANSMITTING..." : "STANDBY"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <Timer className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {active ? "Active Session" : "Ready to Log"}
                    </span>
                </div>
            </div>
        </div>
    );
}