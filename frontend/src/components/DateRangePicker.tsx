interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.9)] mb-6">
      <div>
        <label htmlFor="dateFrom" className="block text-sm font-semibold text-slate-300 mb-2">
          From
        </label>
        <input
          id="dateFrom"
          type="date"
          value={from}
          onChange={(event) => onChange({ from: event.target.value, to })}
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <div>
        <label htmlFor="dateTo" className="block text-sm font-semibold text-slate-300 mb-2">
          To
        </label>
        <input
          id="dateTo"
          type="date"
          value={to}
          onChange={(event) => onChange({ from, to: event.target.value })}
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
    </div>
  );
}
