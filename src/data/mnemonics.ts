export interface Mnemonic {
  id: string;
  verbIds: string[];
  tenseKeys: string[];
  title: string;
  tip: string;
  category: 'pattern' | 'auxiliary' | 'tense-usage' | 'spelling';
}

export const MNEMONICS: Mnemonic[] = [
  {
    id: 'dr-mrs-vandertramp',
    verbIds: ['devenir', 'revenir', 'monter', 'rester', 'sortir', 'venir', 'aller', 'naître', 'descendre', 'entrer', 'retourner', 'tomber', 'rentrer', 'arriver', 'mourir', 'partir'],
    tenseKeys: ['PASSE_COMPOSE'],
    title: 'DR MRS VANDERTRAMP',
    tip: 'These verbs use être (not avoir) as their auxiliary in passé composé: Devenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Retourner, Tomber, Rentrer, Arriver, Mourir, Partir.',
    category: 'auxiliary',
  },
  {
    id: 'reflexive-etre',
    verbIds: ['se lever', 'se coucher', 'se laver', 'se promener', 'se souvenir', 's\'asseoir', 'se taire', 'se réveiller', 'se dépêcher'],
    tenseKeys: ['PASSE_COMPOSE'],
    title: 'Reflexive = Être',
    tip: 'ALL reflexive verbs use être in compound tenses. The past participle agrees with the subject: "elle s\'est levée" (add -e for feminine).',
    category: 'auxiliary',
  },
  {
    id: 'ger-spelling',
    verbIds: ['manger', 'voyager', 'nager', 'partager', 'changer', 'ranger'],
    tenseKeys: ['PRESENT', 'IMPARFAIT'],
    title: 'Keep the soft G',
    tip: 'All -ger verbs add "e" before "ons" to keep the soft "g" sound: nous mangeons, nous voyageons. Same in imparfait: je mangeais.',
    category: 'spelling',
  },
  {
    id: 'cer-spelling',
    verbIds: ['commencer', 'avancer', 'lancer', 'placer', 'remplacer'],
    tenseKeys: ['PRESENT', 'IMPARFAIT'],
    title: 'Ç keeps it soft',
    tip: 'All -cer verbs use ç before "a" or "o": nous commençons, je commençais. This keeps the soft "s" sound.',
    category: 'spelling',
  },
  {
    id: 'subjonctif-usage',
    verbIds: [],
    tenseKeys: ['SUBJONCTIF_PRESENT'],
    title: 'When to use Subjonctif',
    tip: 'Use subjonctif after expressions of: doubt (douter que), emotion (content que), desire (vouloir que), necessity (il faut que). Key phrase: "que" usually triggers it.',
    category: 'tense-usage',
  },
  {
    id: 'imparfait-vs-passe',
    verbIds: [],
    tenseKeys: ['IMPARFAIT', 'PASSE_COMPOSE'],
    title: 'Imparfait vs Passé Composé',
    tip: 'Imparfait = ongoing/habitual past ("I was eating", "I used to eat"). Passé composé = completed past ("I ate"). Think: imparfait = background, passé composé = action.',
    category: 'tense-usage',
  },
  {
    id: 'conditionnel-usage',
    verbIds: [],
    tenseKeys: ['CONDITIONNEL_PRESENT'],
    title: 'Conditionnel = Future stem + Imparfait endings',
    tip: 'Easy trick: take the futur simple stem (infinitive for regular verbs) and add imparfait endings: -ais, -ais, -ait, -ions, -iez, -aient.',
    category: 'tense-usage',
  },
  {
    id: 'futur-stem',
    verbIds: ['avoir', 'être', 'faire', 'aller', 'venir', 'voir', 'pouvoir', 'vouloir', 'savoir', 'devoir', 'envoyer'],
    tenseKeys: ['FUTUR_SIMPLE'],
    title: 'Irregular Futur Stems',
    tip: 'Key irregular stems: être→ser-, avoir→aur-, faire→fer-, aller→ir-, venir→viendr-, voir→verr-, pouvoir→pourr-, vouloir→voudr-, savoir→saur-, devoir→devr-, envoyer→enverr-.',
    category: 'pattern',
  },
  {
    id: 'nous-form-imparfait',
    verbIds: [],
    tenseKeys: ['IMPARFAIT'],
    title: 'Imparfait from Nous',
    tip: 'To form imparfait: take the "nous" form in présent, remove "-ons", add imparfait endings. Only exception: être → ét- (not from "sommes").',
    category: 'pattern',
  },
  {
    id: 'past-participle-groups',
    verbIds: [],
    tenseKeys: ['PASSE_COMPOSE'],
    title: 'Past Participle Patterns',
    tip: '-er → -é (parlé), -ir (group 2) → -i (fini), -re → -u (vendu). Irregulars: fait, dit, écrit, pris, mis, ouvert, offert, mort, né.',
    category: 'pattern',
  },
  {
    id: 'imperatif-form',
    verbIds: [],
    tenseKeys: ['IMPERATIF'],
    title: 'Impératif = No "s" for -er',
    tip: 'For -er verbs, drop the "s" from tu form: "tu parles" → "parle!" But: "tu finis" → "finis!" Exceptions: va! (but "vas-y!").',
    category: 'pattern',
  },
  {
    id: 'yer-stem-change',
    verbIds: ['envoyer', 'payer', 'essayer', 'employer', 'nettoyer'],
    tenseKeys: ['PRESENT'],
    title: '-yer → -ie before silent e',
    tip: '-oyer and -uyer: must change y→i: j\'envoie, je nettoie. -ayer: optional: je paie OR je paye (both correct).',
    category: 'spelling',
  },
  {
    id: 'double-consonant',
    verbIds: ['appeler', 'jeter'],
    tenseKeys: ['PRESENT'],
    title: 'Appeler & Jeter: Double Up',
    tip: 'J\'appelle, je jette (double l/t before silent e). But acheter → j\'achète (accent grave instead). Remember: call → double, buy → accent.',
    category: 'spelling',
  },
];

export function getMnemonicsForVerb(verbId: string): Mnemonic[] {
  return MNEMONICS.filter(m => m.verbIds.length === 0 || m.verbIds.includes(verbId));
}

export function getMnemonicsForTense(tenseKey: string): Mnemonic[] {
  return MNEMONICS.filter(m => m.tenseKeys.includes(tenseKey));
}
