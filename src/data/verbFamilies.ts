export interface VerbFamily {
  id: string;
  name: string;
  pattern: string;
  verbs: string[];
  explanation: string;
}

export const VERB_FAMILIES: VerbFamily[] = [
  {
    id: 'prendre',
    name: 'Prendre Family',
    pattern: '-prendre',
    verbs: ['prendre', 'comprendre', 'apprendre', 'surprendre', 'reprendre'],
    explanation: 'All conjugate like prendre: je prends, il prend (no "d" → "t" needed), nous prenons, ils prennent (double "n" in plural).',
  },
  {
    id: 'venir',
    name: 'Venir Family',
    pattern: '-venir / -tenir',
    verbs: ['venir', 'devenir', 'revenir', 'tenir', 'obtenir', 'maintenir', 'retenir'],
    explanation: 'Share the stem change: je viens/tiens, nous venons/tenons, ils viennent/tiennent. All use être as auxiliary (venir group).',
  },
  {
    id: 'mettre',
    name: 'Mettre Family',
    pattern: '-mettre',
    verbs: ['mettre', 'permettre', 'promettre', 'admettre', 'soumettre', 'remettre'],
    explanation: 'Conjugate like mettre: je mets, il met (single "t"), nous mettons. Past participle: mis, permis, promis, etc.',
  },
  {
    id: 'dire',
    name: 'Dire Family',
    pattern: '-dire',
    verbs: ['dire', 'interdire', 'prédire', 'contredire'],
    explanation: 'Note: "vous dites" (irregular) but "vous interdisez, vous prédisez" (regular -isez ending for compounds).',
  },
  {
    id: 'duire',
    name: '-duire Family',
    pattern: '-duire',
    verbs: ['conduire', 'produire', 'traduire', 'réduire', 'séduire', 'construire', 'détruire', 'introduire'],
    explanation: 'All follow: je conduis, nous conduisons, ils conduisent. Past participle ends in "-uit": conduit, produit, traduit.',
  },
  {
    id: 'crire',
    name: '-crire Family',
    pattern: '-crire',
    verbs: ['écrire', 'décrire', 'inscrire'],
    explanation: 'Follow: j\'écris, nous écrivons (stem change to -criv- in plural). Past participle: écrit, décrit, inscrit.',
  },
  {
    id: 'aître',
    name: '-aître Family',
    pattern: '-aître / -oître',
    verbs: ['connaître', 'reconnaître', 'paraître', 'apparaître', 'disparaître'],
    explanation: 'Share pattern: je connais, il connaît (circumflex before "t"), nous connaissons (double "s"). Past participle: connu, paru.',
  },
  {
    id: 'partir',
    name: 'Partir Family',
    pattern: '-tir / -mir / -vir',
    verbs: ['partir', 'sortir', 'sentir', 'mentir', 'dormir', 'servir'],
    explanation: 'Irregular -ir verbs: drop final consonant of stem in singular: je pars, tu sors, il dort. Plural keeps it: nous partons.',
  },
  {
    id: 'ouvrir',
    name: 'Ouvrir Family',
    pattern: '-vrir / -frir',
    verbs: ['ouvrir', 'découvrir', 'offrir', 'souffrir', 'couvrir'],
    explanation: 'Conjugate like -er verbs in présent: j\'ouvre, tu ouvres. Past participle: ouvert, découvert, offert.',
  },
  {
    id: 'oir',
    name: 'Recevoir Family',
    pattern: '-cevoir',
    verbs: ['recevoir', 'apercevoir', 'concevoir', 'décevoir'],
    explanation: 'Follow: je reçois (ç before o), nous recevons, ils reçoivent. Past participle: reçu, aperçu, conçu.',
  },
  {
    id: 'ger',
    name: '-ger Verbs',
    pattern: '-ger',
    verbs: ['manger', 'voyager', 'nager', 'partager', 'changer', 'ranger', 'mélanger'],
    explanation: 'Add "e" before endings starting with "a" or "o" to keep soft "g": nous mangeons, je mangeais.',
  },
  {
    id: 'cer',
    name: '-cer Verbs',
    pattern: '-cer',
    verbs: ['commencer', 'avancer', 'lancer', 'placer', 'remplacer', 'annoncer'],
    explanation: 'Use "ç" before endings starting with "a" or "o" to keep soft "c": nous commençons, je commençais.',
  },
  {
    id: 'yer',
    name: '-yer Verbs',
    pattern: '-yer',
    verbs: ['envoyer', 'payer', 'essayer', 'employer', 'appuyer', 'nettoyer'],
    explanation: 'Change "y" to "i" before silent "e": j\'envoie, tu paies. The -ayer verbs can optionally keep "y": je paye/je paie.',
  },
  {
    id: 'eler-eter',
    name: '-eler/-eter Doubling',
    pattern: '-eler / -eter',
    verbs: ['appeler', 'jeter', 'rappeler', 'rejeter'],
    explanation: 'Double the consonant before silent "e": j\'appelle, je jette. But: j\'achète, je gèle (accent grave instead).',
  },
  {
    id: 'reflexive',
    name: 'Reflexive Verbs',
    pattern: 'se + verb',
    verbs: ['se lever', 'se coucher', 'se laver', 'se promener', 'se souvenir', 's\'asseoir', 'se taire', 'se réveiller', 'se dépêcher'],
    explanation: 'Always use être in compound tenses. The reflexive pronoun changes: je me, tu te, il se, nous nous, vous vous, ils se.',
  },
];

export function getVerbFamily(verbId: string): VerbFamily | undefined {
  return VERB_FAMILIES.find(f => f.verbs.includes(verbId));
}

export function getRelatedVerbs(verbId: string): string[] {
  const family = getVerbFamily(verbId);
  if (!family) return [];
  return family.verbs.filter(v => v !== verbId);
}
