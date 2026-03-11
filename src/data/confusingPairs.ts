export interface ConfusingPair {
  id: string;
  verbs: [string, string];
  title: string;
  rule: string;
  examples: { french: string; english: string; verb: string }[];
}

export const CONFUSING_PAIRS: ConfusingPair[] = [
  {
    id: 'savoir-connaitre',
    verbs: ['savoir', 'connaître'],
    title: 'Savoir vs Connaître',
    rule: 'Savoir = knowing facts, information, or how to do something. Connaître = being familiar with people, places, or things.',
    examples: [
      { french: 'Je sais parler français.', english: 'I know how to speak French.', verb: 'savoir' },
      { french: 'Je connais Paris.', english: 'I know (am familiar with) Paris.', verb: 'connaître' },
      { french: 'Tu sais la réponse ?', english: 'Do you know the answer?', verb: 'savoir' },
      { french: 'Tu connais mon frère ?', english: 'Do you know my brother?', verb: 'connaître' },
    ],
  },
  {
    id: 'amener-apporter',
    verbs: ['amener', 'apporter'],
    title: 'Amener vs Apporter',
    rule: 'Amener = bring a person (someone who walks). Apporter = bring a thing (something you carry).',
    examples: [
      { french: "J'amène ma sœur à la fête.", english: "I'm bringing my sister to the party.", verb: 'amener' },
      { french: "J'apporte du vin à la fête.", english: "I'm bringing wine to the party.", verb: 'apporter' },
    ],
  },
  {
    id: 'emmener-emporter',
    verbs: ['emmener', 'emporter'],
    title: 'Emmener vs Emporter',
    rule: 'Emmener = take a person away. Emporter = take a thing away.',
    examples: [
      { french: "J'emmène les enfants au parc.", english: "I'm taking the kids to the park.", verb: 'emmener' },
      { french: "J'emporte mon parapluie.", english: "I'm taking my umbrella.", verb: 'emporter' },
    ],
  },
  {
    id: 'voir-regarder',
    verbs: ['voir', 'regarder'],
    title: 'Voir vs Regarder',
    rule: 'Voir = to see (passive perception). Regarder = to watch/look at (active, intentional).',
    examples: [
      { french: 'Je vois un oiseau.', english: 'I see a bird.', verb: 'voir' },
      { french: 'Je regarde un film.', english: "I'm watching a movie.", verb: 'regarder' },
    ],
  },
  {
    id: 'entendre-ecouter',
    verbs: ['entendre', 'écouter'],
    title: 'Entendre vs Écouter',
    rule: 'Entendre = to hear (passive). Écouter = to listen to (active).',
    examples: [
      { french: "J'entends du bruit.", english: 'I hear noise.', verb: 'entendre' },
      { french: "J'écoute de la musique.", english: "I'm listening to music.", verb: 'écouter' },
    ],
  },
  {
    id: 'dire-parler-raconter',
    verbs: ['dire', 'parler'],
    title: 'Dire vs Parler vs Raconter',
    rule: 'Dire = to say/tell (specific words). Parler = to speak/talk (general). Raconter = to tell/narrate (a story).',
    examples: [
      { french: 'Il dit la vérité.', english: 'He tells the truth.', verb: 'dire' },
      { french: 'Elle parle français.', english: 'She speaks French.', verb: 'parler' },
    ],
  },
  {
    id: 'jouer-a-de',
    verbs: ['jouer', 'jouer'],
    title: 'Jouer à vs Jouer de',
    rule: 'Jouer à = play a sport/game. Jouer de = play a musical instrument.',
    examples: [
      { french: 'Je joue au football.', english: 'I play soccer.', verb: 'jouer' },
      { french: 'Je joue de la guitare.', english: 'I play guitar.', verb: 'jouer' },
    ],
  },
  {
    id: 'penser-a-de',
    verbs: ['penser', 'penser'],
    title: 'Penser à vs Penser de',
    rule: 'Penser à = to think about (have on your mind). Penser de = to think of (have an opinion).',
    examples: [
      { french: 'Je pense à toi.', english: "I'm thinking about you.", verb: 'penser' },
      { french: 'Que penses-tu de ce film ?', english: 'What do you think of this movie?', verb: 'penser' },
    ],
  },
  {
    id: 'pouvoir-savoir',
    verbs: ['pouvoir', 'savoir'],
    title: 'Pouvoir vs Savoir',
    rule: 'Pouvoir = can (ability/permission, circumstances allow). Savoir = can (learned skill, know how to).',
    examples: [
      { french: 'Je ne peux pas venir demain.', english: "I can't come tomorrow.", verb: 'pouvoir' },
      { french: 'Je sais nager.', english: 'I can (know how to) swim.', verb: 'savoir' },
    ],
  },
  {
    id: 'retourner-revenir-rentrer',
    verbs: ['retourner', 'revenir'],
    title: 'Retourner vs Revenir vs Rentrer',
    rule: 'Retourner = go back (to a place). Revenir = come back (to where you are now). Rentrer = go back home.',
    examples: [
      { french: 'Je retourne à Paris en juin.', english: "I'm going back to Paris in June.", verb: 'retourner' },
      { french: 'Je reviens dans cinq minutes.', english: "I'll be back in five minutes.", verb: 'revenir' },
    ],
  },
  {
    id: 'habiter-vivre',
    verbs: ['habiter', 'vivre'],
    title: 'Habiter vs Vivre',
    rule: 'Habiter = to live/reside (physical address). Vivre = to live (life, experience, broader sense).',
    examples: [
      { french: "J'habite à Lyon.", english: 'I live in Lyon.', verb: 'habiter' },
      { french: 'Il vit une vie heureuse.', english: 'He lives a happy life.', verb: 'vivre' },
    ],
  },
];
