export interface VerbGroup {
  key: string;
  frenchName: string;
  englishName: string;
  description: string;
  icon: string;
}

export const VERB_GROUPS: VerbGroup[] = [
  {
    key: "essential",
    frenchName: "Verbes essentiels",
    englishName: "Essential Verbs",
    description: "The most fundamental and frequently used French verbs that every learner must know.",
    icon: "star",
  },
  {
    key: "movement",
    frenchName: "Mouvement",
    englishName: "Movement",
    description: "Verbs related to physical movement, travel, and changing position.",
    icon: "directions-walk",
  },
  {
    key: "communication",
    frenchName: "Communication",
    englishName: "Communication",
    description: "Verbs related to speaking, writing, reading, and exchanging information.",
    icon: "chat",
  },
  {
    key: "emotions",
    frenchName: "Émotions",
    englishName: "Emotions",
    description: "Verbs expressing feelings, emotions, and psychological states.",
    icon: "heart",
  },
  {
    key: "daily-life",
    frenchName: "Vie quotidienne",
    englishName: "Daily Life",
    description: "Verbs used in everyday routines and common activities.",
    icon: "home",
  },
  {
    key: "food-drink",
    frenchName: "Nourriture et boissons",
    englishName: "Food & Drink",
    description: "Verbs related to eating, drinking, cooking, and food preparation.",
    icon: "restaurant",
  },
  {
    key: "work",
    frenchName: "Travail",
    englishName: "Work",
    description: "Verbs related to professional activities, employment, and business.",
    icon: "briefcase",
  },
  {
    key: "travel",
    frenchName: "Voyage",
    englishName: "Travel",
    description: "Verbs related to traveling, tourism, and navigation.",
    icon: "airplane",
  },
  {
    key: "health",
    frenchName: "Santé",
    englishName: "Health",
    description: "Verbs related to health, wellness, and medical contexts.",
    icon: "medical",
  },
  {
    key: "nature",
    frenchName: "Nature",
    englishName: "Nature",
    description: "Verbs related to nature, weather, and the environment.",
    icon: "leaf",
  },
  {
    key: "cognition",
    frenchName: "Cognition",
    englishName: "Cognition",
    description: "Verbs related to thinking, knowing, understanding, and mental processes.",
    icon: "brain",
  },
  {
    key: "social",
    frenchName: "Relations sociales",
    englishName: "Social",
    description: "Verbs related to social interactions, relationships, and community.",
    icon: "people",
  },
  {
    key: "creation",
    frenchName: "Création",
    englishName: "Creation",
    description: "Verbs related to creating, building, making, and artistic endeavors.",
    icon: "brush",
  },
  {
    key: "change",
    frenchName: "Changement",
    englishName: "Change",
    description: "Verbs related to transformation, modification, and evolution.",
    icon: "refresh",
  },
  {
    key: "perception",
    frenchName: "Perception",
    englishName: "Perception",
    description: "Verbs related to the senses: seeing, hearing, feeling, smelling, and tasting.",
    icon: "eye",
  },
];
