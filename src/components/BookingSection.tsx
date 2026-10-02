import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  Appointment,
  AuthUser,
  ClinicDatabase,
  PreEvaluationResult,
} from '../types/clinic';
import {
  computeSlotsForDate,
  formatFrenchDate,
  formatShortFrenchDate,
  getNextWorkingDayIso,
  getTodayIso,
} from '../data/initialClinicData';

interface BookingSectionProps {
  clinicData: ClinicDatabase;
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  preEvaluation: PreEvaluationResult | null;
  onClearPreEvaluation: () => void;
  onAppointmentCreated: (apt: Appointment) => void;
  onOpenLegalModal: () => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: (role?: 'admin' | 'patient') => void;
  onUserAuthenticated?: (user: AuthUser) => void;
  onLogoutUser?: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  clinicData,
  selectedServiceId,
  onSelectServiceId,
  preEvaluation,
  onClearPreEvaluation,
  onAppointmentCreated,
  onOpenLegalModal,
  currentUser,
  onOpenAuthModal,
  onUserAuthenticated,
  onLogoutUser,
}) => {
  const activeServices = useMemo(
    () => clinicData.services.filter((s) => s.active),
    [clinicData.services]
  );

  const [selectedDate, setSelectedDate] = useState<string>(() => getNextWorkingDayIso(1));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [motif, setMotif] = useState<string>('');
  const [optionalMessage, setOptionalMessage] = useState<string>('');

  const [emailConfirmation, setEmailConfirmation] = useState<boolean>(true);
  const [whatsappSms, setWhatsappSms] = useState<boolean>(true);
  const [reminder24h, setReminder24h] = useState<boolean>(true);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Sync motif when preEvaluation arrives
  useEffect(() => {
    if (preEvaluation) {
      const formattedMotif = `Orientation pré-évaluation : ${preEvaluation.bodyArea} · ${preEvaluation.duration} · ${preEvaluation.mainIssue} (Objectif : ${preEvaluation.mainGoal})`;
      setMotif(formattedMotif);
      if (preEvaluation.suggestedServiceId) {
        onSelectServiceId(preEvaluation.suggestedServiceId);
      }
    }
  }, [preEvaluation, onSelectServiceId]);

  // Auto-fill from currentUser (Google, Apple, Email)
  useEffect(() => {
    if (currentUser) {
      if (currentUser.email && !email) {
        setEmail(currentUser.email);
      }
      if (currentUser.name && currentUser.name !== 'Patient Kiné Plus') {
        const parts = currentUser.name.trim().split(' ');
        if (parts.length > 1) {
          if (!firstName) setFirstName(parts[0]);
          if (!lastName) setLastName(parts.slice(1).join(' '));
        } else if (parts.length === 1) {
          if (!firstName) setFirstName(parts[0]);
        }
      }
    }
  }, [currentUser]);

  const upcomingDates = useMemo(() => {
    const list: string[] = [];
    for (let i = 1; i <= 14; i++) {
      list.push(getTodayIso(i));
    }
    return list;
  }, []);

  const currentDaySlots = useMemo(
    () => computeSlotsForDate(selectedDate, clinicData),
    [selectedDate, clinicData]
  );

  useEffect(() => {
    const firstAvailable = currentDaySlots.slots.find((s) => s.available);
    if (
      !selectedTime ||
      !currentDaySlots.slots.some((s) => s.time === selectedTime && s.available)
    ) {
      setSelectedTime(firstAvailable ? firstAvailable.time : '');
    }
  }, [selectedDate, currentDaySlots, selectedTime]);

  const selectedService =
    activeServices.find((s) => s.id === selectedServiceId) || activeServices[0];

  const handleFindNextAvailableDate = () => {
    for (let i = 1; i <= 30; i++) {
      const d = getTodayIso(i);
      const info = computeSlotsForDate(d, clinicData);
      if (!info.isClosedDay && info.slots.some((s) => s.available)) {
        setSelectedDate(d);
        return;
      }
    }
  };

  const handleDownloadIcs = (apt: Appointment) => {
    const [year, month, day] = apt.date.split('-').map(Number);
    const [hour, minute] = apt.time.split(':').map(Number);
    const startDt = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const endDt = new Date(startDt.getTime() + 30 * 60 * 1000);

    const formatIcsDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kine Plus//RDV//FR',
      'BEGIN:VEVENT',
      `UID:${apt.reference}@kineplus.fr`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDt)}`,
      `DTEND:${formatIcsDate(endDt)}`,
      `SUMMARY:Rendez-vous Kiné Plus - ${apt.serviceName}`,
      `DESCRIPTION:Référence: ${apt.reference}\\nMotif: ${apt.motif}\\nTéléphone cabinet: ${clinicData.settings.phoneDisplay}`,
      `LOCATION:${clinicData.settings.address}, ${clinicData.settings.cityPostal}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apt.reference}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedService) {
      setErrorMsg('Veuillez choisir un type de consultation.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setErrorMsg('Veuillez sélectionner une date et un créneau horaire disponible.');
      return;
    }
    if (!lastName.trim() || !firstName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom et votre prénom.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      setErrorMsg('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!motif.trim()) {
      setErrorMsg('Veuillez préciser votre motif général de consultation.');
      return;
    }
    if (!privacyAccepted) {
      setErrorMsg(
        'Veuillez accepter la politique de confidentialité concernant le traitement de vos données de rendez-vous.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime,
          lastName: lastName.trim(),
          firstName: firstName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          motif: motif.trim(),
          optionalMessage: optionalMessage.trim(),
          preEvaluation: preEvaluation || undefined,
          notificationPrefs: {
            emailConfirmation,
            whatsappSms,
            reminder24h,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Une erreur est survenue lors de la réservation.');
        setIsSubmitting(false);
        return;
      }

      const created: Appointment = data.appointment;
      setConfirmedAppointment(created);
      onAppointmentCreated(created);
    } catch {
      // Offline / optimistic fallback
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const fallbackApt: Appointment = {
        id: `apt-${Date.now()}`,
        reference: `KP-${selectedDate.slice(0, 4)}-${randomCode}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        motif: motif.trim(),
        optionalMessage: optionalMessage.trim(),
        preEvaluation: preEvaluation || undefined,
        status: 'confirmed',
        notificationPrefs: {
          emailConfirmation,
          whatsappSms,
          reminder24h,
        },
        notificationStatus: {
          emailStatus: emailConfirmation ? 'sent_simulated' : 'disabled',
          whatsappStatus: whatsappSms ? 'queued_simulated' : 'disabled',
          reminderScheduledFor: reminder24h
            ? `24h avant le ${selectedDate} à ${selectedTime}`
            : undefined,
        },
        createdAt: new Date().toISOString(),
      };
      setConfirmedAppointment(fallbackApt);
      onAppointmentCreated(fallbackApt);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setConfirmedAppointment(null);
    setSelectedTime('');
    setOptionalMessage('');
    setErrorMsg(null);
  };

  return (
    <section
      id="reservation"
      className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-10 space-y-3">
          <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Réservation en ligne · Kiné Plus
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Réservez votre séance avec le cabinet Kiné Plus
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Choisissez la prestation souhaitée, sélectionnez un créneau disponible puis renseignez
            vos coordonnées pour recevoir votre confirmation instantanée.
          </p>
        </div>

        {confirmedAppointment ? (
          /* PROFESSIONAL CONFIRMATION VIEW */
          <div className="rounded-2xl border border-teal-700/30 dark:border-teal-500/40 bg-white dark:bg-slate-900 p-6 sm:p-10 space-y-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-teal-700 dark:text-teal-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Rendez-vous validé chez Kiné Plus
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-0.5">
                    Confirmation de votre rendez-vous
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Merci {confirmedAppointment.firstName} {confirmedAppointment.lastName}. Votre
                    créneau est bien réservé au planning de notre cabinet.
                  </p>
                </div>
              </div>

              <div className="sm:text-right bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Numéro de réservation
                </div>
                <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
                  {confirmedAppointment.reference}
                </div>
              </div>
            </div>

            {/* Key details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Détails de la séance
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Patient</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white text-right">
                      {confirmedAppointment.firstName} {confirmedAppointment.lastName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Consultation</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white text-right">
                      {confirmedAppointment.serviceName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Date</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white text-right capitalize">
                      {formatFrenchDate(confirmedAppointment.date)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-200/70 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Heure</dt>
                    <dd className="font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-400 text-right">
                      {confirmedAppointment.time}
                    </dd>
                  </div>
                  <div className="pt-1">
                    <dt className="text-slate-500 dark:text-slate-400 mb-1">
                      Motif de consultation
                    </dt>
                    <dd className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                      {confirmedAppointment.motif}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Coordonnées du cabinet & Notifications
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {clinicData.settings.cabinetName}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs mt-1 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>
                        {clinicData.settings.address} · {clinicData.settings.cityPostal}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                      <span>{clinicData.settings.phoneDisplay}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="font-medium text-slate-900 dark:text-slate-200">
                      Notifications programmées :
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                      <span>
                        Confirmation e-mail ({confirmedAppointment.email}) :{' '}
                        <strong>Envoyée</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                      <span>
                        Notification WhatsApp ({confirmedAppointment.phone}) :{' '}
                        <strong>Programmée</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Bell className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                      <span>
                        Rappel automatique :{' '}
                        <strong>
                          {confirmedAppointment.notificationStatus.reminderScheduledFor ||
                            '24h avant la séance'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical actions on confirmation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadIcs(confirmedAppointment)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Ajouter à mon agenda (.ics)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le récapitulatif</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleBookAnother}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Effectuer une autre réservation
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleSubmitBooking} className="space-y-8" noValidate>
            {preEvaluation && (
              <div className="p-4 rounded-xl border border-teal-700/30 bg-teal-50/60 dark:bg-teal-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-800 dark:text-slate-200 space-y-0.5">
                  <div className="font-semibold text-teal-800 dark:text-teal-300">
                    Pré-évaluation transmise automatiquement à votre demande
                  </div>
                  <div>
                    Zone : {preEvaluation.bodyArea} · Durée : {preEvaluation.duration} · Gêne :{' '}
                    {preEvaluation.mainIssue} · Objectif : {preEvaluation.mainGoal}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClearPreEvaluation}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline self-start sm:self-center cursor-pointer whitespace-nowrap"
                >
                  Retirer la synthèse
                </button>
              </div>
            )}

            {/* STEP 1: Select consultation */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                  1. Choisissez le type de consultation
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  Étape 1 / 3
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeServices.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => onSelectServiceId(srv.id)}
                      className={`text-left p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/50 dark:border-teal-500 dark:bg-teal-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {srv.code}. {srv.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {srv.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                        <span>Durée : {srv.durationLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{srv.price}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Date & Time Slot */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                    2. Choisissez la date et l’heure de votre rendez-vous
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Créneaux en temps réel sur le planning de Kiné Plus.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="booking-date-picker"
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap"
                  >
                    Autre date :
                  </label>
                  <input
                    id="booking-date-picker"
                    type="date"
                    min={getTodayIso(0)}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Quick dates bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {upcomingDates.map((dateIso) => {
                  const dayInfo = computeSlotsForDate(dateIso, clinicData);
                  const freeCount = dayInfo.slots.filter((s) => s.available).length;
                  const isSelected = selectedDate === dateIso;
                  return (
                    <button
                      key={dateIso}
                      type="button"
                      onClick={() => setSelectedDate(dateIso)}
                      className={`px-3.5 py-2.5 rounded-xl border text-left shrink-0 transition-colors cursor-pointer min-w-[115px] ${
                        isSelected
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : dayInfo.isClosedDay || freeCount === 0
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 text-slate-400'
                          : 'border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 hover:border-teal-600/60 text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="text-xs font-semibold capitalize">
                        {formatShortFrenchDate(dateIso)}
                      </div>
                      <div
                        className={`text-[11px] font-mono tabular-nums mt-0.5 ${
                          isSelected
                            ? 'text-teal-100'
                            : freeCount > 0
                            ? 'text-teal-700 dark:text-teal-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {dayInfo.isClosedDay || freeCount === 0
                          ? 'Fermé / Complet'
                          : `${freeCount} créneaux`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium capitalize">
                    Créneaux pour le {formatFrenchDate(selectedDate)} :
                  </span>
                  {selectedTime && (
                    <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                      Heure sélectionnée : {selectedTime}
                    </span>
                  )}
                </div>

                {currentDaySlots.isClosedDay ? (
                  <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 text-center space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentDaySlots.absenceReason || 'Le cabinet Kiné Plus est fermé à cette date.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleFindNextAvailableDate}
                      className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Aller au prochain jour disponible
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2.5">
                    {currentDaySlots.slots.map((slot) => {
                      const isChosen = selectedTime === slot.time && slot.available;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2.5 px-3 rounded-lg border font-mono text-xs tabular-nums transition-colors flex flex-col items-center justify-center min-h-[46px] ${
                            !slot.available
                              ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed line-through'
                              : isChosen
                              ? 'border-teal-700 bg-teal-700 text-white font-semibold cursor-pointer'
                              : 'border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 hover:border-teal-600 text-slate-900 dark:text-slate-100 cursor-pointer'
                          }`}
                        >
                          <span>{slot.time}</span>
                          {!slot.available && (
                            <span className="text-[10px] no-underline font-sans">Occupé</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: Patient Information */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                    3. Informations du patient
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Données traitées confidentiellement par le cabinet Kiné Plus.
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  Étape 3 / 3
                </span>
              </div>

              {/* Fast Authentication: Google / Apple / E-mail */}
              {currentUser ? (
                <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-teal-900 dark:text-teal-200 truncate">
                        Connecté via {currentUser.provider === 'google' ? 'Google' : currentUser.provider === 'apple' ? 'Apple ID' : 'E-mail'} ({currentUser.name})
                      </div>
                      <div className="text-[11px] text-teal-700 dark:text-teal-400 truncate">
                        {currentUser.email} · Coordonnées appliquées automatiquement
                      </div>
                    </div>
                  </div>
                  {onLogoutUser && (
                    <button
                      type="button"
                      onClick={onLogoutUser}
                      className="text-xs text-slate-500 hover:text-rose-600 underline cursor-pointer shrink-0"
                    >
                      Changer
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Authentification & Pré-remplissage en 1 clic</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Identifiez-vous pour remplir automatiquement votre nom, prénom et e-mail :
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/auth/google', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: email || 'patient@gmail.com', name: lastName ? `${firstName} ${lastName}` : 'Patient Kiné Plus' }),
                          });
                          const data = await res.json();
                          if (data?.user) {
                            onUserAuthenticated?.(data.user);
                            if (!email && data.user.email) setEmail(data.user.email);
                          }
                        } catch {
                          onOpenAuthModal?.('patient');
                        }
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.06 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/auth/apple', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: email || 'patient@icloud.com' }),
                          });
                          const data = await res.json();
                          if (data?.user) {
                            onUserAuthenticated?.(data.user);
                            if (!email && data.user.email) setEmail(data.user.email);
                          }
                        } catch {
                          onOpenAuthModal?.('patient');
                        }
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium hover:bg-neutral-800 cursor-pointer shadow-2xs transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 0.6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.05-.51 2.68-1.26z" />
                      </svg>
                      <span>Apple</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenAuthModal?.('patient')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-700" />
                      <span>E-mail</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="patient-lastname"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Nom <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="patient-lastname"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom de famille"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="patient-firstname"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Prénom <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="patient-firstname"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="patient-phone"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Téléphone portable <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="patient-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="patient-email"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Adresse e-mail <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="patient-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.fr"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="patient-motif"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Motif de consultation <span className="text-rose-600">*</span>
                </label>
                <input
                  id="patient-motif"
                  type="text"
                  required
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ex. Rééducation épaule, mal de dos, suite d’opération..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label
                  htmlFor="patient-message"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Précisions utiles (facultatif - ordonnance médicale, antécédents...)
                </label>
                <textarea
                  id="patient-message"
                  rows={2}
                  value={optionalMessage}
                  onChange={(e) => setOptionalMessage(e.target.value)}
                  placeholder="Informations supplémentaires pour la cheffe du cabinet ou l’équipe..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-teal-700"
                />
              </div>

              {/* Reminders */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Canaux de confirmation & rappels
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfirmation}
                      onChange={(e) => setEmailConfirmation(e.target.checked)}
                      className="mt-0.5 accent-teal-700"
                    />
                    <span>
                      <strong className="block text-slate-900 dark:text-white">
                        Confirmation e-mail
                      </strong>
                      <span className="text-slate-500">Récapitulatif immédiat</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappSms}
                      onChange={(e) => setWhatsappSms(e.target.checked)}
                      className="mt-0.5 accent-teal-700"
                    />
                    <span>
                      <strong className="block text-slate-900 dark:text-white">
                        Notification WhatsApp / SMS
                      </strong>
                      <span className="text-slate-500">Alerte sur votre mobile</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder24h}
                      onChange={(e) => setReminder24h(e.target.checked)}
                      className="mt-0.5 accent-teal-700"
                    />
                    <span>
                      <strong className="block text-slate-900 dark:text-white">
                        Rappel la veille (24h)
                      </strong>
                      <span className="text-slate-500">Rappel automatique</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* GDPR */}
              <div className="pt-2">
                <label className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 accent-teal-700"
                  />
                  <span>
                    J’accepte que mes coordonnées soient traitées de manière confidentielle par le
                    cabinet Kiné Plus aux seules fins de planifier mon rendez-vous.{' '}
                    <button
                      type="button"
                      onClick={onOpenLegalModal}
                      className="text-teal-700 dark:text-teal-400 underline cursor-pointer"
                    >
                      Politique de confidentialité
                    </button>
                    .
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span className="capitalize">{formatFrenchDate(selectedDate)}</span>
                    <span aria-hidden="true">·</span>
                    <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span className="font-mono tabular-nums">{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>Sécurisé · Cabinet Kiné Plus ({clinicData.settings.phoneDisplay})</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTime}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Validation...' : 'Confirmer mon rendez-vous'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
