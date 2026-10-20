import os

path = r"src/components/ClientView/ClientView.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update handleRequestTurn
old_handle = """  const handleRequestTurn = async () => {
    if (!loggedClient) return;
    if (!selectedService || !selectedDate || !selectedTime) {
      setBookingError('Seleccioná un servicio, fecha y horario libre.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');
    try {
      const res = await api.requestAppointment({
        serviceId: selectedService.id,
        selectedDrink: selectedService.drinkIncluded ? selectedDrink : null,
        date: selectedDate,
        time: selectedTime
      });
      setAppointmentResponse(res);
      setBookingStep(3);
      if (onRefreshClientSession) onRefreshClientSession();
    } catch (err) {
      setBookingError(err.message || 'No se pudo solicitar el turno.');
    } finally {
      setIsSubmitting(false);
    }
  };"""

new_handle = """  const handleRequestTurn = async (clientOverride = null) => {
    const clientToUse = clientOverride || loggedClient;
    if (!clientToUse) {
      setBookingStep(3);
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) {
      setBookingError('Seleccioná un servicio, fecha y horario libre.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');
    try {
      const res = await api.requestAppointment({
        serviceId: selectedService.id,
        selectedDrink: selectedService.drinkIncluded ? selectedDrink : null,
        date: selectedDate,
        time: selectedTime
      });
      setAppointmentResponse(res);
      setBookingStep(4);
      if (onRefreshClientSession) onRefreshClientSession();
    } catch (err) {
      setBookingError(err.message || 'No se pudo solicitar el turno.');
    } finally {
      setIsSubmitting(false);
    }
  };"""

assert old_handle in content, "old_handle not found"
content = content.replace(old_handle, new_handle, 1)

# 2. In Home tab DniStep: don't force eject to book on login
old_home_dni = """            {/* 3. DniStep (Identificación / Cuenta de Socio con toggle Ya soy socio / Primera vez) */}
            <DniStep
              loggedClient={loggedClient}
              guestMode={guestMode}
              setGuestMode={setGuestMode}
              onAuthSuccess={(client, apts) => onAuthSuccess(client, apts)}
              onAdminAuthSuccess={onAdminAuthSuccess}
              onLogoutClient={onLogoutClient}
              onContinue={() => {
                setSubTab('book');
                setBookingStep(1);
              }}
            />"""

new_home_dni = """            {/* 3. DniStep (Identificación / Cuenta de Socio con toggle Ya soy socio / Primera vez) */}
            <DniStep
              loggedClient={loggedClient}
              guestMode={guestMode}
              setGuestMode={setGuestMode}
              onAuthSuccess={(client, apts) => onAuthSuccess(client, apts)}
              onAdminAuthSuccess={onAdminAuthSuccess}
              onLogoutClient={onLogoutClient}
              onContinue={() => {
                // Permanece en el carnet para ver puntos y beneficios
              }}
            />"""

assert old_home_dni in content, "old_home_dni not found"
content = content.replace(old_home_dni, new_home_dni, 1)

# 3. In active turn resume hold: setBookingStep(4)
old_resume_1 = """                          setSubTab('book');
                          setBookingStep(3);"""
new_resume_1 = """                          setSubTab('book');
                          setBookingStep(4);"""
content = content.replace(old_resume_1, new_resume_1, 1)

old_resume_2 = """                            setSubTab('book');
                            setBookingStep(3);"""
new_resume_2 = """                            setSubTab('book');
                            setBookingStep(4);"""
content = content.replace(old_resume_2, new_resume_2, 1)

