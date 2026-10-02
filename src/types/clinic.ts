export type PreEvalBodyArea =
  | 'Dos'
  | 'Cou'
  | 'Épaule'
  | 'Genou'
  | 'Hanche'
  | 'Cheville/pied'
  | 'Bras/main'
  | 'Autre';

export type PreEvalDuration =
  | 'Depuis quelques jours'
  | 'Quelques semaines'
  | 'Plusieurs mois'
  | 'Depuis longtemps';

export type PreEvalMainIssue =
  | 'Douleur'
  | 'Difficulté à bouger'
  | 'Récupération après une blessure'
  | 'Rééducation après opération'
  | 'Perte de mobilité'
  | 'Prévention'
  | 'Autre';

export type PreEvalMainGoal =
  | 'Réduire une gêne'
  | 'Retrouver ma mobilité'
  | 'Récupérer après une blessure'
  | 'Reprendre une activité physique'
  | 'Autre';

export interface PreEvaluationResult {
  bodyArea: PreEvalBodyArea;
  duration: PreEvalDuration;
  mainIssue: PreEvalMainIssue;
  mainGoal: PreEvalMainGoal;
  suggestedServiceId: string;
  suggestedServiceName: string;
  completedAt: string;
}

export interface Practitioner {
  id: string;
  name: string;
  role: string;
  rpps: string;
  bio: string;
  photoUrl?: string;
  isHead?: boolean;
}

export interface ClinicService {
  id: string;
  code: string;
  name: string;
  description: string;
  durationLabel: string;
  durationMinutes: number;
  price: string;
  active: boolean;
  tags: string[];
}

export interface DaySchedule {
  dayOfWeek: number; // 1 = Lundi ... 6 = Samedi, 0 = Dimanche
  label: string;
  enabled: boolean;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  slotDurationMinutes: number;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: string;
}

export interface AbsencePeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  reference: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  motif: string;
  optionalMessage: string;
  preEvaluation?: PreEvaluationResult;
  status: AppointmentStatus;
  notificationPrefs: {
    emailConfirmation: boolean;
    whatsappSms: boolean;
    reminder24h: boolean;
  };
  notificationStatus: {
    emailStatus: 'sent_simulated' | 'pending_integration' | 'disabled';
    whatsappStatus: 'queued_simulated' | 'pending_integration' | 'disabled';
    reminderScheduledFor?: string;
  };
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
}

export interface VerifiedTestimonial {
  id: string;
  patientInitialsOrName: string;
  consultationContext: string;
  comment: string;
  dateLabel: string;
  verifiedByClinic: boolean;
}

export interface ClinicSettings {
  cabinetName: string;
  tagline: string;
  shortPresentation: string;
  address: string;
  cityPostal: string;
  accessNotes: string;
  phoneDisplay: string;
  phoneDial: string;
  whatsappNumber: string;
  emailContact: string;
  openingHoursSummary: string;
  practitioners: Practitioner[];
  integrations: {
    emailSystemConnected: boolean;
    whatsappSmsConnected: boolean;
    autoReminderConfigured: boolean;
  };
  evolutiveModules: {
    onlinePayment: boolean;
    teleconsultation: boolean;
    securePatientRecord: boolean;
    exercisePrograms: boolean;
    sessionTracking: boolean;
  };
}

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  provider: 'google' | 'apple' | 'email';
  avatarUrl?: string;
}

export interface ClinicDatabase {
  settings: ClinicSettings;
  services: ClinicService[];
  weeklySchedule: DaySchedule[];
  blockedSlots: BlockedSlot[];
  absences: AbsencePeriod[];
  appointments: Appointment[];
  contactRequests: ContactRequest[];
  testimonials: VerifiedTestimonial[];
}
