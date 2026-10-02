import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  HeartPulse,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCheck,
} from 'lucide-react';
import {
  Appointment,
  AuthUser,
  ClinicDatabase,
  ContactRequest,
  PreEvaluationResult,
} from './types/clinic';
import { INITIAL_CLINIC_DB } from './data/initialClinicData';
import { PreEvaluationSection } from './components/PreEvaluationSection';
import { BookingSection } from './components/BookingSection';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalPrivacyModal } from './components/LegalPrivacyModal';
import { MultiAuthModal } from './components/MultiAuthModal';

const CHEFFE_PHOTO_PATH = '/src/assets/images/marcelle_mbemba_cheffe_1790939960046.jpg';
const HERO_IMAGE_PATH = '/src/assets/images/hero_kine_plus_1790937974496.jpg';
const GYM_IMAGE_PATH = '/src/assets/images/gym_kine_plus_1790937985013.jpg';
const SOIN_IMAGE_PATH = '/src/assets/images/soin_kine_plus_1790937995483.jpg';

const TARGET_AUDIENCES = [
  {
    title: 'Douleurs du dos & lombaires',
    desc: 'Lombalgies, sciatiques, hernies, blocages et tensions du bas du dos.',
  },
  {
    title: 'Douleurs cervicales & tensions',
    desc: 'Torticolis, contractures trapèzes, céphalées de tension et raideurs de la nuque.',
  },
  {
    title: 'Douleurs articulaires',
    desc: 'Épaules, genoux, hanches, chevilles, coudes et poignets (arthrose, tendinites).',
  },
  {
    title: 'Rééducation après blessure ou trauma',
    desc: 'Entorses, déchirures musculaires, luxations et chocs traumatiques récents.',
  },
  {
    title: 'Rééducation après chirurgie',
    desc: 'Suivi post-opératoire (prothèses, ligaments croisés, sutures tendineuses).',
  },
  {
    title: 'Difficultés de mobilité & mouvement',
    desc: 'Perte d’amplitude, raideur matinale, difficulté à la marche ou aux gestes quotidiens.',
  },
  {
    title: 'Sportifs & récupération',
    desc: 'Optimisation de la récupération, prévention des blessures et reprise sécurisée.',
  },
  {
    title: 'Souplesse & autonomie',
    desc: 'Retrouver progressivement équilibre, confiance et aisance corporelle.',
  },
];

const GALLERY_IMAGES = [
  {
    src: CHEFFE_PHOTO_PATH,
    title: 'Chef Marcelle Mbemba',
    caption: 'Kinésithérapeute & Directrice du cabinet Kiné Plus. Écoute, Soin, Rééducation, Récupération.',
  },
  {
    src: GYM_IMAGE_PATH,
    title: 'Plateau technique & Rééducation fonctionnelle',
    caption: 'Espace équipé pour le renforcement musculaire, la proprioception et la reprise d’activité.',
  },
  {
    src: SOIN_IMAGE_PATH,
    title: 'Salles de consultation individuelles',
    caption: 'Cadre calme et confidentiel pour votre bilan initial et vos séances de thérapie manuelle.',
  },
];

const PATIENT_JOURNEY_STEPS = [
  {
    num: '01',
    title: 'Vous prenez rendez-vous',
    description:
      'Choisissez votre créneau en ligne ou réalisez la pré-évaluation d’orientation en 1 minute.',
  },
  {
    num: '02',
    title: 'Vous êtes accueilli chez Kiné Plus',
    description:
      'Chef Marcelle Mbemba et son équipe vous reçoivent dans un cadre chaleureux et moderne.',
  },
  {
    num: '03',
    title: 'Bilan complet par Chef Marcelle Mbemba',
    description:
      'Un examen attentif de votre posture, souplesse et douleur pour cibler la source du problème.',
  },
  {
    num: '04',
    title: 'Programme de soins sur-mesure',
    description:
      'Thérapie manuelle, mobilisations douces et exercices personnalisés pour soulager rapidement.',
  },
  {
    num: '05',
    title: 'Bougez mieux, vivez mieux !',
    description:
      'Suivi régulier jusqu’à la restauration complète de votre confort et de votre autonomie.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Qui est Chef Marcelle Mbemba ?',
    answer:
      'Chef Marcelle Mbemba est la cheffe et directrice du cabinet Kiné Plus. Masseur-Kinésithérapeute expérimentée, elle supervise l’ensemble des bilans et des protocoles de rééducation avec une exigence de soin et d’écoute personnalisée.',
  },
  {
    question: 'En quoi consiste la promotion à 5 500 FCFA ?',
    answer:
      'Actuellement, le cabinet Kiné Plus propose la séance complète de kinésithérapie au tarif promotionnel exceptionnel de 5 500 FCFA pour permettre à chacun de bénéficier d’un soin de qualité.',
  },
  {
    question: 'Quelles sont les méthodes de connexion disponibles ?',
    answer:
      'Vous pouvez vous connecter facilement en 1 clic avec votre compte Google, avec votre compte Apple ID, ou par E-mail.',
  },
  {
    question: 'Comment contacter directement Chef Marcelle Mbemba ?',
    answer:
      'Vous pouvez joindre directement le cabinet au 06 85 63 21 7, par WhatsApp ou par e-mail à mbembamarcelle6@gmail.com.',
  },
  {
    question: 'Faut-il une ordonnance médicale pour la séance ?',
    answer:
      'Si vous possédez une ordonnance de votre médecin traitant ou chirurgien, apportez-la lors de votre premier rendez-vous pour une prise en charge optimale.',
  },
];

