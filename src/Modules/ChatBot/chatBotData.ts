import type { FAQCategory, FAQEntry } from './types/chatbot.types';

export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'finding', label: 'Finding Food' },
  { id: 'registration', label: 'Registration' },
  { id: 'account', label: 'Account & Household' },
  { id: 'reservations', label: 'Reservations' },
  { id: 'general', label: 'General Help' },
];

export const FAQ_ENTRIES: FAQEntry[] = [
  // Finding Food / Events
  {
    id: 'find-pantry',
    category: FAQ_CATEGORIES[0],
    keywords: [
      'find',
      'food',
      'pantry',
      'near me',
      'nearby',
      'location',
      'where',
      'closest',
      'food bank',
      'search',
    ],
    question: 'How do I find a food pantry near me?',
    answer:
      'Enter your zip code on the home page and click "Search." You\'ll see a list of nearby food pantries and upcoming distribution events in your area.',
    link: { label: 'Go to Home Page', url: '/' },
    followUps: ['search-events', 'what-to-bring'],
  },
  {
    id: 'search-events',
    category: FAQ_CATEGORIES[0],
    keywords: [
      'events',
      'distribution',
      'search',
      'available',
      'upcoming',
      'schedule',
      'when',
      'date',
      'time',
      'list',
    ],
    question: 'How do I search for food distribution events?',
    answer:
      "After entering your zip code, you'll see a list of upcoming events. Each event shows the date, time, location, and available time slots. You can browse and pick the one that works best for you.",
    link: { label: 'Go to Home Page', url: '/' },
    followUps: ['register-event', 'find-pantry'],
  },

  // Registration
  {
    id: 'register-event',
    category: FAQ_CATEGORIES[1],
    keywords: [
      'register',
      'sign up',
      'event',
      'how to register',
      'registration',
      'reserve',
      'book',
      'enroll',
    ],
    question: 'How do I register for an event?',
    answer:
      'Find an event from the events list, click on it to view details, then click "Register." You\'ll fill out a short form with your name, address, and household size. Once complete, you\'ll receive a confirmation.',
    link: { label: 'Go to Home Page', url: '/' },
    followUps: ['registration-info', 'pick-time-slot'],
  },
  {
    id: 'registration-info',
    category: FAQ_CATEGORIES[1],
    keywords: [
      'information',
      'need',
      'required',
      'what do i need',
      'details',
      'form',
      'fields',
      'provide',
    ],
    question: 'What information do I need to register?',
    answer:
      "You'll need: your first and last name, date of birth, gender, home address, a phone number or email address, and the number of people in your household (adults, children, and seniors).",
    followUps: ['register-event', 'create-account'],
  },
  {
    id: 'multiple-events',
    category: FAQ_CATEGORIES[1],
    keywords: ['multiple', 'more than one', 'several', 'another event', 'again', 'different event'],
    question: 'Can I register for multiple events?',
    answer:
      'Yes! You can register for multiple events. Just search for events and register for each one separately. Having an account makes this faster since your information is saved.',
    followUps: ['search-events', 'create-account'],
  },
  {
    id: 'already-registered',
    category: FAQ_CATEGORIES[1],
    keywords: [
      'already registered',
      'duplicate',
      'registered before',
      'signed up already',
      'error',
      'already',
    ],
    question: "What if it says I'm already registered?",
    answer:
      'This means a registration already exists for your household at that event. If you believe this is an error, please contact support at support@freshtrak.org for assistance.',
    followUps: ['contact-support', 'view-reservations'],
  },
  {
    id: 'pick-time-slot',
    category: FAQ_CATEGORIES[1],
    keywords: ['time slot', 'slot', 'pick time', 'choose time', 'appointment', 'schedule', 'time'],
    question: 'How do I pick a time slot?',
    answer:
      'During registration, available time slots are displayed for the event. Select the slot that works best for you. Slots may fill up, so registering early gives you more options.',
    followUps: ['register-event', 'cancel-reservation'],
  },

  // Account and Household
  {
    id: 'create-account',
    category: FAQ_CATEGORIES[2],
    keywords: [
      'create account',
      'sign up',
      'account',
      'new account',
      'make account',
      'join',
      'create',
      'register account',
    ],
    question: 'How do I create an account?',
    answer:
      'Click "Sign In" in the top menu, then select "Sign Up" You\'ll enter your email and create a password. An account lets you save your household info and manage reservations easily.',
    link: { label: 'Go to Login', url: '/login' },
    followUps: ['update-household', 'forgot-password'],
  },
  {
    id: 'update-household',
    category: FAQ_CATEGORIES[2],
    keywords: [
      'update',
      'edit',
      'change',
      'household',
      'modify',
      'information',
      'profile',
      'address',
    ],
    question: 'How do I update my household information?',
    answer:
      'Log in to your account and go to the Profile page. From there you can edit your personal details, address, contact information, and household member counts.',
    link: { label: 'Go to Households', url: '/households' },
    followUps: ['add-family-members', 'create-account'],
  },
  {
    id: 'add-family-members',
    category: FAQ_CATEGORIES[2],
    keywords: [
      'add member',
      'family',
      'members',
      'remove member',
      'household member',
      'people',
      'dependents',
    ],
    question: 'How do I add or remove family members?',
    answer:
      'Go to the Profile page and set up your household profile. You can specify the number of adults, children, and seniors in your household, and optionally add individual member details.',
    link: { label: 'Go to Households', url: '/households' },
    followUps: ['update-household', 'registration-info'],
  },
  {
    id: 'forgot-password',
    category: FAQ_CATEGORIES[2],
    keywords: ['forgot', 'password', 'reset', "can't log in", 'locked out', 'recover'],
    question: 'I forgot my password',
    answer:
      'On the login page, click "Forgot Password." Enter the email address associated with your account and follow the instructions sent to your email to reset your password.',
    link: { label: 'Go to Login', url: '/login' },
    followUps: ['create-account', 'contact-support'],
  },

  // Reservations
  {
    id: 'view-reservations',
    category: FAQ_CATEGORIES[3],
    keywords: ['view', 'see', 'my reservations', 'upcoming', 'booked', 'confirmed', 'reservations'],
    question: 'How do I view my upcoming reservations?',
    answer:
      'Log in to your account and visit your profile page. Your upcoming reservations will be displayed there, including event details, dates, and time slots.',
    link: { label: 'Go to My Home', url: '/user-home' },
    followUps: ['cancel-reservation', 'register-event'],
  },
  {
    id: 'cancel-reservation',
    category: FAQ_CATEGORIES[3],
    keywords: [
      'cancel',
      'remove',
      'delete',
      'reservation',
      'unregister',
      'not going',
      "can't make it",
    ],
    question: 'How do I cancel a reservation?',
    answer:
      'Unfortunately, you cannot cancel your reservation online. Please contact support at support@freshtrak.org for assistance.',
    link: { label: 'Go to My Home', url: '/user-home' },
    followUps: ['view-reservations', 'register-event'],
  },
  {
    id: 'change-reservation',
    category: FAQ_CATEGORIES[3],
    keywords: ['change', 'reschedule', 'move', 'different time', 'switch', 'modify reservation'],
    question: 'Can I change my reservation?',
    answer:
      "To change a reservation, you'll need to contact support at support@freshtrak.org for assistance. If you have a case manager, please contact them for assistance.",
    followUps: ['cancel-reservation', 'search-events'],
  },

  // Eligibility and General
  {
    id: 'eligibility',
    category: FAQ_CATEGORIES[4],
    keywords: [
      'eligibility',
      'eligible',
      'qualify',
      'requirements',
      'who can',
      'income',
      'criteria',
    ],
    question: 'What are the eligibility requirements?',
    answer:
      'Eligibility varies by food bank and event. Many distributions are open to anyone in need — no proof of income is required. Check the specific event details for any requirements.',
    followUps: ['search-events', 'contact-support'],
  },
  {
    id: 'what-to-bring',
    category: FAQ_CATEGORIES[4],
    keywords: [
      'bring',
      'need to bring',
      'id',
      'identification',
      'documents',
      'what to bring',
      'prepare',
    ],
    question: 'What should I bring to a food distribution?',
    answer:
      'Bring your registration confirmation (shown on screen or via SMS/email) and a form of ID if available. Some events may have specific requirements listed in the event details. Bags or boxes for carrying food are helpful.',
    followUps: ['register-event', 'search-events'],
  },
  {
    id: 'what-is-freshtrak',
    category: FAQ_CATEGORIES[4],
    keywords: ['what is freshtrak', 'about', 'freshtrak', 'purpose', 'who are you', 'what does'],
    question: 'What is FreshTrak?',
    answer:
      'FreshTrak is a free service that helps you find food pantries and distribution events in your area. You can search by zip code, register for events, and manage your household information — all in one place.',
    link: { label: 'About FreshTrak', url: '/freshtrak-about' },
    followUps: ['find-pantry', 'contact-support'],
  },
  {
    id: 'change-language',
    category: FAQ_CATEGORIES[4],
    keywords: ['language', 'spanish', 'change language', 'translate', 'english', 'other language'],
    question: 'How do I change the language?',
    answer:
      'Use the language selector in the top navigation bar of the website. FreshTrak is available in multiple languages including English, Spanish, Somali, Russian, Turkish, Arabic, Chinese, Hindi, and Nepali.',
    followUps: ['what-is-freshtrak', 'contact-support'],
  },
  {
    id: 'contact-support',
    category: FAQ_CATEGORIES[4],
    keywords: [
      'contact',
      'support',
      'help',
      'email',
      'phone',
      'reach',
      'talk to someone',
      'human',
      'person',
      'agent',
    ],
    question: 'How do I contact support?',
    answer:
      'You can reach the FreshTrak support team by emailing support@freshtrak.org. They can help with account issues, registration problems, and any other questions.',
    followUps: ['what-is-freshtrak', 'find-pantry'],
  },
];

export const WELCOME_MESSAGE =
  "Hi! I'm the FreshTrak assistant. I can help you with finding food, registering for events, managing your account, and more. What can I help you with?";

export const FALLBACK_MESSAGE = "I'm not sure I understand. Here are some topics I can help with:";

export const NO_MATCH_SUGGESTIONS_MESSAGE =
  "I couldn't find an exact match, but you might be looking for one of these:";

export const GREETING_KEYWORDS = [
  'hi',
  'hello',
  'hey',
  'help',
  'good morning',
  'good afternoon',
  'good evening',
  'howdy',
  'greetings',
];
