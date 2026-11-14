import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield,
  FileText,
  Lock,
  Scissors,
  X,
  Scale,
  Clock,
  MapPin,
  ExternalLink,
  Cookie,
  Building2
} from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import { setCookieConsent } from '../utils/analytics';

export default function Footer({ onOpenAdmin, adminUser, studioConfig = {} }) {
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | 'legal'

  const handleOpenCookieSettings = () => {
    // Dispara evento para que CookieConsentBanner abra el modal de configuración
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: 'pending' }));
  };

  return (
    <>
      <footer className="w-full mt-16 sm:mt-24 border-t border-white/[0.08] bg-[#070708] text-[#A1A1AA] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 pb-32 md:pb-12 space-y-8">
          {/* Header de información secundaria y ubicación */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-white/[0.08] text-[11px] font-mono text-[#A1A1AA]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378]" />
              <span className="tracking-wider uppercase text-[#D4D4D8]">
                Información general &amp; contacto • Sillón de David
              </span>
            </div>
            <a
              href={studioConfig.googleMapsUrl || 'https://maps.app.goo.gl/JK9s2uNjGVHNvEuS8'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA] hover:text-[#E5C378] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>
                Atención en {studioConfig.barbershopName || 'V.I.P Barberías'} • {studioConfig.address || 'Eva Perón 52'}
                {studioConfig.city ? `, ${studioConfig.city}` : ', Capitán Bermúdez'}
              </span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Columnas del Footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 text-xs text-[#A1A1AA]">
            {/* Columna 1: Identidad & Redes */}
            <div className="space-y-2.5 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#E5C378]">
                  <Scissors className="w-3.5 h-3.5 -rotate-45" />
                </div>
                <span className="font-display font-semibold text-sm tracking-tight text-[#EDEDED]">
                  David Barber
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF]">
                  • Sillón en {studioConfig.barbershopName || 'V.I.P Barberías'}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed text-[#9CA3AF] max-w-md">
                Espacio de atención personalizada para clientes de David. Turnos digitales y programa de fidelización por visitas sin seña previa.
              </p>

              <p className="text-[10px] font-mono text-[#9CA3AF]">
                {studioConfig.city || 'Capitán Bermúdez'}, Santa Fe • Atención exclusivamente con turno previo
              </p>

              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://www.instagram.com/barber_f4de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-[#EDEDED] hover:text-[#E5C378] transition-colors"
                >
                  <InstagramIcon className="w-3 h-3 text-[#E5C378]" />
                  <span>@barber_f4de</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#9CA3AF]" />
                </a>

                <a
                  href={studioConfig.googleMapsUrl || 'https://maps.app.goo.gl/JK9s2uNjGVHNvEuS8'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-[#EDEDED] hover:text-[#E5C378] transition-colors"
                >
                  <MapPin className="w-3 h-3 text-[#E5C378]" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#9CA3AF]" />
                </a>
              </div>
            </div>

            {/* Columna 2: Marco Legal & Políticas (Checklist 01, 02 y 03) */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#EDEDED] font-mono text-[11px] tracking-wider uppercase font-semibold">
                <Shield className="w-3.5 h-3.5 text-[#E5C378]" />
                <span>Marco Legal</span>
              </div>

              <ul className="space-y-2 pt-1 text-[11px]">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('legal')}
                    className="text-[#A1A1AA] hover:text-[#EDEDED] transition-colors flex items-center gap-1.5 text-left group"
                  >
                    <Building2 className="w-3 h-3 text-[#E5C378] shrink-0" />
                    <span className="group-hover:underline">Aviso Legal (Titular &amp; Datos)</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="text-[#A1A1AA] hover:text-[#EDEDED] transition-colors flex items-center gap-1.5 text-left group"
                  >
                    <Lock className="w-3 h-3 text-[#E5C378] shrink-0" />
                    <span className="group-hover:underline">Política de Privacidad (ARCO)</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="text-[#A1A1AA] hover:text-[#EDEDED] transition-colors flex items-center gap-1.5 text-left group"
                  >
                    <FileText className="w-3 h-3 text-[#E5C378] shrink-0" />
                    <span className="group-hover:underline">Términos del Servicio</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenCookieSettings}
                    className="text-[#A1A1AA] hover:text-[#EDEDED] transition-colors flex items-center gap-1.5 text-left group"
                  >
                    <Cookie className="w-3 h-3 text-[#E5C378] shrink-0" />
                    <span className="group-hover:underline">Preferencias de Cookies</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Columna 3: Horarios & Atención */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#EDEDED] font-mono text-[11px] tracking-wider uppercase font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#E5C378]" />
                <span>Horarios de Atención</span>
              </div>

              <div className="space-y-0.5 text-[11px] text-[#9CA3AF] leading-relaxed pt-1">
                <p className="text-[#D4D4D8] font-medium">Lunes a Sábados</p>
                <p className="font-mono text-[#E5C378]">09:00 a 20:00 hs</p>
                <p className="text-[10px] text-[#A1A1AA] pt-1">
                  Domingos cerrado • Tolerancia: 10 min
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Versión */}
          <div className="pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#9CA3AF]">
            <p>
              &copy; {new Date().getFullYear()} David Barber • Turnos &amp; Fidelización en {studioConfig.barbershopName || 'V.I.P Barberías'}. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-3">
              <span>Capitán Bermúdez, SF</span>
              <span>•</span>
              <span className="text-[#E5C378]">v2.6 Prod-Ready</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL 1: AVISO LEGAL (Checklist 01) */}
      {activeModal === 'legal' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
          <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/[0.12] p-6 sm:p-7 text-[#EDEDED] space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#E5C378]" />
                <h3 className="text-base font-display font-bold">
                  Aviso Legal e Identificación del Titular
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-[#A1A1AA]">
              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  1. Titular del Sitio Web y Servicio
                </strong>
                <p>
                  En cumplimiento del deber de información, se hace constar que el presente sitio web y la plataforma de gestión de turnos "David Barber" es operada por David (profesional barbero), prestando servicios comerciales de barbería y peluquería masculina en sillón privado dentro de {studioConfig.barbershopName || 'V.I.P Barberías'}.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  2. Domicilio Comercial &amp; Contacto
                </strong>
                <p>
                  <strong>Domicilio de atención:</strong> {studioConfig.address || 'Eva Perón 52'}, {studioConfig.city || 'Capitán Bermúdez'}, Provincia de Santa Fe, República Argentina (C.P. 2154).
                </p>
                <p className="mt-1">
                  <strong>WhatsApp de contacto:</strong> +54 9 341 376-2115.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  3. Propiedad Intelectual y Derechos Reservados
                </strong>
                <p>
                  Todos los contenidos expuestos en este sitio (fotografías del autor, diseño de interfaz, código fuente, logotipos y textos) son propiedad exclusiva de David Barber y están protegidos por las leyes de propiedad intelectual y marcas de la República Argentina. Queda prohibida su reproducción sin autorización previa.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  4. Condiciones de Uso de la Plataforma
                </strong>
                <p>
                  El acceso a la plataforma es gratuito para clientes. El usuario se compromete a hacer un uso diligente y veraz al momento de agendar turnos o identificarse con su DNI, absteniéndose de realizar reservas maliciosas o fraudulentas.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-xl bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-display font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-md active:scale-[0.98]"
              >
                Cerrar Aviso Legal
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: POLÍTICA DE PRIVACIDAD & DERECHOS ARCO (Checklist 02) */}
      {activeModal === 'privacy' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
          <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/[0.12] p-6 sm:p-7 text-[#EDEDED] space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#E5C378]" />
                <h3 className="text-base font-display font-bold">
                  Política de Privacidad y Protección de Datos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-[#A1A1AA]">
              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  1. Marco Legal (Ley N° 25.326 y Estándares RGPD)
                </strong>
                <p>
                  David Barber garantiza la protección integral de los datos personales de conformidad con la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina y las mejores prácticas internacionales de privacidad.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  2. Datos Recopilados y Finalidad Específica
                </strong>
                <p>
                  Los datos solicitados (DNI, Nombre, Apellido, Teléfono de WhatsApp y opcionalmente Fecha de Cumpleaños) son recabados con el único fin de:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                  <li>Gestionar y confirmar turnos de barbería.</li>
                  <li>Enviar recordatorios del servicio acordado.</li>
                  <li>Acreditar puntos del programa de fidelización del Club y beneficios de cumpleaños.</li>
                </ul>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  3. Plazo de Conservación y Seguridad
                </strong>
                <p>
                  Los datos se conservan únicamente mientras el cliente mantenga activo su perfil en el Club o no solicite su baja. Los códigos PIN de acceso se almacenan cifrados mediante algoritmos criptográficos unidireccionales (bcrypt). Los datos jamás son vendidos, transferidos ni compartidos con empresas externas de publicidad.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  4. Ejercicio de Derechos ARCO
                </strong>
                <p>
                  Usted puede ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> o supresión definitiva de su ficha de cliente enviando un mensaje directo al WhatsApp oficial de David Barber.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-xl bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-display font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-md active:scale-[0.98]"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: TÉRMINOS DEL SERVICIO Y CANCELACIÓN */}
      {activeModal === 'terms' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-enter">
          <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/[0.12] p-6 sm:p-7 text-[#EDEDED] space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-[#E5C378]" />
                <h3 className="text-base font-display font-bold">
                  Términos del Servicio y Política de Turnos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#EDEDED] hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-[#A1A1AA]">
              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  1. Reserva y Bloqueo de Agenda
                </strong>
                <p>
                  Toda solicitud de turno web genera un bloqueo temporal de 15 minutos en agenda para que el cliente confirme vía WhatsApp. Pasado ese tiempo sin confirmación, el horario vuelve a liberarse.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  2. Puntualidad y Tolerancia
                </strong>
                <p>
                  Por respeto a los clientes subsiguientes, la tolerancia máxima de espera en el sillón es de 10 minutos. Pasado ese tiempo, el turno podrá ser reprogramado.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  3. Cancelaciones
                </strong>
                <p>
                  Si no podés asistir, solicitamos cancelar con un mínimo de 2 horas de anticipación a través del botón "Mis Turnos" o vía WhatsApp para permitir a otro cliente reservar.
                </p>
              </div>

              <div>
                <strong className="text-[#EDEDED] font-semibold block mb-1">
                  4. Beneficios del Club
                </strong>
                <p>
                  Los puntos y canjes acumulados son personales e intransferibles, asociados a tu número de DNI y protegidos mediante PIN.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-3 rounded-xl bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-display font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-md active:scale-[0.98]"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
