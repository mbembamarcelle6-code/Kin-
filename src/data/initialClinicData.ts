import {
  ClinicDatabase,
  PreEvalBodyArea,
  PreEvalDuration,
  PreEvalMainGoal,
  PreEvalMainIssue,
} from '../types/clinic';

export function getTodayIso(offsetDays = 0): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextWorkingDayIso(minOffsetDays = 1): string {
  let offset = minOffsetDays;
  while (offset < minOffsetDays + 10) {
    const candidate = new Date();
    candidate.setDate(candidate.getDate() + offset);
    const dow = candidate.getDay();
    if (dow !== 0) {
      const year = candidate.getFullYear();
      const month = String(candidate.getMonth() + 1).padStart(2, '0');
      const day = String(candidate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    offset++;
  }
  return getTodayIso(minOffsetDays);
}

export const INITIAL_CLINIC_DB: ClinicDatabase = {
  settings: {
    cabinetName: 'Kiné Plus',
    tagline: 'Cabinet de Kinésithérapie & Rééducation fonctionnelle',
    shortPresentation:
      'Bienvenue au cabinet Kiné Plus. Sous la direction de notre cheffe de cabinet et de son équipe, nous vous accueillons pour un bilan complet, un accompagnement personnalisé et des soins de haute qualité adaptés à vos besoins.',
    address: '12 Avenue des Praticiens',
    cityPostal: '75011 Paris',
    accessNotes:
      'Cabinet situé en rez-de-chaussée accessible PMR. Métro à 2 minutes à pied. Stationnement disponible à proximité.',
    phoneDisplay: '06 85 63 21 70',
    phoneDial: '0685632170',
    whatsappNumber: '06 85 63 21 70',
    emailContact: 'moussietoudorlon@gmail.com',
    openingHoursSummary: 'Lundi – Vendredi : 08h30 – 19h30 · Samedi : 09h00 – 13h00',
    practitioners: [
      {
        id: 'prac-dorlon-cheffe',
        name: 'Mme. Dorlon',
        role: 'Cheffe du cabinet Kiné Plus & Masseur-Kinésithérapeute D.E.',
        rpps: 'N° RPPS : 10104829103 / Ordre des Masseurs-Kinésithérapeutes',
        bio: 'Fondatrice et directrice du cabinet Kiné Plus. Spécialisée en rééducation fonctionnelle, prise en charge du rachis, réhabilitation post-traumatique et accompagnement individualisé des sportifs et patients de tout âge.',
        photoUrl: '/src/assets/images/cheffe_kine_plus_1790937963788.jpg',
        isHead: true,
      },
      {
        id: 'prac-equipe-collaborateur',
        name: 'Équipe Kiné Plus',
        role: 'Masseurs-Kinésithérapeutes Diplômés d’État',
        rpps: 'Inscrits au Conseil National de l’Ordre',
        bio: 'Équipe dédiée aux soins personnalisés, à la thérapie manuelle, au drainage et au renforcement proprioceptif au sein du plateau technique Kiné Plus.',
        isHead: false,
      },
    ],
    integrations: {
      emailSystemConnected: true,
      whatsappSmsConnected: true,
      autoReminderConfigured: true,
    },
    evolutiveModules: {
      onlinePayment: false,
      teleconsultation: true,
      securePatientRecord: true,
      exercisePrograms: true,
      sessionTracking: true,
    },
  },
  services: [
    {
      id: 'srv-bilan-initial',
      code: '01',
      name: 'Première séance & Bilan diagnostic kinésithérapique',
      description:
        'Consultation initiale approfondie menée avec notre équipe pour évaluer votre posture, amplitude articulaire, mobilité et définir le plan de soins adapté.',
      durationLabel: '45 min',
      durationMinutes: 45,
      price: 'Conventionné Sécurité Sociale & Mutuelles',
      active: true,
      tags: ['Première consultation', 'Bilan complet', 'Orientation'],
    },
    {
      id: 'srv-reeducation-rachis',
      code: '02',
      name: 'Rééducation Dos, Cou & Posture',
      description:
        'Prise en charge ciblée des cervicalgies, dorsalgies, lombalgies, sciatiques et déséquilibres posturaux avec exercices guidés.',
      durationLabel: '30 min',
      durationMinutes: 30,
      price: 'Conventionné',
      active: true,
      tags: ['Dos', 'Cou', 'Lombaires'],
    },
    {
      id: 'srv-membres-articulations',
      code: '03',
      name: 'Rééducation Articulaire & Membres',
      description:
        'Soin des articulations périphériques : épaule (tendinopathies, coiffe des rotateurs), genou (ligaments, ménisques), hanche, cheville et pied.',
      durationLabel: '30 min',
      durationMinutes: 30,
      price: 'Conventionné',
      active: true,
      tags: ['Épaule', 'Genou', 'Hanche', 'Cheville'],
    },
    {
      id: 'srv-post-blessure-operation',
      code: '04',
      name: 'Suivi Post-Opératoire & Récupération Traumatique',
      description:
        'Rééducation post-chirurgie (prothèse de hanche/genou, chirurgie d’épaule) et suite d’entorses ou fractures selon le protocole de votre chirurgien.',
      durationLabel: '45 min',
      durationMinutes: 45,
      price: 'Conventionné',
      active: true,
      tags: ['Post-opératoire', 'Traumatologie'],
    },
    {
      id: 'srv-sport-reprise',
      code: '05',
      name: 'Kinésithérapie du Sport & Reprise d’Activité',
      description:
        'Accompagnement dynamique sur notre plateau technique pour restaurer la puissance musculaire, l’endurance et la proprioception en vue de la reprise sportive.',
      durationLabel: '45 min',
      durationMinutes: 45,
      price: 'Conventionné',
      active: true,
      tags: ['Sport', 'Proprioception', 'Renforcement'],
    },
  ],
  weeklySchedule: [
    {
      dayOfWeek: 1,
      label: 'Lundi',
      enabled: true,
      morningStart: '08:30',
      morningEnd: '12:30',
      afternoonStart: '14:00',
      afternoonEnd: '19:30',
      slotDurationMinutes: 30,
    },
    {
      dayOfWeek: 2,
      label: 'Mardi',
      enabled: true,
      morningStart: '08:30',
      morningEnd: '12:30',
      afternoonStart: '14:00',
      afternoonEnd: '19:30',
      slotDurationMinutes: 30,
    },
    {
      dayOfWeek: 3,
      label: 'Mercredi',
      enabled: true,
      morningStart: '08:30',
      morningEnd: '12:30',
      afternoonStart: '14:00',
      afternoonEnd: '19:30',
      slotDurationMinutes: 30,
    },
    {
      dayOfWeek: 4,
      label: 'Jeudi',
      enabled: true,
      morningStart: '08:30',
      morningEnd: '12:30',
      afternoonStart: '14:00',
      afternoonEnd: '19:30',
      slotDurationMinutes: 30,
    },
    {
      dayOfWeek: 5,
      label: 'Vendredi',
      enabled: true,
      morningStart: '08:30',
      morningEnd: '12:30',
      afternoonStart: '14:00',
      afternoonEnd: '19:00',
      slotDurationMinutes: 30,
    },
    {
      dayOfWeek: 6,
      label: 'Samedi',
      enabled: true,
      morningStart: '09:00',
      morningEnd: '13:00',
      afternoonStart: '',
      afternoonEnd: '',
      slotDurationMinutes: 30,
    },
    {
      dayOfWeek: 0,
      label: 'Dimanche',
      enabled: false,
      morningStart: '',
      morningEnd: '',
      afternoonStart: '',
      afternoonEnd: '',
      slotDurationMinutes: 30,
    },
  ],
  blockedSlots: [],
  absences: [],
  appointments: [
    {
      id: 'apt-demo-1',
      reference: 'RDV-2026-1082',
      serviceId: 'srv-bilan-initial',
      serviceName: 'Première séance & Bilan diagnostic kinésithérapique',
      date: getNextWorkingDayIso(1),
      time: '09:30',
      lastName: 'Dupont',
      firstName: 'Camille',
      phone: '06 12 34 56 78',
      email: 'c.dupont@exemple.fr',
      motif: 'Bilan initial - Gêne cervicale et épaule droite',
      optionalMessage: 'Ordonnance médicale prescrite par le Dr. Martin',
      status: 'confirmed',
      notificationPrefs: {
        emailConfirmation: true,
        whatsappSms: true,
        reminder24h: true,
      },
      notificationStatus: {
        emailStatus: 'sent_simulated',
        whatsappStatus: 'queued_simulated',
        reminderScheduledFor: `24h avant le ${getNextWorkingDayIso(1)} à 09:30`,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-demo-2',
      reference: 'RDV-2026-1083',
      serviceId: 'srv-reeducation-rachis',
      serviceName: 'Rééducation Dos, Cou & Posture',
      date: getNextWorkingDayIso(2),
      time: '14:30',
      lastName: 'Moreau',
      firstName: 'Thomas',
      phone: '06 98 76 54 32',
      email: 'thomas.m@exemple.fr',
      motif: 'Lombalgie suite à effort sportif',
      optionalMessage: '',
      status: 'pending',
      notificationPrefs: {
        emailConfirmation: true,
        whatsappSms: false,
        reminder24h: true,
      },
      notificationStatus: {
        emailStatus: 'sent_simulated',
        whatsappStatus: 'disabled',
        reminderScheduledFor: `24h avant le ${getNextWorkingDayIso(2)} à 14:30`,
      },
      createdAt: new Date().toISOString(),
    },
  ],
  contactRequests: [],
  testimonials: [
    {
      id: 'testi-1',
      patientInitialsOrName: 'Claire V.',
      consultationContext: 'Rééducation post-opératoire de l’épaule',
      comment:
        'Un immense merci à la cheffe du cabinet Kiné Plus pour son écoute, sa patience et son professionnalisme. En 8 semaines, j’ai retrouvé une mobilité que je pensais perdue.',
      dateLabel: 'Septembre 2026',
      verifiedByClinic: true,
    },
    {
      id: 'testi-2',
      patientInitialsOrName: 'Julien B.',
      consultationContext: 'Suivi sportif & Rééducation cheville',
      comment:
        'Le plateau technique de Kiné Plus est remarquable. Des exercices très précis, un accueil toujours souriant et une prise de rendez-vous en ligne ultra simple.',
      dateLabel: 'Août 2026',
      verifiedByClinic: true,
    },
  ],
};

export function suggestServiceFromPreEvaluation(
  bodyArea: PreEvalBodyArea,
  _duration: PreEvalDuration,
  mainIssue: PreEvalMainIssue,
  mainGoal: PreEvalMainGoal,
  services: ClinicDatabase['services']
): { serviceId: string; serviceName: string } {
  const activeServices = services.filter((s) => s.active);
  const fallback = activeServices[0] || services[0];

  if (
    mainIssue === 'Rééducation après opération' ||
    mainIssue === 'Récupération après une blessure' ||
    mainGoal === 'Récupérer après une blessure'
  ) {
    const found = activeServices.find((s) => s.id === 'srv-post-blessure-operation');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  if (
    mainIssue === 'Prévention' ||
    mainGoal === 'Reprendre une activité physique'
  ) {
    const found = activeServices.find((s) => s.id === 'srv-sport-reprise');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  if (bodyArea === 'Dos' || bodyArea === 'Cou') {
    const found = activeServices.find((s) => s.id === 'srv-reeducation-rachis');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  if (
    bodyArea === 'Épaule' ||
    bodyArea === 'Genou' ||
    bodyArea === 'Hanche' ||
    bodyArea === 'Cheville/pied' ||
    bodyArea === 'Bras/main'
  ) {
    const found = activeServices.find((s) => s.id === 'srv-membres-articulations');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  return {
    serviceId: fallback ? fallback.id : 'srv-bilan-initial',
    serviceName: fallback ? fallback.name : 'Première séance & Bilan kinésithérapique',
  };
}

function parseTimeToMinutes(hhmm: string): number | null {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatMinutesToTime(totalMinutes: number): string {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export interface SlotAvailabilityInfo {
  time: string;
  available: boolean;
  reason?: 'booked' | 'blocked' | 'absence' | 'closed';
}

export function computeSlotsForDate(
  dateStr: string,
  db: ClinicDatabase
): {
  isClosedDay: boolean;
  absenceReason?: string;
  slots: SlotAvailabilityInfo[];
} {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { isClosedDay: true, slots: [] };
  }

  // Check absence periods
  const activeAbsence = db.absences.find(
    (abs) => dateStr >= abs.startDate && dateStr <= abs.endDate
  );
  if (activeAbsence) {
    return {
      isClosedDay: true,
      absenceReason: activeAbsence.reason || 'Période de fermeture / absence du cabinet Kiné Plus',
      slots: [],
    };
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dow = dateObj.getDay();

  const dayConfig = db.weeklySchedule.find((s) => s.dayOfWeek === dow);
  if (!dayConfig || !dayConfig.enabled) {
    return { isClosedDay: true, slots: [] };
  }

  const step = dayConfig.slotDurationMinutes || 30;
  const rawTimes: string[] = [];

  const mStart = parseTimeToMinutes(dayConfig.morningStart);
  const mEnd = parseTimeToMinutes(dayConfig.morningEnd);
  if (mStart !== null && mEnd !== null && mEnd > mStart) {
    for (let t = mStart; t + step <= mEnd; t += step) {
      rawTimes.push(formatMinutesToTime(t));
    }
  }

  const aStart = parseTimeToMinutes(dayConfig.afternoonStart);
  const aEnd = parseTimeToMinutes(dayConfig.afternoonEnd);
  if (aStart !== null && aEnd !== null && aEnd > aStart) {
    for (let t = aStart; t + step <= aEnd; t += step) {
      rawTimes.push(formatMinutesToTime(t));
    }
  }

  const bookedTimes = new Set(
    db.appointments
      .filter((apt) => apt.date === dateStr && apt.status !== 'cancelled')
      .map((apt) => apt.time)
  );

  const blockedTimes = new Set(
    db.blockedSlots.filter((blk) => blk.date === dateStr).map((blk) => blk.time)
  );

  const slots: SlotAvailabilityInfo[] = rawTimes.map((time) => {
    if (bookedTimes.has(time)) {
      return { time, available: false, reason: 'booked' };
    }
    if (blockedTimes.has(time)) {
      return { time, available: false, reason: 'blocked' };
    }
    return { time, available: true };
  });

  return {
    isClosedDay: slots.length === 0,
    slots,
  };
}

export function formatFrenchDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortFrenchDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}
