interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow mb-6">
      <div>
        <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
          From
        </label>
        <input
          id="dateFrom"
          type="date"
          value={from}
          onChange={(event) => onChange({ from: event.target.value, to })}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
          To
        </label>
        <input
          id="dateTo"
          type="date"
          value={to}
          onChange={(event) => onChange({ from, to: event.target.value })}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  );
}
