import logo from '../assets/2.jpeg';

export const brand = {
  name: 'Antaran',
  tagline: 'Where Healing Meets Understanding',
  logo,
};

export const doctor = {
  name: 'Dr Medha',
  qualification: 'Consultant Psychiatrist',
  city: 'Bengaluru / Online',
  phone: '+91 80888 92105',
  whatsapp: '+91 80888 92105',
  email: 'antaran.health@gmail.com',
  instagram:
    'https://www.instagram.com/antaran.health?igsh=MTA4Zjc2am1ibzd4eQ%3D%3D&utm_source=qr',
};

export const consultationTypes = [
  {
    title: 'Psychiatric Consultation',
    duration: '30-60 min',
    description:
      'A private online consultation shaped around your concerns, history, and goals. The duration is tailored to what you need.',
  },
];

export const GOOGLE_FORM_BASE =
  'https://docs.google.com/forms/d/e/1FAIpQLSdbdGQpTFU8T9KH-H6M9-PvqzBAhcteDhQDIUo2FXuVZesukQ/viewform?usp=pp_url';

export const GOOGLE_FORM_ENTRIES = {
  name: 'entry.1757509789',
  age: 'entry.1385558754',
  phone: 'entry.272098946',
  email: 'entry.1222143642',
  consultationType: 'entry.1226581237',
  date: 'entry.1538227956',
  time: 'entry.2033637864',
  message: 'entry.1615957077',
};

export const careAreas = [
  'Anxiety and stress',
  'Low mood and depression',
  'Sleep concerns',
  'Relationship stress',
  'Workplace burnout',
  'Medication reviews',
];

export const steps = [
  {
    title: 'Share your concern',
    text: 'Fill a short booking request with your preferred time and consultation mode.',
  },
  {
    title: 'Get confirmation',
    text: 'The clinic team reviews the request and confirms availability.',
  },
  {
    title: 'Begin care',
    text: 'Meet online and receive a practical care plan.',
  },
];
