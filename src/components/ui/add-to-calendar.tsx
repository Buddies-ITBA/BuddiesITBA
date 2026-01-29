'use client';

import { Calendar, CalendarPlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/lib/cms/types';
import { generateGoogleCalendarUrl, downloadIcs } from '@/lib/calendar';

interface Props {
    event: Event;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export function AddToCalendar({ event, variant = 'outline', size = 'default', className }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Add to Calendar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a
                        href={generateGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Google Calendar
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadIcs(event)} className="cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    Download .ics
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AddToCalendarIcon({ event, className }: { event: Event, className?: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={className}
                    title="Add to Calendar"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CalendarPlus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a
                        href={generateGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Google Calendar
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadIcs(event)} className="cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    Download .ics
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
