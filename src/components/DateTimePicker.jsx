import React from 'react';
import { Calendar } from 'lucide-react';
import { toDateTimeLocalValue } from '../utils/dateTime';

const DateTimePicker = ({ label = 'Date & Time', value, onChange, required }) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
      <Calendar size={14} className="opacity-70" />
      <label>{label}</label>
    </div>
    <input
      type="datetime-local"
      value={toDateTimeLocalValue(value) || value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      required={required}
      className="w-full rounded-xl px-4 py-3 text-sm bg-[color-mix(in_srgb,var(--color-card)88%,transparent)] dark:bg-[color-mix(in_srgb,var(--color-card)92%,transparent)] border border-[var(--color-text)]/10 text-[var(--color-text)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all placeholder:text-[var(--color-muted)]/70 appearance-none min-h-[46px]"
    />
  </div>
);

export default DateTimePicker;