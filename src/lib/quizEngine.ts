import type { QuizQuestion, VerbDef } from '../types';
import { conjugations } from '../data/conjugations';
import { examples } from '../data/examples';
import { PRONOUNS, shuffleArray, getRandomItems, formatConjugation } from './utils';

export function generateConjugationQuestion(
  verb: VerbDef,
  tense: string,
  personIndex?: number
): QuizQuestion | null {
  const verbConj = conjugations[verb.id];
  if (!verbConj || !verbConj[tense]) return null;

  const forms = verbConj[tense];
  const person = personIndex ?? Math.floor(Math.random() * 6);

  // Skip empty forms (e.g., impératif je/il/ils)
  if (!forms[person]) {
    const validPersons = forms
      .map((f, i) => (f ? i : -1))
      .filter((i) => i >= 0);
    if (validPersons.length === 0) return null;
    const fallback = validPersons[Math.floor(Math.random() * validPersons.length)];
    return generateConjugationQuestion(verb, tense, fallback);
  }

  return {
    type: 'conjugation',
    verbId: verb.id,
    tense,
    personIndex: person,
    prompt: `Conjugate "${verb.infinitive}" (${verb.english}) in ${tense.replace(/_/g, ' ').toLowerCase()} for ${PRONOUNS[person]}`,
    correctAnswer: forms[person],
    hint: verb.english,
  };
}

export function generateMultipleChoiceQuestion(
  verb: VerbDef,
  tense: string,
  allVerbs: VerbDef[]
): QuizQuestion | null {
  const verbConj = conjugations[verb.id];
  if (!verbConj || !verbConj[tense]) return null;

  const forms = verbConj[tense];
  const validPersons = forms.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  if (validPersons.length === 0) return null;

  const person = validPersons[Math.floor(Math.random() * validPersons.length)];
  const correctAnswer = forms[person];

  // Generate distractors from other verbs
  const distractors: string[] = [];
  const otherVerbs = shuffleArray(allVerbs.filter((v) => v.id !== verb.id));

  for (const other of otherVerbs) {
    if (distractors.length >= 3) break;
    const otherConj = conjugations[other.id];
    if (otherConj?.[tense]?.[person] && otherConj[tense][person] !== correctAnswer) {
      distractors.push(otherConj[tense][person]);
    }
  }

  // If not enough distractors, add forms from other persons
  while (distractors.length < 3) {
    const otherPerson = Math.floor(Math.random() * 6);
    if (forms[otherPerson] && forms[otherPerson] !== correctAnswer && !distractors.includes(forms[otherPerson])) {
      distractors.push(forms[otherPerson]);
    }
    if (distractors.length < 3 && distractors.length === new Set(distractors).size) {
      // Avoid infinite loop
      break;
    }
  }

  const options = shuffleArray([correctAnswer, ...distractors.slice(0, 3)]);

  return {
    type: 'multiple-choice',
    verbId: verb.id,
    tense,
    personIndex: person,
    prompt: `What is the correct ${tense.replace(/_/g, ' ').toLowerCase()} form of "${verb.infinitive}" for ${PRONOUNS[person]}?`,
    correctAnswer,
    options,
    hint: verb.english,
  };
}

export function generateFillBlankQuestion(
  verb: VerbDef,
  tense: string
): QuizQuestion | null {
  const verbExamples = examples.filter(
    (e) => e.verbId === verb.id && e.tense === tense
  );

  if (verbExamples.length === 0) {
    // Fall back to conjugation question
    return generateConjugationQuestion(verb, tense);
  }

  const example = verbExamples[Math.floor(Math.random() * verbExamples.length)];
  const verbConj = conjugations[verb.id];
  if (!verbConj?.[tense]) return null;

  // Find which form is in the sentence
  const forms = verbConj[tense];
  let correctForm = '';
  let personIndex = 0;

  for (let i = 0; i < forms.length; i++) {
    if (forms[i] && example.french.toLowerCase().includes(forms[i].toLowerCase())) {
      correctForm = forms[i];
      personIndex = i;
      break;
    }
  }

  if (!correctForm) {
    return generateConjugationQuestion(verb, tense);
  }

  const template = example.french.replace(
    new RegExp(correctForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    '______'
  );

  return {
    type: 'fill-blank',
    verbId: verb.id,
    tense,
    personIndex,
    prompt: `Fill in the blank with the correct form of "${verb.infinitive}":`,
    correctAnswer: correctForm,
    sentenceTemplate: template,
    hint: example.english,
  };
}

export function generateQuizQuestions(
  verbs: VerbDef[],
  tenses: string[],
  count: number,
  allVerbs: VerbDef[]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const generators = [
    generateConjugationQuestion,
    (v: VerbDef, t: string) => generateMultipleChoiceQuestion(v, t, allVerbs),
    generateFillBlankQuestion,
  ];

  const pairs = shuffleArray(
    verbs.flatMap((v) => tenses.map((t) => ({ verb: v, tense: t })))
  );

  for (const { verb, tense } of pairs) {
    if (questions.length >= count) break;

    const genIndex = Math.floor(Math.random() * generators.length);
    const question = generators[genIndex](verb, tense);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

export function generateReviewQuestions(
  dueItems: { verbId: string; tense: string }[],
  verbs: VerbDef[],
  allVerbs: VerbDef[],
  count: number
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const items = shuffleArray(dueItems).slice(0, count);

  for (const { verbId, tense } of items) {
    const verb = verbs.find((v) => v.id === verbId);
    if (!verb) continue;

    const qType = Math.random();
    let question: QuizQuestion | null = null;

    if (qType < 0.4) {
      question = generateConjugationQuestion(verb, tense);
    } else if (qType < 0.7) {
      question = generateMultipleChoiceQuestion(verb, tense, allVerbs);
    } else {
      question = generateFillBlankQuestion(verb, tense);
    }

    if (question) questions.push(question);
  }

  return questions;
}
