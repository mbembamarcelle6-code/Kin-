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
    tagline: 'Votre santé, votre mobilité, notre priorité.',
    shortPresentation:
      'Cabinet de kinésithérapie dirigé par Chef Marcelle Mbemba. Écoute, Soin, Rééducation, Récupération : nous vous accompagnons vers une meilleure mobilité au quotidien. Profitez actuellement de notre séance en promotion à 5 500 FCFA.',
    address: 'Cabinet de Kinésithérapie Kiné Plus',
    cityPostal: 'Brazzaville / Pointe-Noire',
    accessNotes:
      'Cabinet accessible en rez-de-chaussée pour personnes à mobilité réduite. Accès facile en taxi et transport.',
    phoneDisplay: '06 85 63 21 7',
    phoneDial: '068563217',
    whatsappNumber: '06 85 63 21 7',
    emailContact: 'mbembamarcelle6@gmail.com',
    openingHoursSummary: 'Lundi – Vendredi : 08h00 – 19h00 · Samedi : 08h30 – 13h30',
    practitioners: [
      {
        id: 'prac-marcelle-mbemba',
        name: 'Chef Marcelle Mbemba',
        role: 'Cheffe du cabinet Kiné Plus & Masseur-Kinésithérapeute',
        rpps: 'Kinésithérapeute Certifiée · Directrice du cabinet Kiné Plus',
        bio: 'Fondatrice et cheffe du cabinet Kiné Plus. Passionnée par la rééducation fonctionnelle, le soulagement durable des douleurs et l’accompagnement personnalisé des patients pour bouger mieux et vivre mieux.',
        photoUrl: '/src/assets/images/marcelle_mbemba_cheffe_1790939960046.jpg',
        isHead: true,
      },
      {
        id: 'prac-equipe-kine',
        name: 'Équipe Soins Kiné Plus',
        role: 'Masseurs-Kinésithérapeutes Qualifiés',
        rpps: 'Praticiens Kiné Plus',
        bio: 'Équipe dévouée aux soins manuels, à la réhabilitation posturale et au renforcement de la mobilité.',
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
      id: 'srv-kine-promo',
      code: '01',
      name: 'Séance de Kinésithérapie Complète (Offre Promotionnelle)',
      description:
        'Bilan, soulagement des douleurs et rééducation personnalisée par Chef Marcelle Mbemba et son équipe. Tarif promotionnel exceptionnel.',
      durationLabel: '45 min',
      durationMinutes: 45,
      price: '5 500 FCFA (Promotion)',
      active: true,
      tags: ['Promotion', 'Bilan', 'Soin complet'],
    },
    {
      id: 'srv-dos-lombaires',
      code: '02',
      name: 'Rééducation Dos & Lombaires',
      description:
        'Prise en charge ciblée des personnes souffrant de douleurs du dos, lombalgies aiguës ou chroniques, sciatiques et raideurs musculaires.',
      durationLabel: '30 à 45 min',
      durationMinutes: 45,
      price: '5 500 FCFA',
      active: true,
      tags: ['Dos', 'Lombaires', 'Rachis'],
    },
    {
      id: 'srv-cervicales-tensions',
      code: '03',
      name: 'Douleurs Cervicales & Tensions Musculaires',
      description:
        'Soulagement des torticolis, névralgies cervico-brachiales, contractures trapèzes et tensions de la nuque.',
      durationLabel: '30 min',
      durationMinutes: 30,
      price: '5 500 FCFA',
      active: true,
      tags: ['Cou', 'Cervicales', 'Tensions'],
    },
    {
      id: 'srv-douleurs-articulaires',
      code: '04',
      name: 'Douleurs Articulaires (Épaule, Genou, Hanche, Cheville)',
      description:
        'Prise en charge des raideurs et gênes articulaires, tendinopathies, arthrose et réhabilitation de la mobilité.',
      durationLabel: '30 à 45 min',
      durationMinutes: 45,
      price: '5 500 FCFA',
      active: true,
      tags: ['Articulations', 'Épaule', 'Genou', 'Hanche', 'Cheville'],
    },
    {
      id: 'srv-post-blessure-trauma',
      code: '05',
      name: 'Rééducation après Blessure, Traumatisme ou Opération',
      description:
        'Accompagnement post-traumatique (entorses, fractures) et post-chirurgie pour restaurer progressivement la mobilité et la force.',
      durationLabel: '45 min',
      durationMinutes: 45,
      price: '5 500 FCFA',
      active: true,
      tags: ['Blessure', 'Chirurgie', 'Traumatisme'],
    },
    {
      id: 'srv-sport-mobilite',
      code: '06',
      name: 'Sportifs & Récupération de l’Autonomie',
      description:
        'Programme dynamique pour sportifs après blessure et personnes souhaitant retrouver souplesse, mobilité et liberté de mouvement.',
      durationLabel: '45 min',
      durationMinutes: 45,
      price: '5 500 FCFA',
      active: true,
      tags: ['Sportifs', 'Mobilité', 'Autonomie'],
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
      serviceId: 'srv-kine-promo',
      serviceName: 'Séance de Kinésithérapie Complète (Offre Promotionnelle)',
      date: getNextWorkingDayIso(1),
      time: '09:30',
      lastName: 'Dupont',
      firstName: 'Camille',
      phone: '06 12 34 56 78',
      email: 'c.dupont@exemple.fr',
      motif: 'Bilan initial - Gêne cervicale et épaule droite',
      optionalMessage: 'Ordonnance médicale prescrite',
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
      serviceId: 'srv-dos-lombaires',
      serviceName: 'Rééducation Dos & Lombaires',
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
      consultationContext: 'Rééducation de l’épaule',
      comment:
        'Un immense merci à Chef Marcelle Mbemba pour son écoute, sa patience et son professionnalisme. En quelques séances, j’ai retrouvé ma mobilité et mon autonomie.',
      dateLabel: 'Septembre 2026',
      verifiedByClinic: true,
    },
    {
      id: 'testi-2',
      patientInitialsOrName: 'Julien B.',
      consultationContext: 'Suivi sportif & Rééducation lombaire',
      comment:
        'Le cabinet Kiné Plus est remarquable. Des exercices très précis, un accueil chaleureux et une prise de rendez-vous en ligne ultra simple.',
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
    const found = activeServices.find((s) => s.id === 'srv-post-blessure-trauma');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  if (
    mainIssue === 'Prévention' ||
    mainGoal === 'Reprendre une activité physique'
  ) {
    const found = activeServices.find((s) => s.id === 'srv-sport-mobilite');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  if (bodyArea === 'Dos') {
    const found = activeServices.find((s) => s.id === 'srv-dos-lombaires');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  if (bodyArea === 'Cou') {
    const found = activeServices.find((s) => s.id === 'srv-cervicales-tensions');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  if (
    bodyArea === 'Épaule' ||
    bodyArea === 'Genou' ||
    bodyArea === 'Hanche' ||
    bodyArea === 'Cheville/pied' ||
    bodyArea === 'Bras/main'
  ) {
    const found = activeServices.find((s) => s.id === 'srv-douleurs-articulaires');
    if (found) return { serviceId: found.id, serviceName: found.name };
  }

  return {
    serviceId: fallback ? fallback.id : 'srv-kine-promo',
    serviceName: fallback ? fallback.name : 'Séance de Kinésithérapie Complète',
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
