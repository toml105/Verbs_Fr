export interface TenseInfo {
  key: string;
  frenchName: string;
  englishName: string;
  description: string;
  difficulty: 1 | 2 | 3;
}

export const PRESENT = "PRESENT";
export const PASSE_COMPOSE = "PASSE_COMPOSE";
export const IMPARFAIT = "IMPARFAIT";
export const PLUS_QUE_PARFAIT = "PLUS_QUE_PARFAIT";
export const FUTUR = "FUTUR";
export const FUTUR_ANTERIEUR = "FUTUR_ANTERIEUR";
export const CONDITIONNEL_PRESENT = "CONDITIONNEL_PRESENT";
export const CONDITIONNEL_PASSE = "CONDITIONNEL_PASSE";
export const SUBJONCTIF_PRESENT = "SUBJONCTIF_PRESENT";
export const SUBJONCTIF_PASSE = "SUBJONCTIF_PASSE";
export const IMPERATIF = "IMPERATIF";

export const TENSES: TenseInfo[] = [
  {
    key: PRESENT,
    frenchName: "Présent",
    englishName: "Present",
    description: "Describes current actions, habitual actions, and general truths. Also used for near-future events and ongoing states.",
    difficulty: 1,
  },
  {
    key: PASSE_COMPOSE,
    frenchName: "Passé composé",
    englishName: "Present Perfect / Simple Past",
    description: "Describes completed actions in the past, especially those with a clear beginning or end. The most common past tense in spoken French.",
    difficulty: 2,
  },
  {
    key: IMPARFAIT,
    frenchName: "Imparfait",
    englishName: "Imperfect",
    description: "Describes ongoing or habitual actions in the past, background descriptions, and states of being. Often translated as 'was doing' or 'used to do'.",
    difficulty: 2,
  },
  {
    key: PLUS_QUE_PARFAIT,
    frenchName: "Plus-que-parfait",
    englishName: "Pluperfect",
    description: "Describes actions that had been completed before another past action. Equivalent to 'had done' in English.",
    difficulty: 3,
  },
  {
    key: FUTUR,
    frenchName: "Futur simple",
    englishName: "Simple Future",
    description: "Describes actions that will happen in the future. Used for predictions, promises, and planned events.",
    difficulty: 2,
  },
  {
    key: FUTUR_ANTERIEUR,
    frenchName: "Futur antérieur",
    englishName: "Future Perfect",
    description: "Describes actions that will have been completed before a future point in time. Equivalent to 'will have done'.",
    difficulty: 3,
  },
  {
    key: CONDITIONNEL_PRESENT,
    frenchName: "Conditionnel présent",
    englishName: "Present Conditional",
    description: "Expresses hypothetical actions, polite requests, and wishes. Equivalent to 'would do' in English.",
    difficulty: 2,
  },
  {
    key: CONDITIONNEL_PASSE,
    frenchName: "Conditionnel passé",
    englishName: "Past Conditional",
    description: "Expresses actions that would have happened under different circumstances. Equivalent to 'would have done'.",
    difficulty: 3,
  },
  {
    key: SUBJONCTIF_PRESENT,
    frenchName: "Subjonctif présent",
    englishName: "Present Subjunctive",
    description: "Used after expressions of doubt, emotion, desire, necessity, and certain conjunctions. Expresses subjective or uncertain actions.",
    difficulty: 3,
  },
  {
    key: SUBJONCTIF_PASSE,
    frenchName: "Subjonctif passé",
    englishName: "Past Subjunctive",
    description: "Used in the same contexts as the present subjunctive, but for completed actions. Formed with the subjunctive of the auxiliary + past participle.",
    difficulty: 3,
  },
  {
    key: IMPERATIF,
    frenchName: "Impératif",
    englishName: "Imperative",
    description: "Used for commands, instructions, requests, and advice. Only exists in tu, nous, and vous forms.",
    difficulty: 2,
  },
];
