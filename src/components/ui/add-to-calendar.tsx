'use client';

import { Calendar, CalendarPlus, Download } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/lib/cms/types';
import { generateGoogleCalendarUrl, downloadIcs } from '@/lib/calendar';

export type AddToCalendarLabels = { add: string; google: string; ics: string };

type Props = {
  event: Event;
  labels: AddToCalendarLabels;
  /** Icon-only trigger (label is still announced to screen readers). */
  iconOnly?: boolean;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
};

export function AddToCalendar({ event, labels, iconOnly, variant = 'outline', size, className }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size ?? (iconOnly ? 'icon' : 'default')}
          className={className}
          aria-label={iconOnly ? labels.add : undefined}
          title={iconOnly ? labels.add : undefined}
        >
          <CalendarPlus />
          {!iconOnly && labels.add}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={generateGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            <Calendar className="mr-2 size-4" />
            {labels.google}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadIcs(event)} className="cursor-pointer">
          <Download className="mr-2 size-4" />
          {labels.ics}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
