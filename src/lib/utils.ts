export const PRONOUNS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'] as const;

export const PRONOUN_FULL = [
  'je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles',
] as const;

export function getPronoun(personIndex: number, startsWithVowel: boolean): string {
  if (personIndex === 0 && startsWithVowel) return "j'";
  return PRONOUNS[personIndex];
}

export function startsWithVowelOrH(word: string): boolean {
  if (!word) return false;
  const first = word.charAt(0).toLowerCase();
  return 'aeiouhâàéèêëîïôùûü'.includes(first);
}

export function formatConjugation(pronoun: string, verbForm: string): string {
  if (!verbForm) return '';
  if (pronoun === 'je' && startsWithVowelOrH(verbForm)) {
    return `j'${verbForm}`;
  }
  return `${pronoun} ${verbForm}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  // Exact match first
  if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
    return true;
  }
  // Accent-insensitive match
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

export function getGroupLabel(group: 1 | 2 | 3): string {
  switch (group) {
    case 1: return '1st Group (-er)';
    case 2: return '2nd Group (-ir)';
    case 3: return '3rd Group (irregular)';
  }
}

export function getDifficultyLabel(difficulty: 1 | 2 | 3): string {
  switch (difficulty) {
    case 1: return 'Beginner';
    case 2: return 'Intermediate';
    case 3: return 'Advanced';
  }
}

export function getDifficultyColor(difficulty: 1 | 2 | 3): string {
  switch (difficulty) {
    case 1: return 'text-emerald-600 bg-emerald-50';
    case 2: return 'text-amber-600 bg-amber-50';
    case 3: return 'text-coral-600 bg-coral-50';
  }
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}
