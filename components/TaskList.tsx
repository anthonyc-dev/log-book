'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle2, CircleDashed, FileText } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    createdAt: string;
}

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/tasks');
                setTasks(response.data || []);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground animate-pulse">
                <CircleDashed className="h-8 w-8 animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-widest">Hydrating Registry...</span>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-4">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30 border-2 border-dashed border-white/5 rounded-lg">
                        <FileText className="h-12 w-12 mb-4" />
                        <span className="font-mono text-sm uppercase">Empty Registry</span>
                    </div>
                ) : (
                    tasks.map((t: Task, index: number) => (
                        <div
                            key={t.id}
                            className="relative animate-in fade-in slide-in-from-left-4 duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <Card className="glass-hover border-white/5 bg-white/2 p-4 group transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <CheckCircle2 className="h-4 w-4 text-cyan group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-medium leading-none tracking-tight text-foreground/90 group-hover:text-foreground">
                                                {t.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </div>
                                                <Separator orientation="vertical" className="h-2 bg-white/10" />
                                                <span className="text-[10px] font-mono text-primary/50 uppercase">ID_{t.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-cyan/20 text-[9px] font-mono text-cyan bg-cyan/5 tracking-wider">
                                        COMMITTED
                                    </Badge>
                                </div>
                            </Card>
                        </div>
                    ))
                )}

                {/* End of log indicator */}
                <div className="py-8 flex flex-col items-center justify-center opacity-20">
                    <Separator className="w-24 bg-white/10 mb-4" />
                    <span className="font-mono text-[8px] uppercase tracking-[0.5em]">--- End of Log ---</span>
                </div>
            </div>
        </ScrollArea>
    );
}