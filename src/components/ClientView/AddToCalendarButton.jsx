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
        className="px-3 py-2 rounded-md bg-[#0B0B0C] hover:bg-[#141416] text-[#EDEDED] card-hairline text-xs font-mono flex items-center gap-2 transition-all active:scale-95"
        title="Agendar turno en tu calendario"
      >
        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Calendario</span>
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
            className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-56 p-1.5 rounded-lg bg-[#141416] card-hairline text-[#EDEDED] shadow-2xl z-50 text-xs space-y-1 animate-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-3 py-1.5 micro-technical text-[#8A898E] border-b border-white/[0.08]">
              SINCRONIZAR
            </p>
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full px-3 py-2 rounded-md hover:bg-white/[0.05] flex items-center justify-between text-left transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#EDEDED]">Google Calendar</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleApple}
              className="w-full px-3 py-2 rounded-md hover:bg-white/[0.05] flex items-center justify-between text-left transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#EDEDED]">Apple / iCal / Outlook</span>
              </div>
              {downloaded ? (
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
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