# 4. In book subtab: invert booking funnel to Value First
old_book_tab = """      {/* SUBTAB 2: RESERVAR TURNO */}
      {subTab === 'book' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {bookingError && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
              {bookingError}
            </div>
          )}

          {/* Require Client Auth (DNI + PIN) before booking */}
          {!loggedClient ? (
            <div className="max-w-md mx-auto">
              <DniStep
                loggedClient={loggedClient}
                guestMode={guestMode}
                setGuestMode={setGuestMode}
                onAuthSuccess={(client, apts) => {
                  onAuthSuccess(client, apts);
                  setBookingStep(1);
                }}
                onAdminAuthSuccess={onAdminAuthSuccess}
                onLogoutClient={onLogoutClient}
                onContinue={() => setBookingStep(1)}
              />
            </div>
          ) : (
            <div key={bookingStep} className="animate-stepper-morph">
              {bookingStep === 1 && (
                <ServiceStep
                  services={services}
                  drinks={drinks}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  selectedDrink={selectedDrink}
                  setSelectedDrink={setSelectedDrink}
                  onBack={() => setSubTab('club')}
                  onContinue={() => setBookingStep(2)}
                  whatsappPhone={studioConfig?.whatsappPhone || '5493413762115'}
                />
              )}

              {bookingStep === 2 && (
                <DateTimeStep
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  selectedDrink={selectedDrink}
                  onBack={() => setBookingStep(1)}
                  onRequestTurn={handleRequestTurn}
                  isSubmitting={isSubmitting}
                  selectedService={selectedService}
                  studioConfig={studioConfig}
                />
              )}

              {bookingStep === 3 && appointmentResponse && (
                <div className="max-w-xl mx-auto">
                  <HoldWaitingStep
                    appointmentData={appointmentResponse}
                    onResetToNewBooking={() => {
                      if (onRefreshClientSession) onRefreshClientSession();
                      setSubTab('turns');
                    }}
                    onConfirmed={() => {
                      if (onRefreshClientSession) onRefreshClientSession();
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}"""

new_book_tab = """      {/* SUBTAB 2: RESERVAR TURNO (Flujo Canónico: Valor Primero -> Identificación al Final) */}
      {subTab === 'book' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {bookingError && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
              {bookingError}
            </div>
          )}

          <div key={bookingStep} className="animate-stepper-morph">
            {/* Paso 1: Servicios & Bento Grid */}
            {bookingStep === 1 && (
              <ServiceStep
                services={services}
                drinks={drinks}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                selectedDrink={selectedDrink}
                setSelectedDrink={setSelectedDrink}
                onBack={() => setSubTab('club')}
                onContinue={() => setBookingStep(2)}
                whatsappPhone={studioConfig?.whatsappPhone || '5493413762115'}
              />
            )}

            {/* Paso 2: Fecha y Horario */}
            {bookingStep === 2 && (
              <DateTimeStep
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                selectedDrink={selectedDrink}
                onBack={() => setBookingStep(1)}
                onRequestTurn={() => {
                  if (loggedClient) {
                    handleRequestTurn();
                  } else {
                    setBookingStep(3);
                  }
                }}
                isSubmitting={isSubmitting}
                selectedService={selectedService}
                studioConfig={studioConfig}
              />
            )}

            {/* Paso 3: Identificación / Check-in sólo para Invitados antes de confirmar */}
            {bookingStep === 3 && !loggedClient && (
              <div className="max-w-md mx-auto space-y-4 animate-enter">
                <div className="text-center pb-2">
                  <span className="micro-technical text-[#E5C378] block mb-1">
                    03 / 03 CHECK-IN &amp; IDENTIFICACIÓN
                  </span>
                  <h3 className="text-xl font-display font-bold text-[#EDEDED]">
                    ¿A nombre de quién reservamos el sillón?
                  </h3>
                  <p className="text-xs text-[#8A898E] mt-1">
                    Ingresá tu DNI para confirmar el turno y sumar puntos en tu pase de socio.
                  </p>
                </div>

                <DniStep
                  loggedClient={loggedClient}
                  guestMode={guestMode}
                  setGuestMode={setGuestMode}
                  onAuthSuccess={async (client, apts) => {
                    onAuthSuccess(client, apts);
                    await handleRequestTurn(client);
                  }}
                  onAdminAuthSuccess={onAdminAuthSuccess}
                  onLogoutClient={onLogoutClient}
                  onContinue={() => {
                    if (loggedClient) handleRequestTurn();
                  }}
                />

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="text-xs font-mono text-[#8A898E] hover:text-[#EDEDED] uppercase tracking-wider"
                  >
                    ← Cambiar día u horario
                  </button>
                </div>
              </div>
            )}

            {/* Paso 4 (o Paso 3 si ya estaba logueado): Bloqueo temporal Hold y WhatsApp Handshake */}
            {(bookingStep === 4 || (bookingStep === 3 && loggedClient)) && appointmentResponse && (
              <div className="max-w-xl mx-auto">
                <HoldWaitingStep
                  appointmentData={appointmentResponse}
                  onResetToNewBooking={() => {
                    if (onRefreshClientSession) onRefreshClientSession();
                    setSubTab('turns');
                  }}
                  onConfirmed={() => {
                    if (onRefreshClientSession) onRefreshClientSession();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}"""

assert old_book_tab in content, "old_book_tab not found"
content = content.replace(old_book_tab, new_book_tab, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("[OK] ClientView.jsx successfully updated!")
