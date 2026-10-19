import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Lock,
  Scissors,
  CheckCircle2,
  X,
  Scale,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function Footer({ onOpenAdmin, adminUser }) {
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy'

  return (
    <>
      <footer className="w-full mt-20 sm:mt-28 rounded-t-3xl sm:rounded-t-[2.5rem] border-t-2 border-[#D4AF37]/35 bg-gradient-to-b from-[#18181D] via-[#141417] to-[#0D0D10] text-[#8A898E] shadow-[0_-20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden transition-colors">
        {/* Línea sutil de resplandor dorado superior */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 pb-32 md:pb-12 space-y-8">
          {/* Header de demarcación visual clara (Inconfundible como Footer en móvil) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/[0.1]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
                INFORMACIÓN &amp; CONTACTO • SILLÓN DE DAVID
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#8A898E]">
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#EDEDED] flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                <span>En V.I.P Barberías • Eva Perón 52</span>
              </span>
            </div>
          </div>

          {/* Grid de Secciones estructuradas en tarjetas cápsula de alto contraste */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 sm:gap-6">
            {/* Columna 1: Identidad & Redes */}
            <div className="p-5 rounded-2xl bg-[#0D0D0F]/85 border border-white/[0.08] space-y-3.5 md:col-span-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#18181D] border border-white/[0.1] flex items-center justify-center text-[#D4AF37]">
                  <Scissors className="w-4 h-4 -rotate-45" />
                </div>
                <div>
                  <span className="font-display font-bold text-base tracking-tight text-[#EDEDED] block leading-none">
                    DAVID BARBER
                  </span>
                  <span className="text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase">
                    SILLÓN PRIVADO EN V.I.P BARBERÍAS
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[#8A898E]">
                Espacio exclusivo para clientes de David. Agenda digital personalizada y programa de beneficios por visita en el sillón de V.I.P Barberías.
              </p>

              <p className="text-[11px] font-mono text-[#EDEDED]/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Capitán Bermúdez, Santa Fe • Atención exclusivamente con turno previo</span>
              </p>

              <div className="pt-1">
                <a
                  href="https://www.instagram.com/barber_f4de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181D] border border-white/[0.1] hover:border-[#D4AF37]/60 text-xs font-mono text-[#EDEDED] transition-all shadow-sm group"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Instagram: @barber_f4de</span>
                  <ExternalLink className="w-3 h-3 text-[#8A898E] group-hover:text-[#EDEDED] transition-colors" />
                </a>
              </div>
            </div>

            {/* Columna 2: Marco Legal & Políticas */}
            <div className="p-5 rounded-2xl bg-[#0D0D0F]/85 border border-white/[0.08] space-y-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="micro-technical text-[#EDEDED] block">
                  MARCO LEGAL &amp; TÉRMINOS
                </h4>
              </div>

              <ul className="space-y-2.5 pt-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-[#EDEDED] transition-colors flex items-center gap-2 text-left text-[#8A898E] group w-full"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="group-hover:underline">Términos de Turnos y Cancelación</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-[#EDEDED] transition-colors flex items-center gap-2 text-left text-[#8A898E] group w-full"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="group-hover:underline">Privacidad (Ley 25.326)</span>
                  </button>
                </li>
              </ul>

              <p className="text-[10px] text-[#8A898E]/70 pt-2 border-t border-white/[0.06] leading-relaxed">
                Datos protegidos y turnos respaldados digitalmente.
              </p>
            </div>

            {/* Columna 3: Horarios & Atención */}
            <div className="p-5 rounded-2xl bg-[#0D0D0F]/85 border border-white/[0.08] space-y-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="micro-technical text-[#EDEDED] block">
                  HORARIO DE ATENCIÓN
                </h4>
              </div>

              <div className="space-y-1 text-[11px] text-[#8A898E] leading-relaxed pt-1">
                <p className="text-[#EDEDED] font-semibold">
                  Lunes a Sábados:
                </p>
                <p className="font-mono text-[#D4AF37]">
                  09:00 a 20:00 hs
                </p>
                <p className="text-[#8A898E] pt-1">
                  Domingos: Cerrado
                </p>
              </div>

              <p className="text-[10px] text-[#8A898E]/70 pt-2 border-t border-white/[0.06] leading-relaxed">
                Tolerancia de espera: 10 min por turno para asegurar la máxima puntualidad.
              </p>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Versión */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p className="text-center sm:text-left text-[#8A898E]">
              &copy; {new Date().getFullYear()} David Barber • Turnos &amp; Fidelización en V.I.P Barberías.
            </p>

            <span className="text-[10px] opacity-50 font-mono text-[#8A898E] bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]">
              v2.5
            </span>
          </div>
        </div>
      </footer>

      {/* Modal: Términos del Servicio y Política de Turnos */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/[0.12] p-6 sm:p-7 text-[#EDEDED] space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-display font-bold">
                  Términos del Servicio y Política de Turnos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#8A898E] hover:text-[#EDEDED] hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-[#8A898E]">
              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  1. Reserva y Confirmación
                </strong>
                <p>
                  Toda solicitud de turno genera un código de reserva temporal con un bloqueo de 15 minutos en agenda. La reserva queda en firme una vez verificado el contacto y confirmada por David vía WhatsApp.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  2. Puntualidad y Tolerancia
                </strong>
                <p>
                  Para garantizar la excelencia y el tiempo dedicado a cada sesión de corte o barba, se contempla una tolerancia máxima de 10 minutos. Pasado ese tiempo, el turno podrá ser reprogramado o cancelado para no perjudicar a los clientes siguientes.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  3. Cancelaciones y Reprogramaciones
                </strong>
                <p>
                  Si no podés asistir a tu turno, solicitamos cancelarlo o avisar por WhatsApp con al menos 2 horas de antelación para permitir que otro socio pueda ocupar el horario en el sillón.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  4. Club de Socios y Puntos
                </strong>
                <p>
                  Los puntos acumulados por cada corte completado son personales e intransferibles, asociados al número de DNI y protegidos mediante PIN de 4 dígitos. Los puntos canjeados no tienen valor monetario reembolsable y aplican a los beneficios vigentes del estudio.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-xl bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-md active:scale-[0.98]"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Privacidad y Protección de Datos Personales */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/[0.12] p-6 sm:p-7 text-[#EDEDED] space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-display font-bold">
                  Política de Privacidad y Protección de Datos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#8A898E] hover:text-[#EDEDED] hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-[#8A898E]">
              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  Marco Legal (Ley N° 25.326 de la República Argentina)
                </strong>
                <p>
                  David Barber cumple con los principios de licitud, confidencialidad y seguridad consagrados en la Ley de Protección de Datos Personales N° 25.326.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  Finalidad del Tratamiento de Datos
                </strong>
                <p>
                  Los datos solicitados (DNI, Nombre, Apellido, Celular/WhatsApp y Fecha de Nacimiento) son recopilados exclusivamente para la gestión de turnos, envío de recordatorios directos y acreditación de beneficios y promociones de cumpleaños del club.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  Seguridad y Confidencialidad
                </strong>
                <p>
                  Las contraseñas y códigos PIN de acceso son almacenados con algoritmos de hashing criptográfico unidireccional. No se comercializan, ceden ni transfieren datos personales a terceras partes.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  Derechos de Acceso, Rectificación y Supresión
                </strong>
                <p>
                  Cualquier cliente titular de los datos puede solicitar la rectificación, actualización o baja total de su registro en nuestra base de datos contactándose de manera directa por WhatsApp.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-xl bg-[#EDEDED] hover:bg-white text-[#0B0B0C] font-display font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-md active:scale-[0.98]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
