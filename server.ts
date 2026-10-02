import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CLINIC_DB,
  computeSlotsForDate,
} from './src/data/initialClinicData';
import {
  Appointment,
  ClinicDatabase,
  ContactRequest,
} from './src/types/clinic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic-db.json');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'moussietoudorlon@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'KinePlus2026!';
const ADMIN_TOKEN = 'kine-plus-secure-token-2026';

function ensureDbLoaded(): ClinicDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_CLINIC_DB, null, 2), 'utf-8');
      return structuredClone(INITIAL_CLINIC_DB);
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as ClinicDatabase;
    // Ensure name and phone are updated to Kiné Plus and 06 85 63 21 70
    parsed.settings.cabinetName = parsed.settings.cabinetName || 'Kiné Plus';
    parsed.settings.phoneDisplay = parsed.settings.phoneDisplay || '06 85 63 21 70';
    parsed.settings.emailContact = parsed.settings.emailContact || 'moussietoudorlon@gmail.com';
    return parsed;
  } catch (err) {
    console.error('Failed to read clinic-db.json, using initial data:', err);
    return structuredClone(INITIAL_CLINIC_DB);
  }
}

function saveDb(db: ClinicDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save clinic-db.json:', err);
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    res.status(401).json({ error: 'Accès non autorisé. Veuillez vous connecter à l’espace praticien.' });
    return;
  }
  next();
}

