/**
 * Módulo de Analítica y Medición de Conversión (Punto 19 del Checklist)
 * Cumple con el consentimiento previo de cookies (Punto 03).
 */

const COOKIE_CONSENT_KEY = 'barberfade_cookie_consent';

export function getCookieConsent() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setCookieConsent(choice) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: choice }));
  } catch {}
}

export function isAnalyticsAllowed() {
  const consent = getCookieConsent();
  return consent === 'all';
}

/**
 * Envío de evento de analítica respetando el consentimiento del usuario
 */
export function trackEvent(eventName, params = {}) {
  if (!isAnalyticsAllowed()) {
    // Si no hay consentimiento explícito, no se transmiten datos
    return;
  }

  try {
    // 1. Google Analytics 4 (si window.gtag está presente)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    // 2. Evento interno para telemetría
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ANALYTICS EVENT] ${eventName}:`, params);
    }
  } catch (err) {
    console.error('Error al emitir evento de analítica:', err);
  }
}

// Eventos de conversión clave
export const analytics = {
  trackWhatsAppClick: (location = 'floating') => {
    trackEvent('contact_whatsapp_click', { location });
  },
  trackBookingStart: (serviceName) => {
    trackEvent('booking_step_start', { service: serviceName });
  },
  trackBookingSuccess: (appointmentCode, serviceName) => {
    trackEvent('booking_completed', {
      code: appointmentCode,
      service: serviceName,
      value: 1
    });
  },
  trackClubLogin: (dniMasked) => {
    trackEvent('club_client_login', { client: dniMasked });
  },
  trackGalleryView: () => {
    trackEvent('gallery_viewed');
  }
};
