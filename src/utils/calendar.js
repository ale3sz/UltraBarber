// Calendar integration utility for ULTRA BARBER Studio

export function createCalendarEventData(appointment, studioConfig = {}) {
  const service = appointment?.serviceName || 'Corte con David';
  const drink = appointment?.selectedDrink ? ` con ${appointment.selectedDrink}` : '';
  const title = `Turno: ${service}${drink} • David Barber`;
  const location = studioConfig?.barbershopName
    ? `${studioConfig.barbershopName} • ${studioConfig?.address || 'Eva Perón 52'}, ${studioConfig?.city || 'Capitán Bermúdez'}`
    : `${studioConfig?.address || 'Eva Perón 52'}, ${studioConfig?.city || 'Capitán Bermúdez'}`;
  
  const description = [
    `Turno #${appointment?.code || ''}`,
    `Servicio: ${service}${drink}`,
    `Cliente: ${appointment?.clientName || ''}`,
    `Lugar: ${location}`,
    '',
    'Recordatorio: Tolerancia de espera de 10 minutos.',
    'Para reprogramar o cancelar, comunicate por WhatsApp con David.'
  ].join('\n');

  const dateStr = appointment?.date; // YYYY-MM-DD
  const timeStr = appointment?.time; // HH:mm

  if (!dateStr || !timeStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const durationMin = appointment?.durationMinutes || 45;
  const endDate = new Date(startDate.getTime() + durationMin * 60000);

  return {
    title,
    location,
    description,
    startDate,
    endDate,
    dateStr,
    timeStr
  };
}

export function openGoogleCalendar(appointment, studioConfig) {
  const data = createCalendarEventData(appointment, studioConfig);
  if (!data) return;

  const formatISO = (d) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const datesParam = `${formatISO(data.startDate)}/${formatISO(data.endDate)}`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${datesParam}&details=${encodeURIComponent(data.description)}&location=${encodeURIComponent(data.location)}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadAppleIcs(appointment, studioConfig) {
  const data = createCalendarEventData(appointment, studioConfig);
  if (!data) return;

  const pad = (n) => String(n).padStart(2, '0');
  const formatIcs = (d) => {
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ULTRA BARBER Studio//Turnos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:turno-${appointment?.id || appointment?.code || Date.now()}@davidbarber`,
    `DTSTAMP:${formatIcs(new Date())}Z`,
    `DTSTART:${formatIcs(data.startDate)}`,
    `DTEND:${formatIcs(data.endDate)}`,
    `SUMMARY:${data.title}`,
    `DESCRIPTION:${data.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${data.location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de Turno en ULTRA BARBER Studio',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Turno-DavidBarber-${data.dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
