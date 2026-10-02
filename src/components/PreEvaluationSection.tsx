import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import {
  ClinicService,
  PreEvalBodyArea,
  PreEvalDuration,
  PreEvalMainGoal,
  PreEvalMainIssue,
  PreEvaluationResult,
} from '../types/clinic';
import { suggestServiceFromPreEvaluation } from '../data/initialClinicData';

interface PreEvaluationSectionProps {
  services: ClinicService[];
  onCompletePreEvaluation: (result: PreEvaluationResult) => void;
}

const BODY_AREAS: { value: PreEvalBodyArea; detail: string }[] = [
  { value: 'Dos', detail: 'Région lombaire, dorsale ou colonne vertébrale' },
  { value: 'Cou', detail: 'Région cervicale, nuque et trapèzes' },
  { value: 'Épaule', detail: 'Mobilité, coiffe des rotateurs ou tendinopathie' },
  { value: 'Genou', detail: 'Ligaments, ménisques, rotule ou arthrose' },
  { value: 'Hanche', detail: 'Bassin, aine ou prothèse' },
  { value: 'Cheville/pied', detail: 'Entorse, tendon d’Achille, voûte plantaire' },
  { value: 'Bras/main', detail: 'Coude, avant-bras, poignet ou main' },
  { value: 'Autre', detail: 'Autre zone ou gêne globale' },
];

const DURATIONS: { value: PreEvalDuration; detail: string }[] = [
  { value: 'Depuis quelques jours', detail: 'Apparition récente (moins d’une semaine)' },
  { value: 'Quelques semaines', detail: 'Présent depuis 2 à 6 semaines' },
  { value: 'Plusieurs mois', detail: 'Gêne installée depuis plus de 2 mois' },
  { value: 'Depuis longtemps', detail: 'Gêne ancienne, chronique ou récurrente' },
];

const MAIN_ISSUES: { value: PreEvalMainIssue; detail: string }[] = [
  { value: 'Douleur', detail: 'Sensibilité au repos, à la charge ou au mouvement' },
  { value: 'Difficulté à bouger', detail: 'Raideur, manque de souplesse ou blocage' },
  { value: 'Récupération après une blessure', detail: 'Entorse, déchirure ou traumatisme récent' },
  { value: 'Rééducation après opération', detail: 'Suivi post-chirurgical sur prescription médicale' },
  { value: 'Perte de mobilité', detail: 'Besoin de retrouver une amplitude naturelle' },
  { value: 'Prévention', detail: 'Conseils posturaux et prévention des récidives' },
  { value: 'Autre', detail: 'Autre motif d’accompagnement kinésithérapique' },
];

const MAIN_GOALS: { value: PreEvalMainGoal; detail: string }[] = [
  { value: 'Réduire une gêne', detail: 'Soulager les tensions et retrouver du confort' },
  { value: 'Retrouver ma mobilité', detail: 'Récupérer l’aisance dans les gestes de tous les jours' },
  { value: 'Récupérer après une blessure', detail: 'Suivre un protocole progressif de consolidation' },
  { value: 'Reprendre une activité physique', detail: 'Retrouver la forme et reprendre le sport en sécurité' },
  { value: 'Autre', detail: 'Établir un bilan initial avec l’équipe' },
];

