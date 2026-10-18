import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Lock,
  Scissors,
  CheckCircle2,
  X,
  Scale
} from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';

export default function Footer({ onOpenAdmin, adminUser }) {
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy'

  return (
    <>
      <footer className="w-full mt-20 border-t border-barber-lightBorder dark:border-barber-darkBorder bg-barber-lightSurface/50 dark:bg-barber-darkBg/50 text-barber-lightMuted dark:text-barber-darkMuted transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-10 pb-28 md:pb-10 space-y-8">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Studio Identity */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-barber-lightText dark:bg-barber-darkSurface border border-barber-chai/40 flex items-center justify-center text-barber-chai">
                  <Scissors className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-display font-bold text-base tracking-tight text-barber-lightText dark:text-barber-darkText">
                  ULTRA BARBER STUDIO
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm">
                Studio privado de autor especializado en cortes fade, perfilado de barba a navaja y diseño capilar de alta precisión. Club de socios con beneficios exclusivos por visita.
              </p>
              <p className="text-[11px] font-mono text-barber-chai">
                Rosario, Santa Fe • Atención exclusivamente con turno previo
              </p>

              <div className="pt-1">
                <a
                  href="https://www.instagram.com/barber_f4de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-[#D4AF37]/50 hover:border-[#D4AF37] text-xs font-mono text-neutral-300 hover:text-white transition-all shadow-sm"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Seguinos en Instagram: @barber_f4de</span>
                </a>
              </div>
            </div>

            {/* Column 2: Legal & Políticas */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-display font-bold text-barber-lightText dark:text-barber-darkText uppercase tracking-wider text-[11px]">
                Marco Legal &amp; Términos
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-barber-chai transition-colors flex items-center gap-1.5 text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-barber-chai shrink-0" />
                    <span>Términos del Servicio y Turnos</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-barber-chai transition-colors flex items-center gap-1.5 text-left"
                  >
                    <Shield className="w-3.5 h-3.5 text-barber-chai shrink-0" />
                    <span>Privacidad de Datos (Ley 25.326)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Horarios & Atención */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-display font-bold text-barber-lightText dark:text-barber-darkText uppercase tracking-wider text-[11px]">
                Horario de Atención
              </h4>
              <p className="leading-relaxed text-[11px]">
                Lunes a Sábados: 09:00 a 20:00 hs<br />
                Domingos: Cerrado
              </p>
              <p className="text-[10px] text-barber-lightMuted dark:text-barber-darkMuted pt-1">
                Tolerancia de espera: 10 minutos por turno para garantizar la puntualidad de cada cliente.
              </p>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Discreet Staff Access */}
          <div className="pt-6 border-t border-barber-lightBorder/60 dark:border-barber-darkBorder/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p className="text-center sm:text-left">
              &copy; {new Date().getFullYear()} ULTRA BARBER Studio. Todos los derechos reservados. Prohibida la reproducción total o parcial de contenidos, imágenes y logotipos sin autorización expresa.
            </p>

            {/* Discreet Staff Access Trigger */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] opacity-40 font-mono">v2.4</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="opacity-40 hover:opacity-100 text-barber-lightMuted dark:text-barber-darkMuted hover:text-barber-chai transition-opacity p-1 rounded flex items-center gap-1 text-[10px] font-mono"
                title="Acceso administrativo"
                aria-label="Acceso privado del salón"
              >
                <Lock className="w-3 h-3" />
                <span>{adminUser ? 'Panel David' : 'Staff'}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal: Términos del Servicio y Política de Turnos */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-lg rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 sm:p-7 text-barber-darkText space-y-4 club-shadow max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-barber-darkBorder">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-barber-chai" />
                <h3 className="text-lg font-display font-bold">
                  Términos del Servicio y Política de Turnos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl text-barber-pistache hover:text-barber-darkText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-barber-pistache">
              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
                  1. Reserva y Confirmación
                </strong>
                <p>
                  Toda solicitud de turno genera un código de reserva temporal con un bloqueo de 15 minutos en agenda. La reserva queda en firme una vez verificado el contacto y confirmada por David vía WhatsApp.
                </p>
              </div>

              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
                  2. Puntualidad y Tolerancia
                </strong>
                <p>
                  Para garantizar la excelencia y el tiempo dedicado a cada sesión de corte o barba, se contempla una tolerancia máxima de 10 minutos. Pasado ese tiempo, el turno podrá ser reprogramado o cancelado para no perjudicar a los clientes siguientes.
                </p>
              </div>

              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
                  3. Cancelaciones y Reprogramaciones
                </strong>
                <p>
                  Si no podés asistir a tu turno, solicitamos cancelarlo o avisar por WhatsApp con al menos 2 horas de antelación para permitir que otro socio pueda ocupar el horario en el sillón.
                </p>
              </div>

              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
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
                className="w-full py-3 rounded-2xl bg-barber-chai text-barber-lightText font-semibold text-xs uppercase tracking-wider"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Privacidad y Protección de Datos Personales */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-lg rounded-3xl bg-barber-darkSurface border border-barber-darkBorder p-6 sm:p-7 text-barber-darkText space-y-4 club-shadow max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-barber-darkBorder">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-barber-chai" />
                <h3 className="text-lg font-display font-bold">
                  Política de Privacidad y Protección de Datos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl text-barber-pistache hover:text-barber-darkText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-barber-pistache">
              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
                  Marco Legal (Ley N° 25.326 de la República Argentina)
                </strong>
                <p>
                  ULTRA BARBER Studio cumple con los principios de licitud, confidencialidad y seguridad consagrados en la Ley de Protección de Datos Personales N° 25.326.
                </p>
              </div>

              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
                  Finalidad del Tratamiento de Datos
                </strong>
                <p>
                  Los datos solicitados (DNI, Nombre, Apellido, Celular/WhatsApp y Fecha de Nacimiento) son recopilados exclusivamente para la gestión de turnos, envío de recordatorios directos y acreditación de beneficios y promociones de cumpleaños del club.
                </p>
              </div>

              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
                  Seguridad y Confidencialidad
                </strong>
                <p>
                  Las contraseñas y códigos PIN de acceso son almacenados con algoritmos de hashing criptográfico unidireccional. ULTRA BARBER Studio no comercializa, cede ni transfiere datos personales a terceras partes.
                </p>
              </div>

              <div>
                <strong className="text-barber-darkText font-semibold block mb-1">
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
                className="w-full py-3 rounded-2xl bg-barber-chai text-barber-lightText font-semibold text-xs uppercase tracking-wider"
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
