import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { ClinicSettings } from '../types/clinic';

interface LegalPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClinicSettings;
}

export const LegalPrivacyModal: React.FC<LegalPrivacyModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Mentions Légales & Confidentialité — Kiné Plus
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              1. Mentions légales du cabinet
            </h3>
            <p>
              <strong>Cabinet :</strong> {settings.cabinetName} (Cheffe du cabinet : Mme. Dorlon)
              <br />
              <strong>Adresse :</strong> {settings.address}, {settings.cityPostal}
              <br />
              <strong>Téléphone :</strong> {settings.phoneDisplay} · <strong>E-mail :</strong>{' '}
              {settings.emailContact}
              <br />
              <strong>Ordre professionnel :</strong> Inscription à l’Ordre des Masseurs-Kinésithérapeutes.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              2. Absence de valeur diagnostique de la pré-évaluation
            </h3>
            <p className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200">
              Le questionnaire d’orientation disponible sur le site a pour unique objet d’aiguiller
              le motif général de consultation. Il ne constitue pas un diagnostic médical. Seul un
              professionnel de santé peut poser un diagnostic lors d’un examen en cabinet.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              3. Protection des données (RGPD)
            </h3>
            <p>
              Vos données personnelles sont strictement confidentielles, ne sont jamais partagées à
              des tiers et ne servent qu’à la gestion des rendez-vous au cabinet Kiné Plus.
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