export const PreEvaluationSection: React.FC<PreEvaluationSectionProps> = ({
  services,
  onCompletePreEvaluation,
}) => {
  const [step, setStep] = useState<number>(1);
  const [bodyArea, setBodyArea] = useState<PreEvalBodyArea | null>(null);
  const [duration, setDuration] = useState<PreEvalDuration | null>(null);
  const [mainIssue, setMainIssue] = useState<PreEvalMainIssue | null>(null);
  const [mainGoal, setMainGoal] = useState<PreEvalMainGoal | null>(null);

  const isFinished = step === 5 && bodyArea && duration && mainIssue && mainGoal;

  const suggestion =
    bodyArea && duration && mainIssue && mainGoal
      ? suggestServiceFromPreEvaluation(bodyArea, duration, mainIssue, mainGoal, services)
      : null;

  const handleReset = () => {
    setBodyArea(null);
    setDuration(null);
    setMainIssue(null);
    setMainGoal(null);
    setStep(1);
  };

  const handleProceedToBooking = () => {
    if (!bodyArea || !duration || !mainIssue || !mainGoal || !suggestion) return;
    onCompletePreEvaluation({
      bodyArea,
      duration,
      mainIssue,
      mainGoal,
      suggestedServiceId: suggestion.serviceId,
      suggestedServiceName: suggestion.serviceName,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <section
      id="pre-evaluation"
      className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left explanatory column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
              Orientation en 1 minute · Kiné Plus
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Pré-évaluation rapide avant votre rendez-vous
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Répondez à quatre questions simples pour identifier le motif général de consultation
              et permettre à l’équipe Kiné Plus d’orienter au mieux votre première séance.
            </p>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-900 dark:text-slate-200">
                Pourquoi faire cette pré-évaluation ?
              </p>
              <ul className="space-y-2">
                <li>1. Identifier le motif général de votre consultation</li>
                <li>2. Vous orienter vers la prestation la plus appropriée</li>
                <li>3. Faciliter et accélérer votre réservation en ligne</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-200/90 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 leading-relaxed flex gap-3 items-start">
              <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Avertissement important : </span>
                Ce questionnaire ne remplace en aucun cas un diagnostic médical. Seul un
                professionnel de santé peut établir un diagnostic.
              </div>
            </div>
          </div>

          {/* Right interactive questionnaire */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-6 sm:p-8">
              {!isFinished ? (
                <div>
                  {/* Progress header */}
                  <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        Question {step} / 4
                      </span>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                        {step === 1 && 'Où ressentez-vous principalement votre gêne ?'}
                        {step === 2 && 'Depuis combien de temps ?'}
                        {step === 3 && 'Qu’est-ce qui vous gêne principalement ?'}
                        {step === 4 && 'Quel est votre objectif principal ?'}
                      </div>
                    </div>
                    <div className="w-32 sm:w-44 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-700 dark:bg-teal-500 transition-transform duration-150 origin-left"
                        style={{ transform: `scaleX(${step / 4})` }}
                      />
                    </div>
                  </div>

                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Où ressentez-vous principalement votre gêne ?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BODY_AREAS.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setBodyArea(item.value);
                              setStep(2);
                            }}
                            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-teal-600/70 hover:shadow-xs transition-colors cursor-pointer"
                          >
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {item.value}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.detail}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Depuis combien de temps ?
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {DURATIONS.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setDuration(item.value);
                              setStep(3);
                            }}
                            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-teal-600/70 hover:shadow-xs transition-colors cursor-pointer"
                          >
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {item.value}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.detail}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Qu’est-ce qui vous gêne principalement ?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {MAIN_ISSUES.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setMainIssue(item.value);
                              setStep(4);
                            }}
                            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-teal-600/70 hover:shadow-xs transition-colors cursor-pointer"
                          >
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {item.value}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.detail}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Quel est votre objectif principal ?
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {MAIN_GOALS.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setMainGoal(item.value);
                              setStep(5);
                            }}
                            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-teal-600/70 hover:shadow-xs transition-colors cursor-pointer"
                          >
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {item.value}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.detail}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation footer */}
                  <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={step === 1}
                      onClick={() => setStep((s) => Math.max(1, s - 1))}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer whitespace-nowrap"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Question précédente</span>
                    </button>
                    <span className="text-xs text-slate-400">Cliquez pour valider l'étape</span>
                  </div>
                </div>
              ) : (
                /* Synthesis Screen */
                <div className="space-y-6">
                  <div className="flex items-start gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
                    <ClipboardCheck className="w-6 h-6 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                        Synthèse de votre orientation
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-snug">
                        D’après vos réponses, une consultation de kinésithérapie pourrait être
                        pertinente pour évaluer votre situation.
                      </h3>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Vos repères déclarés :
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-800 dark:text-slate-200">
                      <span><strong>Zone :</strong> {bodyArea}</span>
                      <span aria-hidden="true">·</span>
                      <span><strong>Ancienneté :</strong> {duration}</span>
                      <span aria-hidden="true">·</span>
                      <span><strong>Motif :</strong> {mainIssue}</span>
                      <span aria-hidden="true">·</span>
                      <span><strong>Objectif :</strong> {mainGoal}</span>
                    </div>

                    {suggestion && (
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Prestation conseillée chez Kiné Plus :
                        </div>
                        <div className="text-sm font-semibold text-teal-800 dark:text-teal-300 mt-0.5">
                          {suggestion.serviceName}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mandatory disclaimer */}
                  <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                    Ceci n’est pas un diagnostic médical. Seul un professionnel de santé peut
                    établir un diagnostic.
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleProceedToBooking}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                    >
                      <span>Continuer vers la prise de rendez-vous</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Modifier mes réponses</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
