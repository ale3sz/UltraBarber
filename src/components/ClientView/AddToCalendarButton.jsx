import React, { useState } from 'react';
import { Calendar, Check, ExternalLink, Download } from 'lucide-react';
import { openGoogleCalendar, downloadAppleIcs } from '../../utils/calendar';

export default function AddToCalendarButton({ appointment, studioConfig, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleGoogle = (e) => {
    e.stopPropagation();
    openGoogleCalendar(appointment, studioConfig);
    setIsOpen(false);
  };

  const handleApple = (e) => {
    e.stopPropagation();
    downloadAppleIcs(appointment, studioConfig);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-[#D4AF37]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
        title="Agendar turno en tu calendario"
      >
        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Agregar a mi calendario</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-56 p-2 rounded-2xl bg-neutral-900 border border-neutral-700 text-white shadow-2xl z-50 text-xs space-y-1 animate-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              Elegir calendario
            </p>
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-neutral-800 flex items-center justify-between text-left transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Google Calendar</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleApple}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-neutral-800 flex items-center justify-between text-left transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Apple / iCal / Outlook</span>
              </div>
              {downloaded ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