export function App() {
  const [clinicData, setClinicData] = useState<ClinicDatabase>(INITIAL_CLINIC_DB);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    INITIAL_CLINIC_DB.services[0]?.id || ''
  );
  const [preEvaluationResult, setPreEvaluationResult] = useState<PreEvaluationResult | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mapMode, setMapMode] = useState<'plan' | 'itineraire' | 'acces'>('plan');

  // Contact form
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactFeedback, setContactFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'admin' | 'patient'>('admin');
  const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('kine_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('kine_auth_user');
    sessionStorage.removeItem('kine_admin_token');
    setLoggedInUser(null);
    setIsAdminView(false);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setLoggedInUser(user);
    if (
      user.role.includes('Cheffe') ||
      user.email.toLowerCase().includes('mbemba') ||
      user.email.toLowerCase().includes('admin') ||
      user.email.toLowerCase() === 'moussietoudorlon@gmail.com'
    ) {
      setIsAdminView(true);
    }
  };

  useEffect(() => {
    fetch('/api/public/clinic')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.settings && Array.isArray(data.services)) {
          setClinicData((prev) => ({
            ...prev,
            settings: {
              ...prev.settings,
              ...data.settings,
              cabinetName: 'Kiné Plus',
              phoneDisplay: '06 85 63 21 7',
              phoneDial: '068563217',
              whatsappNumber: '06 85 63 21 7',
              emailContact: 'mbembamarcelle6@gmail.com',
            },
            services: data.services,
            weeklySchedule: data.weeklySchedule || prev.weeklySchedule,
            blockedSlots: data.blockedSlots || prev.blockedSlots,
            absences: data.absences || prev.absences,
            testimonials: data.testimonials || prev.testimonials,
            appointments: data.appointments || prev.appointments,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCompletePreEvaluation = (result: PreEvaluationResult) => {
    setPreEvaluationResult(result);
    setSelectedServiceId(result.suggestedServiceId);
    scrollToSection('reservation');
  };

  const handleSelectServiceAndBook = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    scrollToSection('reservation');
  };

  const handleAppointmentCreated = (newApt: Appointment) => {
    setClinicData((prev) => ({
      ...prev,
      appointments: [newApt, ...prev.appointments],
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFeedback(null);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactFeedback({
        type: 'error',
        text: 'Veuillez renseigner votre nom, votre e-mail et votre message.',
      });
      return;
    }

    const newReq: ContactRequest = {
      id: `msg-${Date.now()}`,
      fullName: contactName.trim(),
      phone: contactPhone.trim(),
      email: contactEmail.trim(),
      subject: contactSubject.trim() || 'Demande de contact Kiné Plus',
      message: contactMessage.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      });
    } catch {}

    setClinicData((prev) => ({
      ...prev,
      contactRequests: [newReq, ...prev.contactRequests],
    }));
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');
    setContactFeedback({
      type: 'success',
      text: 'Votre message a bien été transmis à Chef Marcelle Mbemba.',
    });
  };

  if (isAdminView) {
    return (
      <AdminDashboard
        clinicData={clinicData}
        onUpdateClinicData={setClinicData}
        onBackToPublicSite={() => setIsAdminView(false)}
      />
    );
  }

  const activeServices = clinicData.services.filter((s) => s.active);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 md:pb-0">
      {/* ==================================================================== */}
      {/* PROMOTIONAL TOP TICKER                                               */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-teal-800 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>
          <strong>PROMOTION EXCEPTIONNELLE :</strong> Séance de kinésithérapie complète à seulement{' '}
          <span className="font-bold underline">5 500 FCFA</span> avec Chef Marcelle Mbemba !
        </span>
        <button
          type="button"
          onClick={() => scrollToSection('reservation')}
          className="ml-2 bg-white text-teal-800 font-bold px-2.5 py-0.5 rounded-full text-[11px] hover:bg-teal-50 cursor-pointer"
        >
          Profiter de l’offre
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TOP NAVIGATION BAR                                                   */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a
          href="#accueil"
          className="text-lg sm:text-xl font-bold tracking-tight text-teal-800 dark:text-teal-400 flex items-center gap-2"
        >
          <HeartPulse className="w-5 h-5 text-teal-700" />
          <span>Kiné Plus</span>
        </a>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#pre-evaluation" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Pré-évaluation
          </a>
          <a href="#cheffe" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Chef Marcelle Mbemba
          </a>
          <a href="#prestations" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Prestations (5 500 FCFA)
          </a>
          <a href="#pour-qui" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Pour qui ?
          </a>
          <a href="#contact" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
            aria-label="Basculer thème"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Multi-provider Auth Trigger (Google, Apple, Email) */}
          {loggedInUser ? (
            <div className="flex items-center gap-2">
              {loggedInUser.role.includes('Cheffe') ||
              loggedInUser.email.toLowerCase().includes('mbemba') ||
              loggedInUser.email.toLowerCase() === 'moussietoudorlon@gmail.com' ? (
                <button
                  type="button"
                  onClick={() => setIsAdminView(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-300 dark:border-teal-700 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-100 cursor-pointer shadow-2xs"
                  title="Accéder au tableau de bord de gestion"
                >
                  <img
                    src={CHEFFE_PHOTO_PATH}
                    alt="Chef Marcelle Mbemba"
                    className="w-5 h-5 rounded-full object-cover border border-teal-600"
                  />
                  <span>Espace Chef Marcelle Mbemba</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <span className="font-medium truncate max-w-[130px]">
                    {loggedInUser.name}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 cursor-pointer"
                title="Se déconnecter"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthDefaultRole('admin');
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shadow-2xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Connexion (Google · Apple · E-mail)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => scrollToSection('reservation')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Prendre RDV</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 1. HERO SECTION                                                      */}
      {/* ==================================================================== */}
      <section
        id="accueil"
        className="pt-8 pb-16 md:pt-14 md:pb-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cabinet Kiné Plus · Dirigé par Chef Marcelle Mbemba</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Votre santé, votre mobilité, notre priorité.
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400">
                <span>Écoute</span>
                <span>•</span>
                <span>Soin</span>
                <span>•</span>
                <span>Rééducation</span>
                <span>•</span>
                <span>Récupération</span>
              </div>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Sous la direction attentionnée de <strong>Chef Marcelle Mbemba</strong>, le cabinet{' '}
                <strong>Kiné Plus</strong> vous accueille pour soulager vos douleurs articulaires et
                musculaires, restaurer votre mobilité et améliorer votre qualité de vie.
              </p>

              {/* Promo Callout Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-teal-500/5 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                    Tarif Spécial Promotionnel
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    5 500 FCFA{' '}
                    <span className="text-xs font-normal text-slate-500">/ la séance de kinésithérapie</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('reservation')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Réserver à 5 500 FCFA
                </button>
              </div>

              {/* Direct CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => scrollToSection('reservation')}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Prendre rendez-vous</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('pre-evaluation')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-teal-700 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Faire une pré-évaluation</span>
                </button>
              </div>

              {/* Direct Contacts */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <a
                  href="tel:068563217"
                  className="inline-flex items-center gap-1.5 text-teal-800 dark:text-teal-300 hover:underline font-bold"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>RDV par téléphone : 06 85 63 21 7</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://wa.me/242068563217"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp direct</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="mailto:mbembamarcelle6@gmail.com"
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  <span>mbembamarcelle6@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Right: Portrait of Chef Marcelle Mbemba */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[360px] aspect-square rounded-3xl overflow-hidden border-2 border-teal-600/30 shadow-xl">
                <img
                  src={CHEFFE_PHOTO_PATH}
                  alt="Chef Marcelle Mbemba - Kiné Plus"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-5 text-white">
                  <div className="font-bold text-base">Chef Marcelle Mbemba</div>
                  <div className="text-xs text-teal-300">Kinésithérapeute · Directrice Kiné Plus</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    « Bougez mieux, vivez mieux ! »
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars from flyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold mb-2">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Soulage la douleur</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Action ciblée sur les contractures, inflammations et blocages.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold mb-2">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Restaure la mobilité</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Récupération progressive de l’amplitude articulaire et de la souplesse.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold mb-2">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Améliore la qualité de vie</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Retrouvez l’aisance dans votre travail, vos loisirs et votre quotidien.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold mb-2">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Accompagnement personnalisé</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Programme spécifique adapté à vos antécédents et à vos objectifs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. PRÉ-ÉVALUATION INTELLIGENTE                                       */}
      {/* ==================================================================== */}
      <PreEvaluationSection
        services={activeServices}
        onCompletePreEvaluation={handleCompletePreEvaluation}
      />

      {/* ==================================================================== */}
      {/* SECTION « POUR QUI ? » (EXTRAITE DU FLYER DE CHEF MARCELLE MBEMBA)   */}
      {/* ==================================================================== */}
      <section
        id="pour-qui"
        className="py-16 md:py-20 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              Pour qui ?
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cette prise en charge s’adresse à toutes les personnes qui souhaitent :
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Chef Marcelle Mbemba adapte chaque protocole en fonction de votre état physique et de votre rythme.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TARGET_AUDIENCES.map((item, idx) => (
              <div
                key={item.title}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs hover:border-teal-600 transition-colors"
              >
                <div className="text-xs font-mono font-bold text-teal-700">0{idx + 1}</div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <span className="text-lg font-bold text-teal-800 dark:text-teal-300 italic">
              « Bougez mieux, vivez mieux ! »
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SERVICES / PRESTATIONS EN PROMOTION (5 500 FCFA)                  */}
      {/* ==================================================================== */}
      <section
        id="prestations"
        className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                Nos Consultations & Soins
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Prestations assurées par Chef Marcelle Mbemba
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Bénéficiez du tarif promotionnel à <strong>5 500 FCFA</strong> sur les consultations au cabinet.
              </p>
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('reservation')}
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Voir les créneaux disponibles →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeServices.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 p-6 flex flex-col justify-between gap-6 hover:shadow-xs transition-shadow"
              >
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                    Soin {service.code}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Durée : {service.durationLabel}</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {service.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectServiceAndBook(service.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Réserver ce soin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. EXPÉRIENCE PATIENT : « VOTRE PARCOURS »                           */}
      {/* ==================================================================== */}
      <section
        id="parcours"
        className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              Votre Parcours
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Votre parcours avec Chef Marcelle Mbemba
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Prenez rendez-vous et commencez votre parcours vers une meilleure mobilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {PATIENT_JOURNEY_STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5 shadow-2xs"
              >
                <div className="text-sm font-mono font-bold text-teal-700 dark:text-teal-400">
                  {step.num}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. RÉSERVATION DE RENDEZ-VOUS                                        */}
      {/* ==================================================================== */}
      <BookingSection
        clinicData={clinicData}
        selectedServiceId={selectedServiceId}
        onSelectServiceId={setSelectedServiceId}
        preEvaluation={preEvaluationResult}
        onClearPreEvaluation={() => setPreEvaluationResult(null)}
        onAppointmentCreated={handleAppointmentCreated}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        currentUser={loggedInUser}
        onOpenAuthModal={(role) => {
          setAuthDefaultRole(role || 'patient');
          setIsAuthModalOpen(true);
        }}
        onUserAuthenticated={handleAuthSuccess}
        onLogoutUser={handleLogout}
      />

      {/* ==================================================================== */}
      {/* GALERIE DU CABINET KINÉ PLUS                                         */}
      {/* ==================================================================== */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              Galerie & Cabinet
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Chef Marcelle Mbemba & Le Cabinet Kiné Plus
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GALLERY_IMAGES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden flex flex-col shadow-xs"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Témoignages de nos patients
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {clinicData.testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 space-y-2"
                >
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    « {t.comment} »
                  </p>
                  <div className="text-xs text-slate-500 font-medium">
                    <strong>{t.patientInitialsOrName}</strong> · {t.consultationContext} ({t.dateLabel})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FAQ INTERACTIVE                                                      */}
      {/* ==================================================================== */}
      <section className="py-16 md:py-20 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              Questions Fréquentes
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Tout savoir avant votre séance avec Chef Marcelle Mbemba
            </h2>
          </div>

          <div className="divide-y divide-slate-200 dark:border-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ACCÈS, COORDONNÉES ET CONTACT DIRECT                                 */}
      {/* ==================================================================== */}
      <section
        id="contact"
        className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left coordinates & buttons */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                  Coordonnées directes
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Contacter Chef Marcelle Mbemba
                </h2>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Rendez-vous téléphonique</div>
                    <a href="tel:068563217" className="text-teal-700 font-bold text-sm hover:underline mt-0.5 block">
                      06 85 63 21 7
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">E-mail direct</div>
                    <a
                      href="mailto:mbembamarcelle6@gmail.com"
                      className="text-teal-700 underline mt-0.5 block"
                    >
                      mbembamarcelle6@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Horaires d’ouverture</div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {clinicData.settings.openingHoursSummary}
                    </div>
                  </div>
                </div>

                {/* Direct 1-click calls */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <a
                    href="tel:068563217"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appeler le 06 85 63 21 7</span>
                  </a>

                  <a
                    href="https://wa.me/242068563217"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp au 06 85 63 21 7</span>
                  </a>
                </div>
              </div>

              {/* Map & access card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold">Repères d’accès Kiné Plus</span>
                  <div className="flex gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-lg">
                    {(['plan', 'itineraire', 'acces'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMapMode(m)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                          mapMode === m ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {m === 'plan' ? 'Plan' : m === 'itineraire' ? 'Transports' : 'Accès PMR'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-slate-100/60 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300">
                  {mapMode === 'plan' && (
                    <p>
                      <strong>Cabinet Kiné Plus :</strong> Établissement accessible, dirigé par Chef Marcelle Mbemba. Prise en charge sur rendez-vous au <strong>06 85 63 21 7</strong>.
                    </p>
                  )}
                  {mapMode === 'itineraire' && (
                    <p>
                      <strong>Transports :</strong> Accessible par les grands axes et stations de transport en commun. Taxis et véhicules disponibles.
                    </p>
                  )}
                  {mapMode === 'acces' && (
                    <p>
                      <strong>Accessibilité :</strong> Accès de plain-pied aménagé pour les personnes à mobilité réduite (PMR) et patients en rééducation.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-6">
              <form
                onSubmit={handleContactSubmit}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 p-6 sm:p-8 space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Envoyer un message à Chef Marcelle Mbemba
                  </h3>
                  <p className="text-xs text-slate-500">
                    Posez votre question ou demandez conseil à la cheffe du cabinet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium mb-1">Nom et Prénom *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Votre nom complet"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="06 85 63 21 7"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium mb-1">Adresse e-mail *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Objet</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="Renseignement, mal de dos..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-medium mb-1">Votre message *</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Détaillez vos douleurs ou votre demande..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>

                {contactFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      contactFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {contactFeedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer mon message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FOOTER                                                               */}
      {/* ==================================================================== */}
      <footer className="py-12 bg-[#F8FAFC] dark:bg-slate-950 text-xs text-slate-500">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Kiné Plus</span> · Dirigé par{' '}
            <strong>Chef Marcelle Mbemba</strong> · RDV :{' '}
            <a href="tel:068563217" className="underline font-bold text-slate-800 dark:text-slate-200">
              06 85 63 21 7
            </a>{' '}
            · E-mail :{' '}
            <a href="mailto:mbembamarcelle6@gmail.com" className="underline font-bold text-slate-800 dark:text-slate-200">
              mbembamarcelle6@gmail.com
            </a>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsLegalModalOpen(true)}
              className="underline cursor-pointer"
            >
              Mentions Légales & Confidentialité
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setAuthDefaultRole('admin');
                setIsAuthModalOpen(true);
              }}
              className="underline cursor-pointer font-semibold text-teal-700"
            >
              Espace Praticien (Google / Apple / Mail)
            </button>
          </div>
        </div>
      </footer>

      {/* Floating button on mobile */}
      <div className="fixed bottom-3 inset-x-4 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => scrollToSection('reservation')}
          className="w-full h-12 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Prendre rendez-vous · 5 500 FCFA</span>
        </button>
      </div>

      {/* Multi-provider Auth Modal (Google, Apple, Mail) */}
      <MultiAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultRole={authDefaultRole}
      />

      <LegalPrivacyModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        settings={clinicData.settings}
      />
    </div>
  );
}

export default App;

