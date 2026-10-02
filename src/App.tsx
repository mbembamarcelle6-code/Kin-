import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Send,
  ShieldCheck,
  Sun,
  UserCheck,
} from 'lucide-react';
import {
  Appointment,
  ClinicDatabase,
  ContactRequest,
  PreEvaluationResult,
} from './types/clinic';
import { INITIAL_CLINIC_DB } from './data/initialClinicData';
import { PreEvaluationSection } from './components/PreEvaluationSection';
import { BookingSection } from './components/BookingSection';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalPrivacyModal } from './components/LegalPrivacyModal';

const CHEFFE_PHOTO_PATH = '/src/assets/images/cheffe_kine_plus_1790937963788.jpg';
const HERO_IMAGE_PATH = '/src/assets/images/hero_kine_plus_1790937974496.jpg';
const GYM_IMAGE_PATH = '/src/assets/images/gym_kine_plus_1790937985013.jpg';
const SOIN_IMAGE_PATH = '/src/assets/images/soin_kine_plus_1790937995483.jpg';

const GALLERY_IMAGES = [
  {
    src: CHEFFE_PHOTO_PATH,
    title: 'Mme. Dorlon — Cheffe du cabinet Kiné Plus',
    caption: 'Masseur-Kinésithérapeute Diplômée d’État et directrice des soins du cabinet Kiné Plus.',
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
      'Notre équipe vous reçoit à l’heure prévue dans un environnement moderne, lumineux et serein.',
  },
  {
    num: '03',
    title: 'Évaluation par la cheffe ou son équipe',
    description:
      'Un bilan fonctionnel minutieux est réalisé pour comprendre votre motif de consultation et vos objectifs.',
  },
  {
    num: '04',
    title: 'Programme de soins sur-mesure',
    description:
      'Un plan de rééducation progressif est établi combinant thérapie manuelle et exercices guidés.',
  },
  {
    num: '05',
    title: 'Votre mobilité est suivie',
    description:
      'Chaque séance consolide vos progrès jusqu’au rétablissement complet de votre autonomie.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Qui assure les soins au cabinet Kiné Plus ?',
    answer:
      'Les séances sont dirigées par Mme. Dorlon, cheffe du cabinet, ainsi que par son équipe de masseurs-kinésithérapeutes diplômés d’État. Chaque patient bénéficie d’un suivi rigoureux et personnalisé.',
  },
  {
    question: 'Comment contacter directement le cabinet ou la cheffe ?',
    answer:
      'Vous pouvez joindre le cabinet par téléphone au 06 85 63 21 70, par WhatsApp en un clic, ou par e-mail à moussietoudorlon@gmail.com.',
  },
  {
    question: 'Le questionnaire de pré-évaluation remplace-t-il une ordonnance ?',
    answer:
      'Non. Ce questionnaire vous guide vers la séance adéquate pour réserver votre créneau. Pensez à apporter votre ordonnance médicale le jour de votre première consultation.',
  },
  {
    question: 'Quels documents apporter lors du premier rendez-vous ?',
    answer:
      'Votre ordonnance médicale, votre carte Vitale, votre attestation de mutuelle et vos éventuels examens d’imagerie (radios, IRM, scanners). Prévoyez une tenue confortable.',
  },
  {
    question: 'Quels sont les tarifs et remboursements ?',
    answer:
      'Les soins prescrits sont conventionnés par la Sécurité Sociale et pris en charge selon les barèmes en vigueur avec votre mutuelle santé.',
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
              phoneDisplay: '06 85 63 21 70',
              phoneDial: '0685632170',
              whatsappNumber: '06 85 63 21 70',
              emailContact: 'moussietoudorlon@gmail.com',
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
      text: 'Votre message a bien été envoyé à la cheffe du cabinet Kiné Plus. Nous vous répondrons rapidement.',
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
      {/* TOP NAVIGATION BAR                                                   */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a
          href="#accueil"
          className="text-lg sm:text-xl font-bold tracking-tight text-teal-800 dark:text-teal-400"
        >
          Kiné Plus
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#pre-evaluation" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Pré-évaluation
          </a>
          <a href="#prestations" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Prestations
          </a>
          <a href="#cheffe" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            La Cheffe du Cabinet
          </a>
          <a href="#parcours" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Votre parcours
          </a>
          <a href="#contact" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">
            Accès & Contact
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

          <button
            type="button"
            onClick={() => setIsAdminView(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Espace Praticien</span>
          </button>

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
        className="pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-bold text-teal-700 dark:text-teal-400 tracking-wide uppercase">
                Cabinet Kiné Plus · Dirigé par Mme. Dorlon
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                Votre santé, votre mobilité : l’excellence en kinésithérapie
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Bienvenue au cabinet <strong>Kiné Plus</strong>. Sous la conduite de notre cheffe de
                cabinet et de ses praticiens qualifiés, retrouvez votre confort physique grâce à un
                diagnostic personnalisé, des soins manuels experts et une rééducation de pointe.
              </p>

              {/* Direct CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
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
              <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <a
                  href="tel:0685632170"
                  className="inline-flex items-center gap-1.5 text-teal-800 dark:text-teal-300 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler le 06 85 63 21 70</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://wa.me/33685632170"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp direct</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="mailto:moussietoudorlon@gmail.com"
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>moussietoudorlon@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <img
                  src={HERO_IMAGE_PATH}
                  alt="Séance de kinésithérapie au cabinet Kiné Plus"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-5 text-white">
                  <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                    Kiné Plus · Paris
                  </div>
                  <div className="text-sm font-semibold mt-0.5">
                    Séances attentives et plateau de rééducation de haute technicité
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">01</div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Prise de rendez-vous rapide
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Planning en temps réel pour choisir instantanément l’horaire qui vous convient le mieux.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">02</div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Suivi personnalisé
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Prise en charge individualisée avec bilan fonctionnel complet et exercices adaptés.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">03</div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Professionnels qualifiés
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dirigé par Mme. Dorlon, praticienne diplômée d’État inscrite à l’Ordre National.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">04</div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Cabinet accessible
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Situé à proximité immédiate des transports, en rez-de-chaussée accessible PMR.
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
      {/* FOCUS SUR LA CHEFFE DU CABINET                                       */}
      {/* ==================================================================== */}
      <section
        id="cheffe"
        className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Photo of the head physiotherapist */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <img
                  src={CHEFFE_PHOTO_PATH}
                  alt="Mme. Dorlon - Cheffe du cabinet Kiné Plus"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-white">
                  <div className="font-semibold text-sm">Mme. Dorlon</div>
                  <div className="text-xs text-teal-300">Cheffe du cabinet Kiné Plus</div>
                </div>
              </div>
            </div>

            {/* Presentation of the head physiotherapist */}
            <div className="lg:col-span-7 space-y-5">
              <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                Direction des Soins & Kinésithérapie
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Rencontrez la cheffe du cabinet Kiné Plus
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Masseur-Kinésithérapeute Diplômée d’État et directrice du cabinet Kiné Plus,{' '}
                <strong>Mme. Dorlon</strong> met son expertise et sa bienveillance au service de
                votre récupération physique et de votre confort au quotidien.
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Écoute active & Diagnostic précis :</strong> Analyse attentive de vos
                    douleurs et de vos amplitudes fonctionnelles.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Techniques manuelles & Appareillage moderne :</strong> Mobilisations
                    douces et travail ciblé sur le plateau technique Kiné Plus.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Disponibilité directe :</strong> Contactez la cheffe au{' '}
                    <a href="tel:0685632170" className="font-semibold text-teal-700 underline">
                      06 85 63 21 70
                    </a>{' '}
                    ou par e-mail à{' '}
                    <a
                      href="mailto:moussietoudorlon@gmail.com"
                      className="font-semibold text-teal-700 underline"
                    >
                      moussietoudorlon@gmail.com
                    </a>
                    .
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('reservation')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Réserver avec la cheffe du cabinet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SERVICES DU CABINET                                               */}
      {/* ==================================================================== */}
      <section
        id="prestations"
        className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                Nos Soins Kinésithérapiques
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Prestations & Soins assurés par Kiné Plus
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Chaque séance est adaptée à votre prescription médicale et réalisée avec des
                équipements de qualité.
              </p>
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('pre-evaluation')}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Faire une pré-évaluation d’orientation →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeServices.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 p-6 flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">
                    Soin {service.code}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Durée : {service.durationLabel}</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-400">{service.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectServiceAndBook(service.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer"
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
      {/* 6. EXPÉRIENCE PATIENT (« VOTRE PARCOURS »)                           */}
      {/* ==================================================================== */}
      <section
        id="parcours"
        className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              Expérience Patient
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Votre parcours au cabinet Kiné Plus
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              De votre prise de rendez-vous jusqu’au rétablissement complet de votre mobilité.
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
      />

      {/* ==================================================================== */}
      {/* GALERIE DU CABINET KINÉ PLUS                                         */}
      {/* ==================================================================== */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              Galerie & Ambiance
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              Découvrez le cabinet Kiné Plus en images
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
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Témoignages de nos patients vérifiés
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
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              Tout savoir avant votre visite chez Kiné Plus
            </h2>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
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
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                  Contacter le cabinet Kiné Plus
                </h2>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Adresse du cabinet</div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {clinicData.settings.address} · {clinicData.settings.cityPostal}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Horaires d’ouverture</div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {clinicData.settings.openingHoursSummary}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">E-mail direct</div>
                    <a
                      href="mailto:moussietoudorlon@gmail.com"
                      className="text-teal-700 dark:text-teal-400 underline mt-0.5 block"
                    >
                      moussietoudorlon@gmail.com
                    </a>
                  </div>
                </div>

                {/* Direct 1-click calls */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <a
                    href="tel:0685632170"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appeler le 06 85 63 21 70</span>
                  </a>

                  <a
                    href="https://wa.me/33685632170"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp au 06 85 63 21 70</span>
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
                        {m === 'plan' ? 'Plan' : m === 'itineraire' ? 'Métro/Bus' : 'PMR & Parking'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-slate-100/60 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300">
                  {mapMode === 'plan' && (
                    <p>
                      <strong>Localisation :</strong> 12 Avenue des Praticiens, 75011 Paris. Cabinet en rez-de-chaussée sur cour calme.
                    </p>
                  )}
                  {mapMode === 'itineraire' && (
                    <p>
                      <strong>Transports en commun :</strong> Métro ligne 9 (station Voltaire ou Charonne) à 2 minutes à pied. Bus 69 et 56.
                    </p>
                  )}
                  {mapMode === 'acces' && (
                    <p>
                      <strong>Accessibilité & Stationnement :</strong> Accès de plain-pied accessible aux personnes à mobilité réduite (PMR). Places de stationnement à proximité immédiate.
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Envoyer un message à la cheffe du cabinet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Réponse sous 24h par Mme. Dorlon ou l’équipe Kiné Plus.
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
                      placeholder="06 12 34 56 78"
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
                      placeholder="votre.email@exemple.fr"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Objet</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="Demande d’information..."
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
                    placeholder="Posez votre question ou détaillez votre demande..."
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
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
            <span className="font-bold text-slate-900 dark:text-white">Kiné Plus</span> · Cabinet de Kinésithérapie · Tél :{' '}
            <a href="tel:0685632170" className="underline font-medium text-slate-700 dark:text-slate-300">
              06 85 63 21 70
            </a>{' '}
            · E-mail :{' '}
            <a href="mailto:moussietoudorlon@gmail.com" className="underline font-medium text-slate-700 dark:text-slate-300">
              moussietoudorlon@gmail.com
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
              onClick={() => setIsAdminView(true)}
              className="underline cursor-pointer"
            >
              Espace Praticien
            </button>
          </div>
        </div>
      </footer>

      {/* Floating button on mobile */}
      <div className="fixed bottom-3 inset-x-4 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => scrollToSection('reservation')}
          className="w-full h-12 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Prendre rendez-vous · Kiné Plus</span>
        </button>
      </div>

      <LegalPrivacyModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        settings={clinicData.settings}
      />
    </div>
  );
}

export default App;