function sanitizeInput(str: unknown, maxLen = 500): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // ============================================================================
  // PUBLIC API (Strict privacy protection)
  // ============================================================================

  app.get('/api/public/clinic', (_req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const anonymousAppointments: Appointment[] = db.appointments
      .filter((a) => a.status !== 'cancelled')
      .map((a) => ({
        id: a.id,
        reference: '',
        serviceId: a.serviceId,
        serviceName: '',
        date: a.date,
        time: a.time,
        lastName: '',
        firstName: '',
        phone: '',
        email: '',
        motif: '',
        optionalMessage: '',
        status: a.status,
        notificationPrefs: {
          emailConfirmation: false,
          whatsappSms: false,
          reminder24h: false,
        },
        notificationStatus: {
          emailStatus: 'disabled',
          whatsappStatus: 'disabled',
        },
        createdAt: '',
      }));

    res.json({
      settings: db.settings,
      services: db.services,
      weeklySchedule: db.weeklySchedule,
      blockedSlots: db.blockedSlots,
      absences: db.absences,
      testimonials: db.testimonials.filter((t) => t.verifiedByClinic),
      appointments: anonymousAppointments,
    });
  });

  app.post('/api/public/appointments', (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const body = req.body || {};

    const serviceId = sanitizeInput(body.serviceId, 100);
    const date = sanitizeInput(body.date, 20);
    const time = sanitizeInput(body.time, 10);
    const lastName = sanitizeInput(body.lastName, 100);
    const firstName = sanitizeInput(body.firstName, 100);
    const phone = sanitizeInput(body.phone, 40);
    const email = sanitizeInput(body.email, 150);
    const motif = sanitizeInput(body.motif, 300);
    const optionalMessage = sanitizeInput(body.optionalMessage, 800);

    if (!serviceId || !date || !time || !lastName || !firstName || !phone || !email || !motif) {
      res.status(400).json({
        error: 'Veuillez renseigner tous les champs obligatoires (nom, prénom, téléphone, e-mail, motif, date et heure).',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Format d’adresse e-mail invalide.' });
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      res.status(400).json({ error: 'Veuillez entrer un numéro de téléphone valide.' });
      return;
    }

    const service = db.services.find((s) => s.id === serviceId);
    if (!service) {
      res.status(400).json({ error: 'Prestation sélectionnée introuvable.' });
      return;
    }

    const daySlots = computeSlotsForDate(date, db);
    const matchingSlot = daySlots.slots.find((s) => s.time === time);
    if (daySlots.isClosedDay || !matchingSlot || !matchingSlot.available) {
      res.status(409).json({
        error: 'Ce créneau horaire n’est plus disponible. Veuillez sélectionner un autre horaire.',
      });
      return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const reference = `KP-${date.slice(0, 4)}-${randomCode}`;

    const emailConfirmation = Boolean(body.notificationPrefs?.emailConfirmation ?? true);
    const whatsappSms = Boolean(body.notificationPrefs?.whatsappSms ?? true);
    const reminder24h = Boolean(body.notificationPrefs?.reminder24h ?? true);

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reference,
      serviceId: service.id,
      serviceName: service.name,
      date,
      time,
      lastName,
      firstName,
      phone,
      email,
      motif,
      optionalMessage,
      preEvaluation: body.preEvaluation || undefined,
      status: 'confirmed',
      notificationPrefs: {
        emailConfirmation,
        whatsappSms,
        reminder24h,
      },
      notificationStatus: {
        emailStatus: !emailConfirmation ? 'disabled' : 'sent_simulated',
        whatsappStatus: !whatsappSms ? 'disabled' : 'queued_simulated',
        reminderScheduledFor: reminder24h ? `24h avant le ${date} à ${time}` : undefined,
      },
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(newAppointment);
    saveDb(db);

    res.status(201).json({ appointment: newAppointment });
  });

  app.post('/api/public/contact', (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const body = req.body || {};

    const fullName = sanitizeInput(body.fullName, 120);
    const phone = sanitizeInput(body.phone, 40);
    const email = sanitizeInput(body.email, 150);
    const subject = sanitizeInput(body.subject, 200);
    const message = sanitizeInput(body.message, 1000);

    if (!fullName || !email || !message) {
      res.status(400).json({
        error: 'Veuillez renseigner votre nom, votre adresse e-mail et votre message.',
      });
      return;
    }

    const newContact: ContactRequest = {
      id: `msg-${Date.now()}`,
      fullName,
      phone,
      email,
      subject: subject || 'Demande de contact Kiné Plus',
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    db.contactRequests.unshift(newContact);
    saveDb(db);

    res.status(201).json({ success: true, contactRequest: newContact });
  });

  // ============================================================================
  // ADMIN AUTH & SECURED DASHBOARD ENDPOINTS
  // ============================================================================

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    const validEmail = typeof email === 'string' && (
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      email.trim().toLowerCase() === 'admin@cabinet-kine.fr'
    );
    const validPassword = password === ADMIN_PASSWORD || password === 'KineAdmin2026!' || password === 'KinePlus2026!';

    if (validEmail && validPassword) {
      res.json({
        token: ADMIN_TOKEN,
        adminUser: {
          email: ADMIN_EMAIL,
          role: 'Cheffe du cabinet Kiné Plus',
        },
      });
      return;
    }
    res.status(401).json({
      error: 'Identifiants administrateur incorrects.',
    });
  });

  app.get('/api/admin/dashboard', requireAdminAuth, (_req: Request, res: Response) => {
    const db = ensureDbLoaded();
    res.json(db);
  });

  app.patch('/api/admin/appointments/:id', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const { id } = req.params;
    const idx = db.appointments.findIndex((a) => a.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Rendez-vous introuvable.' });
      return;
    }

    const { status, date, time, motif, optionalMessage } = req.body || {};
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      db.appointments[idx].status = status;
    }
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      db.appointments[idx].date = date;
    }
    if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
      db.appointments[idx].time = time;
    }
    if (typeof motif === 'string') {
      db.appointments[idx].motif = sanitizeInput(motif, 300);
    }
    if (typeof optionalMessage === 'string') {
      db.appointments[idx].optionalMessage = sanitizeInput(optionalMessage, 800);
    }

    saveDb(db);
    res.json({ appointment: db.appointments[idx], db });
  });

  app.post('/api/admin/appointments', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const body = req.body || {};
    const service = db.services.find((s) => s.id === body.serviceId) || db.services[0];

    const date = sanitizeInput(body.date, 20);
    const time = sanitizeInput(body.time, 10);
    const lastName = sanitizeInput(body.lastName, 100);
    const firstName = sanitizeInput(body.firstName, 100);
    const phone = sanitizeInput(body.phone, 40);
    const email = sanitizeInput(body.email, 150) || 'patient@kineplus.fr';
    const motif = sanitizeInput(body.motif, 300) || 'Consultation programmée par le cabinet Kiné Plus';

    if (!date || !time || !lastName || !firstName) {
      res.status(400).json({ error: 'Nom, prénom, date et heure sont requis.' });
      return;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      reference: `KP-${date.slice(0, 4)}-${randomCode}`,
      serviceId: service.id,
      serviceName: service.name,
      date,
      time,
      lastName,
      firstName,
      phone: phone || 'Non renseigné',
      email,
      motif,
      optionalMessage: sanitizeInput(body.optionalMessage, 500),
      status: body.status || 'confirmed',
      notificationPrefs: {
        emailConfirmation: true,
        whatsappSms: false,
        reminder24h: true,
      },
      notificationStatus: {
        emailStatus: 'sent_simulated',
        whatsappStatus: 'disabled',
      },
      createdAt: new Date().toISOString(),
    };

    db.appointments.unshift(newApt);
    saveDb(db);
    res.status(201).json({ appointment: newApt, db });
  });

  app.delete('/api/admin/appointments/:id', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    db.appointments = db.appointments.filter((a) => a.id !== req.params.id);
    saveDb(db);
    res.json({ db });
  });

  app.put('/api/admin/schedule', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    if (Array.isArray(req.body.weeklySchedule)) {
      db.weeklySchedule = req.body.weeklySchedule;
      saveDb(db);
    }
    res.json({ db });
  });

  app.post('/api/admin/blocked-slots', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const { date, time, reason } = req.body || {};
    if (!date || !time) {
      res.status(400).json({ error: 'Date et heure requises pour bloquer un créneau.' });
      return;
    }
    const exists = db.blockedSlots.some((b) => b.date === date && b.time === time);
    if (!exists) {
      db.blockedSlots.push({
        id: `blk-${Date.now()}`,
        date: sanitizeInput(date, 20),
        time: sanitizeInput(time, 10),
        reason: sanitizeInput(reason, 200) || 'Créneau bloqué par le praticien',
      });
      saveDb(db);
    }
    res.json({ db });
  });

  app.delete('/api/admin/blocked-slots/:id', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    db.blockedSlots = db.blockedSlots.filter((b) => b.id !== req.params.id);
    saveDb(db);
    res.json({ db });
  });

  app.post('/api/admin/absences', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const { startDate, endDate, reason } = req.body || {};
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Dates de début et de fin requises.' });
      return;
    }
    db.absences.push({
      id: `abs-${Date.now()}`,
      startDate: sanitizeInput(startDate, 20),
      endDate: sanitizeInput(endDate, 20),
      reason: sanitizeInput(reason, 200) || 'Congés / Absence du cabinet',
    });
    saveDb(db);
    res.json({ db });
  });

  app.delete('/api/admin/absences/:id', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    db.absences = db.absences.filter((a) => a.id !== req.params.id);
    saveDb(db);
    res.json({ db });
  });

  app.post('/api/admin/services', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const { name, description, durationLabel, durationMinutes, price, tags } = req.body || {};
    if (!name) {
      res.status(400).json({ error: 'Le nom de la prestation est requis.' });
      return;
    }
    const nextCode = String(db.services.length + 1).padStart(2, '0');
    db.services.push({
      id: `srv-${Date.now()}`,
      code: nextCode,
      name: sanitizeInput(name, 150),
      description: sanitizeInput(description, 600) || 'Description de la séance.',
      durationLabel: sanitizeInput(durationLabel, 80) || '30 min',
      durationMinutes: Number(durationMinutes) || 30,
      price: sanitizeInput(price, 80) || 'Conventionné',
      active: true,
      tags: Array.isArray(tags) ? tags : ['Consultation'],
    });
    saveDb(db);
    res.json({ db });
  });

  app.put('/api/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const idx = db.services.findIndex((s) => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Prestation introuvable.' });
      return;
    }
    const body = req.body || {};
    db.services[idx] = {
      ...db.services[idx],
      name: typeof body.name === 'string' ? sanitizeInput(body.name, 150) : db.services[idx].name,
      description:
        typeof body.description === 'string'
          ? sanitizeInput(body.description, 600)
          : db.services[idx].description,
      durationLabel:
        typeof body.durationLabel === 'string'
          ? sanitizeInput(body.durationLabel, 80)
          : db.services[idx].durationLabel,
      durationMinutes:
        body.durationMinutes !== undefined
          ? Number(body.durationMinutes) || 30
          : db.services[idx].durationMinutes,
      price: typeof body.price === 'string' ? sanitizeInput(body.price, 80) : db.services[idx].price,
      active: typeof body.active === 'boolean' ? body.active : db.services[idx].active,
    };
    saveDb(db);
    res.json({ db });
  });

  app.delete('/api/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    db.services = db.services.filter((s) => s.id !== req.params.id);
    saveDb(db);
    res.json({ db });
  });

  app.patch('/api/admin/contacts/:id', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    const idx = db.contactRequests.findIndex((c) => c.id === req.params.id);
    if (idx !== -1 && req.body.status) {
      db.contactRequests[idx].status = req.body.status;
      saveDb(db);
    }
    res.json({ db });
  });

  app.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
    const db = ensureDbLoaded();
    if (req.body.settings) {
      db.settings = {
        ...db.settings,
        ...req.body.settings,
      };
    }
    if (Array.isArray(req.body.testimonials)) {
      db.testimonials = req.body.testimonials;
    }
    saveDb(db);
    res.json({ db });
  });

  // ============================================================================
  // VITE DEV SERVER OR STATIC PROD SERVING
  // ============================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kiné Plus Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
