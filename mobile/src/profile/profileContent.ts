export const SUPPORT_EMAIL = 'support@emergencytool.com';
export const SUPPORT_PHONE = '911';
export const APP_VERSION = '1.0.0';

export const privacyHighlights = [
  'Your exact location is only requested during emergency and safety features.',
  'Profile updates are stored in the secured backend account service.',
  'Offline queue items stay on-device until they can be synced or manually cleared.',
  'Expo Go disables remote push registration, but in-app alerts still work inside the app.',
];

export const helpFaqItems = [
  {
    id: 'account',
    question: 'How do I update my profile details?',
    answer: 'Open Profile Settings to change your name, phone number, barangay, and profile picture, then tap Save Profile.',
  },
  {
    id: 'household',
    question: 'What is Household Info used for?',
    answer: 'Household details help responders understand if your home has seniors, pregnant members, or PWD family members during emergencies.',
  },
  {
    id: 'notifications',
    question: 'Why is push token unavailable in Expo Go?',
    answer: 'Expo Go on SDK 54 no longer supports Android remote push notifications. The app still shows in-app notification status and message history.',
  },
  {
    id: 'offline',
    question: 'What happens if I lose internet connection?',
    answer: 'EmergencyTool tracks offline state and keeps pending items in queue until the connection is available again or you clear them manually.',
  },
  {
    id: 'security',
    question: 'How do I change my password?',
    answer: 'Go to Profile Settings, fill in your current password and new password, then tap Change Password.',
  },
];

export const aboutHighlights = [
  'Emergency reporting with location sharing',
  'Family safety and household preparedness',
  'Barangay alerts and hazard awareness',
  'Offline-aware mobile workflows for unstable connectivity',
];
