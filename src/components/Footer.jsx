import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

export default function Footer({ onOpenAdmin, adminUser, onReplayIntro }) {
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy'

  return (
    <>
      <footer className="w-full mt-16 sm:mt-24 border-t border-white/[0.06] bg-[#070708] text-[#71717A] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 pb-32 md:pb-12 space-y-8">
          {/* Header discreto de información secundaria */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-white/[0.05] text-[11px] font-mono text-[#52525B]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="tracking-wider uppercase">
                Información general &amp; contacto • Sillón de David
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#52525B]">
              <MapPin className="w-3 h-3 text-[#52525B]" />
              <span>Atención en V.I.P Barberías • Eva Perón 52, Capitán Bermúdez</span>
            </div>
          </div>

          {/* Columnas simples y discretas (información de referencia sin competir con los procesos) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 text-xs text-[#71717A]">
            {/* Columna 1: Identidad & Redes */}
            <div className="space-y-2.5 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#71717A]">
                  <Scissors className="w-3.5 h-3.5 -rotate-45" />
                </div>
                <span className="font-display font-semibold text-sm tracking-tight text-[#A1A1AA]">
                  David Barber
                </span>
                <span className="text-[10px] font-mono text-[#52525B]">
                  • Sillón en V.I.P Barberías
                </span>
              </div>

              <p className="text-[11px] leading-relaxed text-[#71717A] max-w-md">
                Espacio de atención personalizada para clientes de David. Turnos digitales y programa de fidelización por visitas.
              </p>

              <p className="text-[10px] font-mono text-[#52525B]">
                Capitán Bermúdez, Santa Fe • Atención exclusivamente con turno previo
              </p>

              <div className="pt-1">
                <a
                  href="https://www.instagram.com/barber_f4de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] font-mono text-[#8A898E] hover:text-[#EDEDED] transition-colors"
                >
                  <InstagramIcon className="w-3 h-3 text-[#71717A]" />
                  <span>@barber_f4de</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#52525B]" />
                </a>
              </div>
            </div>

            {/* Columna 2: Marco Legal & Políticas */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#A1A1AA] font-mono text-[11px] tracking-wider uppercase font-semibold">
                <Shield className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Marco Legal</span>
              </div>

              <ul className="space-y-2 pt-1 text-[11px]">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="text-[#71717A] hover:text-[#EDEDED] transition-colors flex items-center gap-1.5 text-left group"
                  >
                    <FileText className="w-3 h-3 text-[#52525B] shrink-0" />
                    <span className="group-hover:underline">Términos y Cancelación</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="text-[#71717A] hover:text-[#EDEDED] transition-colors flex items-center gap-1.5 text-left group"
                  >
                    <Lock className="w-3 h-3 text-[#52525B] shrink-0" />
                    <span className="group-hover:underline">Privacidad (Ley 25.326)</span>
                  </button>
                </li>
              </ul>

              <p className="text-[10px] text-[#52525B] pt-1 leading-relaxed">
                Protección de datos y turnos registrados.
              </p>
            </div>

            {/* Columna 3: Horarios & Atención */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#A1A1AA] font-mono text-[11px] tracking-wider uppercase font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Horarios</span>
              </div>

              <div className="space-y-0.5 text-[11px] text-[#71717A] leading-relaxed pt-1">
                <p className="text-[#8A898E]">Lunes a Sábados</p>
                <p className="font-mono text-[#A1A1AA]">09:00 a 20:00 hs</p>
                <p className="text-[10px] text-[#52525B] pt-1">
                  Domingos cerrado • Tolerancia: 10 min
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Versión */}
          <div className="pt-5 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#52525B]">
            <p>
              &copy; {new Date().getFullYear()} David Barber • Turnos &amp; Fidelización en V.I.P Barberías.
            </p>

            <div className="flex items-center gap-3">
              {onReplayIntro && (
                <button
                  type="button"
                  onClick={onReplayIntro}
                  className="hover:text-[#E5C378] transition-colors underline decoration-dotted"
                  title="Reproducir animación de ingreso"
                >
                  Ver intro
                </button>
              )}
              <span>v2.5</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal: Términos del Servicio y Política de Turnos */}
      {activeModal === 'terms' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
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
        </div>,
        document.body
      )}

      {/* Modal: Privacidad y Protección de Datos Personales */}
      {activeModal === 'privacy' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
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
        </div>,
        document.body
      )}
    </>
  );
}
