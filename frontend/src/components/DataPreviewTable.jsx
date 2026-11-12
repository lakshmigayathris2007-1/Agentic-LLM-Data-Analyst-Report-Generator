import React, { useState } from 'react';
import { Search, Table as TableIcon } from 'lucide-react';

export default function DataPreviewTable({ columns = [], rows = [], isCleaned = false, theme }) {
  const isLight = theme === 'light';
  const [searchTerm, setSearchTerm] = useState('');

  if (!rows || rows.length === 0) {
    return (
      <div className={`p-8 text-center rounded-2xl border ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/40 border-slate-800 text-slate-400'
      }`}>
        <TableIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No preview rows available.</p>
      </div>
    );
  }

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className={`rounded-3xl border overflow-hidden transition-colors ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'glass-panel border-slate-800 text-white'
    }`}>
      <div className={`p-4 border-b flex items-center justify-between flex-wrap gap-3 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-blue-500" />
          <h4 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Dataset Preview Grid
          </h4>
          {isCleaned && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Cleaned Data Active
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search grid..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[380px]">
        <table className="w-full text-left text-xs">
          <thead className={`uppercase text-[10px] sticky top-0 backdrop-blur font-extrabold ${
            isLight ? 'bg-slate-100/90 text-slate-700' : 'bg-slate-900/90 text-slate-200'
          }`}>
            <tr>
              <th className="py-2.5 px-4 border-b border-slate-200 dark:border-slate-800">#</th>
              {columns.map((col) => (
                <th key={col} className="py-2.5 px-4 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
            {filteredRows.slice(0, 25).map((row, idx) => (
              <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col} className={`py-2.5 px-4 whitespace-nowrap font-mono text-[11px] max-w-xs truncate ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-400 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`p-3 border-t text-xs flex items-center justify-between font-mono ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/90 border-slate-800 text-slate-400'
      }`}>
        <span>Showing top {Math.min(25, filteredRows.length)} of {rows.length} preview records</span>
        <span>{columns.length} Total Attribute Columns</span>
      </div>
    </div>
  );
}
