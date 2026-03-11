// Conjugation engine for French verbs
// Handles regular verbs programmatically, stores only irregular conjugations

// Regular -er verb endings
const ER_PRESENT = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
const ER_IMPARFAIT = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const ER_FUTUR = ['erai', 'eras', 'era', 'erons', 'erez', 'eront'];
const ER_COND = ['erais', 'erais', 'erait', 'erions', 'eriez', 'eraient'];
const ER_SUBJ = ['e', 'es', 'e', 'ions', 'iez', 'ent'];
const ER_IMPERATIF = ['', 'e', '', 'ons', 'ez', ''];

// Regular -ir verb endings (2nd group: finir-type)
const IR_PRESENT = ['is', 'is', 'it', 'issons', 'issez', 'issent'];
const IR_IMPARFAIT = ['issais', 'issais', 'issait', 'issions', 'issiez', 'issaient'];
const IR_FUTUR = ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'];
const IR_COND = ['irais', 'irais', 'irait', 'irions', 'iriez', 'iraient'];
const IR_SUBJ = ['isse', 'isses', 'isse', 'issions', 'issiez', 'issent'];
const IR_IMPERATIF = ['', 'is', '', 'issons', 'issez', ''];

// Regular -re verb endings
const RE_PRESENT = ['s', 's', '', 'ons', 'ez', 'ent'];
const RE_IMPARFAIT = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const RE_FUTUR = ['rai', 'ras', 'ra', 'rons', 'rez', 'ront'];
const RE_COND = ['rais', 'rais', 'rait', 'rions', 'riez', 'raient'];
const RE_SUBJ = ['e', 'es', 'e', 'ions', 'iez', 'ent'];
const RE_IMPERATIF = ['', 's', '', 'ons', 'ez', ''];

function getStem(infinitive: string, group: number): string {
  if (group === 1) return infinitive.slice(0, -2); // remove -er
  if (group === 2) return infinitive.slice(0, -2); // remove -ir
  return infinitive.slice(0, -2); // remove -re
}

// Past participles for regular verbs
function getRegularPP(infinitive: string, group: number): string {
  if (group === 1) return infinitive.slice(0, -2) + 'é';
  if (group === 2) return infinitive.slice(0, -2) + 'i';
  return infinitive.slice(0, -2) + 'u';
}

// Avoir conjugations for compound tenses
const AVOIR_PRESENT = ['ai', 'as', 'a', 'avons', 'avez', 'ont'];
const AVOIR_IMPARFAIT = ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'];
const AVOIR_FUTUR = ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'];
const AVOIR_COND = ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'];
const AVOIR_SUBJ = ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'];

const ETRE_PRESENT = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'];
const ETRE_IMPARFAIT = ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'];
const ETRE_FUTUR = ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'];
const ETRE_COND = ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'];
const ETRE_SUBJ = ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'];

function makeCompound(auxForms: string[], pp: string): string[] {
  return auxForms.map(aux => `${aux} ${pp}`);
}

export function conjugateRegular(
  infinitive: string,
  group: 1 | 2 | 3,
  auxiliary: 'avoir' | 'être',
  irregularOverrides?: Record<string, string[]>
): Record<string, string[]> {
  const stem = getStem(infinitive, group);
  const pp = getRegularPP(infinitive, group);
  const auxPresent = auxiliary === 'être' ? ETRE_PRESENT : AVOIR_PRESENT;
  const auxImparfait = auxiliary === 'être' ? ETRE_IMPARFAIT : AVOIR_IMPARFAIT;
  const auxFutur = auxiliary === 'être' ? ETRE_FUTUR : AVOIR_FUTUR;
  const auxCond = auxiliary === 'être' ? ETRE_COND : AVOIR_COND;
  const auxSubj = auxiliary === 'être' ? ETRE_SUBJ : AVOIR_SUBJ;

  let result: Record<string, string[]>;

  if (group === 1) {
    // Handle -ger verbs (mangeons, not mangons)
    const isGer = infinitive.endsWith('ger');
    // Handle -cer verbs (commençons, not commencons)
    const isCer = infinitive.endsWith('cer');

    const nousImpStem = isGer ? stem + 'e' : isCer ? stem.slice(0, -1) + 'ç' : stem;

    const present = ER_PRESENT.map((e, i) => {
      if ((i === 3) && (isGer || isCer)) return nousImpStem + e;
      return stem + e;
    });
    const imparfait = ER_IMPARFAIT.map((e, i) => {
      if (i < 3 || i === 5) return (isGer ? stem + 'e' : isCer ? stem.slice(0, -1) + 'ç' : stem) + e;
      return stem + e;
    });

    result = {
      PRESENT: present,
      IMPARFAIT: imparfait,
      FUTUR: ER_FUTUR.map(e => stem + e),
      CONDITIONNEL_PRESENT: ER_COND.map(e => stem + e),
      SUBJONCTIF_PRESENT: ER_SUBJ.map((e, i) => {
        if (i === 3 || i === 4) return stem + e; // nous/vous
        return stem + e;
      }),
      IMPERATIF: ER_IMPERATIF.map(e => e ? stem + e : ''),
      PASSE_COMPOSE: makeCompound(auxPresent, pp),
      PLUS_QUE_PARFAIT: makeCompound(auxImparfait, pp),
      FUTUR_ANTERIEUR: makeCompound(auxFutur, pp),
      CONDITIONNEL_PASSE: makeCompound(auxCond, pp),
      SUBJONCTIF_PASSE: makeCompound(auxSubj, pp),
    };
  } else if (group === 2) {
    result = {
      PRESENT: IR_PRESENT.map(e => stem + e),
      IMPARFAIT: IR_IMPARFAIT.map(e => stem + e),
      FUTUR: IR_FUTUR.map(e => stem + e),
      CONDITIONNEL_PRESENT: IR_COND.map(e => stem + e),
      SUBJONCTIF_PRESENT: IR_SUBJ.map(e => stem + e),
      IMPERATIF: IR_IMPERATIF.map(e => e ? stem + e : ''),
      PASSE_COMPOSE: makeCompound(auxPresent, pp),
      PLUS_QUE_PARFAIT: makeCompound(auxImparfait, pp),
      FUTUR_ANTERIEUR: makeCompound(auxFutur, pp),
      CONDITIONNEL_PASSE: makeCompound(auxCond, pp),
      SUBJONCTIF_PASSE: makeCompound(auxSubj, pp),
    };
  } else {
    // Group 3 - base template (will be overridden for irregulars)
    result = {
      PRESENT: RE_PRESENT.map(e => stem + e),
      IMPARFAIT: RE_IMPARFAIT.map(e => stem + e),
      FUTUR: RE_FUTUR.map(e => stem + e),
      CONDITIONNEL_PRESENT: RE_COND.map(e => stem + e),
      SUBJONCTIF_PRESENT: RE_SUBJ.map(e => stem + e),
      IMPERATIF: RE_IMPERATIF.map(e => e ? stem + e : ''),
      PASSE_COMPOSE: makeCompound(auxPresent, pp),
      PLUS_QUE_PARFAIT: makeCompound(auxImparfait, pp),
      FUTUR_ANTERIEUR: makeCompound(auxFutur, pp),
      CONDITIONNEL_PASSE: makeCompound(auxCond, pp),
      SUBJONCTIF_PASSE: makeCompound(auxSubj, pp),
    };
  }

  // Apply any irregular overrides
  if (irregularOverrides) {
    for (const [tense, forms] of Object.entries(irregularOverrides)) {
      result[tense] = forms;
    }
  }

  return result;
}
