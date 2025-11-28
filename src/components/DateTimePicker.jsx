import React from 'react';
import { CalendarRange, Clock3 } from 'lucide-react';
import { toDateTimeLocalValue } from '../utils/dateTime';

const DateTimePicker = ({ label = 'Date & Time', value, onChange, required }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-muted)]">
      <label>{label}</label>
      <span className="uppercase tracking-[0.2em] text-[10px]">Local time</span>
    </div>
    <div className="relative group">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[var(--color-muted)] text-xs">
        <CalendarRange size={14} />
        <Clock3 size={14} />
      </span>
      <input
        type="datetime-local"
        value={toDateTimeLocalValue(value) || value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="admin-input pl-11"
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-[var(--color-primary)]/30 opacity-0 group-focus-within:opacity-100 transition" />
    </div>
  </div>
);

export default DateTimePicker;
