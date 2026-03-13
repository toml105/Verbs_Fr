import type { GrammarLesson } from '../types';

export const grammarLessons: GrammarLesson[] = [
  // === TIER 1: FOUNDATIONS ===
  {
    id: 'articles',
    title: 'Articles',
    shortDescription: 'Definite, indefinite & partitive articles',
    tier: 1,
    order: 1,
    introduction: 'French articles tell you whether a noun is specific or general, and they must agree in gender and number with the noun. Unlike English, French uses articles almost everywhere — even where English might drop them.',
    rules: [
      {
        title: 'Definite Articles (the)',
        formula: 'le (masc.) / la (fem.) / les (plural)',
        explanation: 'Used for specific nouns, general concepts, and things you like/dislike. "l\'" replaces le/la before a vowel or silent h.',
        examples: [
          { french: 'Le chat dort.', english: 'The cat is sleeping.' },
          { french: "L'eau est froide.", english: 'The water is cold.' },
          { french: "J'aime le chocolat.", english: 'I like chocolate. (general concept)' },
          { french: 'Les enfants jouent.', english: 'The children are playing.' },
        ],
      },
      {
        title: 'Indefinite Articles (a/an/some)',
        formula: 'un (masc.) / une (fem.) / des (plural)',
        explanation: 'Used for non-specific nouns — something you\'re mentioning for the first time or any one of its kind.',
        examples: [
          { french: "J'ai un frère.", english: 'I have a brother.' },
          { french: 'Elle achète une robe.', english: 'She is buying a dress.' },
          { french: 'Il y a des problèmes.', english: 'There are (some) problems.' },
        ],
      },
      {
        title: 'Partitive Articles (some/any)',
        formula: 'du (masc.) / de la (fem.) / de l\' (vowel) / des (plural)',
        explanation: 'Used for uncountable quantities — some of something. In negative sentences, all partitive articles become "de" (or "d\'").',
        examples: [
          { french: 'Je bois du café.', english: 'I drink (some) coffee.' },
          { french: 'Elle mange de la salade.', english: 'She eats (some) salad.' },
          { french: "Je ne bois pas de café.", english: "I don't drink (any) coffee." },
        ],
      },
      {
        title: 'Contractions with à and de',
        formula: 'à + le = au / à + les = aux / de + le = du / de + les = des',
        explanation: 'When à or de comes before le or les, they must contract. No contraction with la or l\'.',
        examples: [
          { french: 'Je vais au marché.', english: 'I go to the market. (à + le)' },
          { french: 'Il parle aux enfants.', english: 'He speaks to the children. (à + les)' },
          { french: 'Le livre du professeur.', english: "The teacher's book. (de + le)" },
        ],
      },
    ],
    tips: [
      'In negative sentences, un/une/des and du/de la/des all become "de" (or "d\'" before a vowel): "Je n\'ai pas de chat."',
      'French uses definite articles for general concepts where English uses none: "J\'aime le fromage" (I like cheese).',
      'Remember: à + la does NOT contract. Only à + le → au and à + les → aux.',
    ],
  },
  {
    id: 'gender-number',
    title: 'Gender & Number',
    shortDescription: 'Noun gender rules and pluralization',
    tier: 1,
    order: 2,
    introduction: 'Every French noun has a gender (masculine or feminine) and a number (singular or plural). Gender often seems arbitrary but there are patterns. Number affects articles, adjectives, and verbs.',
    rules: [
      {
        title: 'Gender Patterns',
        explanation: 'While you must learn each noun\'s gender, endings give strong clues. Most nouns ending in -e are feminine, but many exceptions exist.',
        examples: [
          { french: '-tion, -sion, -té → feminine', english: 'la nation, la télévision, la liberté' },
          { french: '-age, -ment, -eau → masculine', english: 'le village, le moment, le château' },
          { french: '-eur → usually masculine', english: 'le professeur, le docteur' },
          { french: '-euse, -rice → feminine', english: 'la chanteuse, la directrice' },
        ],
      },
      {
        title: 'Plural Formation',
        formula: 'Usually: add -s to the singular',
        explanation: 'Most nouns add -s for plural. Some follow special patterns.',
        examples: [
          { french: 'le chat → les chats', english: 'Regular: add -s' },
          { french: 'le bureau → les bureaux', english: '-eau → -eaux' },
          { french: "le journal → les journaux", english: '-al → -aux' },
          { french: 'le nez → les nez', english: 'Words ending in -s, -x, -z don\'t change' },
        ],
      },
      {
        title: 'Common Irregular Plurals',
        explanation: 'Some nouns have irregular plural forms that must be memorized.',
        examples: [
          { french: "l'œil → les yeux", english: 'eye → eyes' },
          { french: 'monsieur → messieurs', english: 'sir → sirs/gentlemen' },
          { french: 'madame → mesdames', english: 'madam → ladies' },
        ],
      },
    ],
    tips: [
      'Always learn a noun with its article: not "maison" but "la maison." This helps you remember gender naturally.',
      'Nouns ending in -s, -x, or -z stay the same in plural: "le bras → les bras."',
      'Most -al words change to -aux in plural, but there are exceptions: "le festival → les festivals."',
    ],
  },
  {
    id: 'subject-pronouns',
    title: 'Subject Pronouns & Être/Avoir',
    shortDescription: 'Personal pronouns and essential verbs',
    tier: 1,
    order: 3,
    introduction: 'Subject pronouns replace the person or thing performing the action. French has more pronoun forms than English, including a formal "you" (vous) and the impersonal "on."',
    rules: [
      {
        title: 'Subject Pronouns',
        explanation: 'Each pronoun corresponds to a specific verb conjugation form.',
        examples: [
          { french: 'je / j\' (before vowel)', english: 'I' },
          { french: 'tu', english: 'you (informal, one person)' },
          { french: 'il / elle / on', english: 'he / she / one (we, people)' },
          { french: 'nous', english: 'we' },
          { french: 'vous', english: 'you (formal or plural)' },
          { french: 'ils / elles', english: 'they (masc. or mixed / fem. only)' },
        ],
      },
      {
        title: 'Être (to be)',
        formula: 'je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont',
        explanation: 'One of the most important and most irregular French verbs. Used for identity, description, and as an auxiliary in passé composé.',
        examples: [
          { french: 'Je suis étudiant.', english: 'I am a student.' },
          { french: 'Nous sommes fatigués.', english: 'We are tired.' },
          { french: 'Elle est partie.', english: 'She has left. (passé composé with être)' },
        ],
      },
      {
        title: 'Avoir (to have)',
        formula: "j'ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont",
        explanation: 'Used for possession, age, and as the main auxiliary in passé composé. Also appears in many idiomatic expressions.',
        examples: [
          { french: "J'ai vingt ans.", english: 'I am twenty years old. (literally: I have twenty years)' },
          { french: 'Elle a faim.', english: 'She is hungry. (literally: She has hunger)' },
          { french: 'Nous avons mangé.', english: 'We have eaten. (passé composé with avoir)' },
        ],
      },
      {
        title: 'On — The Versatile Pronoun',
        explanation: '"On" conjugates like il/elle (3rd person singular) but means "we" in casual speech, "one/people" in general statements.',
        examples: [
          { french: 'On va au cinéma ?', english: 'Shall we go to the cinema? (casual we)' },
          { french: 'En France, on mange tard.', english: 'In France, people eat late.' },
        ],
      },
    ],
    tips: [
      '"Tu" is for friends, family, children, and peers. "Vous" is for strangers, elders, and formal situations.',
      'French uses "avoir" where English uses "to be" for age, hunger, thirst, fear: "J\'ai faim" (I\'m hungry).',
      '"On" is extremely common in spoken French as a replacement for "nous."',
    ],
  },
  {
    id: 'basic-sentence-structure',
    title: 'Basic Sentence Structure',
    shortDescription: 'Word order, statements & simple questions',
    tier: 1,
    order: 4,
    introduction: 'French sentences follow a Subject-Verb-Object (SVO) pattern like English, but with important differences in pronoun placement and question formation.',
    rules: [
      {
        title: 'Basic Statement Order',
        formula: 'Subject + Verb + Object/Complement',
        explanation: 'Simple declarative sentences follow the same order as English.',
        examples: [
          { french: 'Marie mange une pomme.', english: 'Marie eats an apple.' },
          { french: 'Le chat dort sur le lit.', english: 'The cat sleeps on the bed.' },
          { french: 'Nous aimons la musique.', english: 'We like music.' },
        ],
      },
      {
        title: 'Simple Questions with Intonation',
        explanation: 'The easiest way to ask a question: keep the statement word order and raise your voice at the end.',
        examples: [
          { french: 'Tu parles français ?', english: 'You speak French?' },
          { french: 'Il est prêt ?', english: "He's ready?" },
        ],
      },
      {
        title: 'Questions with Est-ce que',
        formula: 'Est-ce que + statement word order',
        explanation: 'A polite, standard way to form questions. Simply add "est-ce que" before a statement.',
        examples: [
          { french: 'Est-ce que tu parles français ?', english: 'Do you speak French?' },
          { french: "Est-ce qu'il est prêt ?", english: 'Is he ready?' },
        ],
      },
      {
        title: 'C\'est vs Il est',
        explanation: '"C\'est" is used with nouns (including modified nouns) and proper names. "Il/elle est" is used with adjectives alone and professions without an article.',
        examples: [
          { french: "C'est un bon livre.", english: "It's a good book. (noun with article)" },
          { french: 'Il est intéressant.', english: 'It is interesting. (adjective alone)' },
          { french: "C'est mon frère.", english: "He's my brother. (noun)" },
          { french: 'Elle est médecin.', english: 'She is a doctor. (profession, no article)' },
        ],
      },
    ],
    tips: [
      'Rising intonation questions are the most casual. Est-ce que is neutral. Inversion (covered later) is the most formal.',
      'In spoken French, "est-ce que" is often shortened to a quick "es-ke" sound.',
      'Use "c\'est" when pointing at something or introducing. Use "il/elle est" for descriptions.',
    ],
  },
  {
    id: 'negation',
    title: 'Negation',
    shortDescription: 'Making sentences negative: ne...pas and beyond',
    tier: 1,
    order: 5,
    introduction: 'French negation wraps around the verb like a sandwich. The basic form is "ne...pas" but there are many other negative expressions that follow the same pattern.',
    rules: [
      {
        title: 'Basic Negation: ne...pas',
        formula: 'Subject + ne + verb + pas',
        explanation: '"Ne" goes before the verb, "pas" goes after. Before a vowel, "ne" becomes "n\'".',
        examples: [
          { french: 'Je ne parle pas anglais.', english: "I don't speak English." },
          { french: "Il n'aime pas le fromage.", english: "He doesn't like cheese." },
          { french: 'Nous ne sommes pas prêts.', english: "We aren't ready." },
        ],
      },
      {
        title: 'Other Negative Expressions',
        formula: 'ne...jamais / ne...rien / ne...plus / ne...personne',
        explanation: 'Replace "pas" with other words for different negative meanings.',
        examples: [
          { french: 'Je ne mange jamais de viande.', english: 'I never eat meat.' },
          { french: 'Il ne dit rien.', english: "He doesn't say anything. / He says nothing." },
          { french: 'Elle ne travaille plus ici.', english: "She doesn't work here anymore." },
          { french: 'Je ne connais personne.', english: "I don't know anyone." },
        ],
      },
      {
        title: 'Negation with Compound Tenses',
        formula: 'Subject + ne + auxiliary + pas + past participle',
        explanation: 'In passé composé and other compound tenses, ne...pas wraps around the auxiliary verb (avoir/être), not the past participle.',
        examples: [
          { french: "Je n'ai pas mangé.", english: "I didn't eat." },
          { french: "Elle n'est pas venue.", english: "She didn't come." },
          { french: "Nous n'avons jamais visité Paris.", english: 'We have never visited Paris.' },
        ],
      },
      {
        title: 'Negation with Articles',
        explanation: 'After a negative verb, un/une/des and du/de la/des become "de" (d\' before vowels). Exception: after être, articles stay.',
        examples: [
          { french: "J'ai un chat. → Je n'ai pas de chat.", english: "I have a cat. → I don't have a cat." },
          { french: 'Je bois du vin. → Je ne bois pas de vin.', english: "I drink wine. → I don't drink wine." },
          { french: "Ce n'est pas un problème.", english: "It's not a problem. (after être: keeps un)" },
        ],
      },
    ],
    tips: [
      'In spoken French, "ne" is often dropped: "Je sais pas" instead of "Je ne sais pas." But always write it.',
      '"Ne...personne" is special: "personne" can be the subject too: "Personne ne parle."',
      'With infinitives, both parts go before the verb: "Ne pas toucher" (Do not touch).',
    ],
  },
  {
    id: 'adjective-agreement',
    title: 'Adjective Agreement & Placement',
    shortDescription: 'Gender/number agreement and the BANGS rule',
    tier: 1,
    order: 6,
    introduction: 'French adjectives must agree in gender and number with the noun they describe. Most adjectives come AFTER the noun (unlike English), but a common group comes before.',
    rules: [
      {
        title: 'Gender Agreement',
        formula: 'Masculine → add -e for feminine (usually)',
        explanation: 'Most adjectives add -e for the feminine form. If the masculine already ends in -e, it stays the same.',
        examples: [
          { french: 'petit → petite', english: 'small (m. → f.)' },
          { french: 'grand → grande', english: 'tall/big (m. → f.)' },
          { french: 'jeune → jeune', english: 'young (same for both)' },
          { french: 'heureux → heureuse', english: 'happy (-eux → -euse)' },
        ],
      },
      {
        title: 'Number Agreement',
        formula: 'Singular → add -s for plural (usually)',
        explanation: 'Most adjectives add -s for plural. Adjectives ending in -s or -x don\'t change.',
        examples: [
          { french: 'petit → petits / petite → petites', english: 'small (singular → plural)' },
          { french: 'heureux → heureux', english: 'happy (already ends in -x, no change)' },
          { french: 'beau → beaux', english: 'beautiful (-eau → -eaux)' },
        ],
      },
      {
        title: 'Special Feminine Forms',
        explanation: 'Some adjective endings have special feminine forms.',
        examples: [
          { french: '-eux → -euse : sérieux → sérieuse', english: 'serious' },
          { french: '-if → -ive : actif → active', english: 'active' },
          { french: '-er → -ère : premier → première', english: 'first' },
          { french: '-el → -elle : naturel → naturelle', english: 'natural' },
        ],
      },
      {
        title: 'Placement: The BANGS Rule',
        formula: 'Beauty, Age, Number, Goodness, Size → BEFORE the noun',
        explanation: 'Most adjectives go after the noun, but BANGS adjectives go before: beau, joli (Beauty), jeune, vieux, nouveau (Age), premier, deuxième (Number), bon, mauvais (Goodness), grand, petit, gros (Size).',
        examples: [
          { french: 'une belle maison', english: 'a beautiful house (Beauty → before)' },
          { french: 'un vieux livre', english: 'an old book (Age → before)' },
          { french: 'une voiture rouge', english: 'a red car (color → after)' },
          { french: 'un film intéressant', english: 'an interesting movie (quality → after)' },
        ],
      },
    ],
    tips: [
      'Beau, nouveau, vieux have special forms before masculine nouns starting with a vowel: bel, nouvel, vieil. "Un bel homme."',
      'Some adjectives change meaning based on placement: "un grand homme" (a great man) vs "un homme grand" (a tall man).',
      'Color adjectives always go after the noun: "une robe bleue" (a blue dress).',
    ],
  },
  {
    id: 'possessive-demonstrative',
    title: 'Possessive & Demonstrative Adjectives',
    shortDescription: 'my/your/his and this/that/these',
    tier: 1,
    order: 7,
    introduction: 'Possessive adjectives show ownership and demonstrative adjectives point out specific things. Both must agree with the noun they modify, not with the owner.',
    rules: [
      {
        title: 'Possessive Adjectives',
        formula: 'mon/ma/mes, ton/ta/tes, son/sa/ses, notre/nos, votre/vos, leur/leurs',
        explanation: 'Possessives agree with the NOUN (the thing possessed), not the person who possesses it. This is different from English.',
        examples: [
          { french: 'mon livre (m.) / ma maison (f.) / mes amis (pl.)', english: 'my book / my house / my friends' },
          { french: 'son père / sa mère / ses parents', english: 'his/her father / his/her mother / his/her parents' },
          { french: 'notre école / nos professeurs', english: 'our school / our teachers' },
        ],
      },
      {
        title: 'Mon/ton/son Before Feminine Vowels',
        explanation: 'Before feminine nouns starting with a vowel or silent h, use mon/ton/son instead of ma/ta/sa for pronunciation.',
        examples: [
          { french: 'mon amie (not "ma amie")', english: 'my (female) friend' },
          { french: 'ton école', english: 'your school' },
          { french: 'son histoire', english: 'his/her story' },
        ],
      },
      {
        title: 'Demonstrative Adjectives',
        formula: 'ce (masc.) / cet (masc. vowel) / cette (fem.) / ces (plural)',
        explanation: 'Demonstratives point out specific things: "this/that/these/those." Add -ci or -là after the noun to distinguish.',
        examples: [
          { french: 'ce livre', english: 'this/that book' },
          { french: 'cet homme', english: 'this/that man (vowel → cet)' },
          { french: 'cette femme', english: 'this/that woman' },
          { french: 'ces livres-ci / ces livres-là', english: 'these books / those books' },
        ],
      },
    ],
    tips: [
      '"Son/sa/ses" can mean "his," "her," or "its" — context tells you which. The form depends on the noun, not the owner.',
      'Notre/votre are singular (notre maison). Nos/vos are plural (nos maisons). Don\'t confuse with nous/vous.',
      'Use -ci for "this" (near) and -là for "that" (far): "ce livre-ci" (this book here).',
    ],
  },
  {
    id: 'prepositions',
    title: 'Prepositions of Place & Time',
    shortDescription: 'à, de, en, dans, chez, depuis, pendant',
    tier: 1,
    order: 8,
    introduction: 'French prepositions connect nouns to the rest of the sentence, indicating location, direction, time, and more. Many don\'t translate directly from English.',
    rules: [
      {
        title: 'Place: à, en, dans, sur, sous, chez',
        explanation: 'Key location prepositions with their main uses.',
        examples: [
          { french: 'Je vais à Paris / à la boulangerie.', english: 'I\'m going to Paris / to the bakery. (à = to/at)' },
          { french: 'Elle habite en France / en ville.', english: 'She lives in France / in the city. (en = in, with countries/regions)' },
          { french: 'Le livre est dans le sac.', english: 'The book is in the bag. (dans = inside)' },
          { french: 'Je suis chez moi.', english: 'I\'m at home. (chez = at someone\'s place)' },
        ],
      },
      {
        title: 'Countries and Cities',
        formula: 'en + fem. countries / au + masc. countries / aux + plural / à + cities',
        explanation: 'The preposition for "in/to" depends on the country\'s gender.',
        examples: [
          { french: 'en France, en Italie (feminine)', english: 'in France, in Italy' },
          { french: 'au Japon, au Canada (masculine)', english: 'in Japan, in Canada' },
          { french: 'aux États-Unis (plural)', english: 'in the United States' },
          { french: 'à Paris, à Tokyo (cities)', english: 'in Paris, in Tokyo' },
        ],
      },
      {
        title: 'Time: depuis, pendant, pour, il y a',
        explanation: 'Time prepositions indicate duration and timing.',
        examples: [
          { french: "J'habite ici depuis trois ans.", english: "I've been living here for three years. (depuis = since/for, ongoing)" },
          { french: "J'ai étudié pendant deux heures.", english: 'I studied for two hours. (pendant = for, completed)' },
          { french: 'Il est parti il y a une heure.', english: 'He left an hour ago. (il y a = ago)' },
        ],
      },
    ],
    tips: [
      '"Depuis" is for actions that STARTED in the past and CONTINUE now. "Pendant" is for completed durations.',
      'Most countries ending in -e are feminine (la France, la Chine). Exceptions: le Mexique, le Mozambique.',
      '"Chez" means "at the home/place of": "chez le médecin" (at the doctor\'s).',
    ],
  },

  // === TIER 2: INTERMEDIATE ===
  {
    id: 'object-pronouns',
    title: 'Direct & Indirect Object Pronouns',
    shortDescription: 'le/la/les, lui/leur and placement rules',
    tier: 2,
    order: 1,
    introduction: 'Object pronouns replace nouns that receive the action of the verb. They go BEFORE the conjugated verb in French (unlike English where they come after).',
    rules: [
      {
        title: 'Direct Object Pronouns',
        formula: 'me, te, le/la, nous, vous, les',
        explanation: 'Replace the direct object (the thing/person directly receiving the action). Answer: verb + what/whom?',
        examples: [
          { french: 'Je vois le chat. → Je le vois.', english: 'I see the cat. → I see it.' },
          { french: 'Elle aime ses parents. → Elle les aime.', english: 'She loves her parents. → She loves them.' },
          { french: "Tu me comprends ?", english: 'Do you understand me?' },
        ],
      },
      {
        title: 'Indirect Object Pronouns',
        formula: 'me, te, lui, nous, vous, leur',
        explanation: 'Replace the indirect object (to whom/for whom the action is done). The verb usually takes "à" before the noun.',
        examples: [
          { french: 'Je parle à Marie. → Je lui parle.', english: 'I talk to Marie. → I talk to her.' },
          { french: 'Il donne le livre aux enfants. → Il leur donne le livre.', english: 'He gives the book to the kids. → He gives them the book.' },
        ],
      },
      {
        title: 'Placement Before the Verb',
        formula: 'Subject + pronoun + verb',
        explanation: 'Object pronouns go BEFORE the conjugated verb. In compound tenses, they go before the auxiliary.',
        examples: [
          { french: 'Je le mange. (present)', english: 'I eat it.' },
          { french: "Je l'ai mangé. (passé composé)", english: 'I ate it.' },
          { french: 'Je vais le manger. (near future)', english: "I'm going to eat it." },
        ],
      },
      {
        title: 'In Negative Sentences',
        formula: 'Subject + ne + pronoun + verb + pas',
        explanation: 'The pronoun stays glued before the verb, inside the ne...pas sandwich.',
        examples: [
          { french: 'Je ne le vois pas.', english: "I don't see it." },
          { french: "Elle ne lui parle pas.", english: "She doesn't talk to him/her." },
        ],
      },
    ],
    tips: [
      'Le/la/les (direct) answer "what/whom?" — Lui/leur (indirect) answer "to whom?"',
      'Common verbs that take indirect objects: parler à, donner à, dire à, téléphoner à, demander à.',
      'With infinitives, the pronoun goes before the infinitive: "Je veux le voir" (I want to see it).',
    ],
  },
  {
    id: 'y-en',
    title: 'Pronouns Y & En',
    shortDescription: 'Replacing places, à + noun, de + noun, quantities',
    tier: 2,
    order: 2,
    introduction: 'Y and en are adverbial pronouns that replace prepositional phrases. Y replaces à + thing/place, and en replaces de + thing or quantities.',
    rules: [
      {
        title: 'Y — Replacing à + noun / places',
        formula: 'Y replaces à + thing (not a person) or a place',
        explanation: 'Y means "there" or replaces "à + something." It goes before the verb like other pronouns.',
        examples: [
          { french: 'Je vais à Paris. → J\'y vais.', english: "I'm going to Paris. → I'm going there." },
          { french: 'Elle pense à son travail. → Elle y pense.', english: "She thinks about her work. → She thinks about it." },
          { french: 'Tu vas au cinéma ? — Oui, j\'y vais.', english: "Are you going to the cinema? — Yes, I'm going (there)." },
        ],
      },
      {
        title: 'En — Replacing de + noun',
        formula: 'En replaces de + thing or partitive articles (du, de la, des)',
        explanation: 'En means "of it/them" or "some." It replaces any noun introduced by de, du, de la, des, or a number/quantity.',
        examples: [
          { french: "J'ai du pain. → J'en ai.", english: 'I have bread. → I have some.' },
          { french: 'Elle parle de son voyage. → Elle en parle.', english: "She talks about her trip. → She talks about it." },
          { french: "J'ai trois chats. → J'en ai trois.", english: 'I have three cats. → I have three (of them).' },
        ],
      },
      {
        title: 'En with Quantities',
        explanation: 'When replacing a noun with a quantity, en is required and the number stays at the end.',
        examples: [
          { french: 'Tu veux combien de pommes ? — J\'en veux cinq.', english: 'How many apples do you want? — I want five (of them).' },
          { french: "Il a beaucoup d'amis. → Il en a beaucoup.", english: 'He has many friends. → He has many (of them).' },
        ],
      },
    ],
    tips: [
      'Y and en never refer to people — use lui/leur for people with "à" and de + stress pronoun for people with "de."',
      'The expression "il y a" (there is/are) contains "y" — "Il y en a" means "there is/are some."',
      'In commands, y and en come after the verb with a hyphen: "Vas-y !" (Go ahead!), "Prends-en !" (Take some!).',
    ],
  },
  {
    id: 'adverbs',
    title: 'Adverbs',
    shortDescription: 'Formation with -ment, placement, irregulars',
    tier: 2,
    order: 3,
    introduction: 'Adverbs modify verbs, adjectives, or other adverbs. Many are formed from adjectives by adding -ment (like English -ly). Their placement in French differs from English.',
    rules: [
      {
        title: 'Regular Formation',
        formula: 'Feminine adjective + -ment',
        explanation: 'Take the feminine form of the adjective and add -ment.',
        examples: [
          { french: 'lent → lente → lentement', english: 'slow → slowly' },
          { french: 'heureux → heureuse → heureusement', english: 'happy → happily/fortunately' },
          { french: 'doux → douce → doucement', english: 'soft → softly' },
        ],
      },
      {
        title: 'Special Formations',
        explanation: 'Adjectives ending in a vowel use the masculine form. Adjectives ending in -ent/-ant have special adverb forms.',
        examples: [
          { french: 'vrai → vraiment (not "vraie-ment")', english: 'true → truly' },
          { french: 'patient → patiemment (-ent → -emment)', english: 'patient → patiently' },
          { french: 'constant → constamment (-ant → -amment)', english: 'constant → constantly' },
        ],
      },
      {
        title: 'Common Irregular Adverbs',
        explanation: 'These high-frequency adverbs don\'t follow the -ment pattern.',
        examples: [
          { french: 'bien (bon → bien)', english: 'well' },
          { french: 'mal (mauvais → mal)', english: 'badly' },
          { french: 'vite', english: 'quickly (not from an adjective)' },
          { french: 'beaucoup, peu, trop, assez', english: 'a lot, little, too much, enough' },
        ],
      },
      {
        title: 'Adverb Placement',
        explanation: 'Short common adverbs go after the conjugated verb. In compound tenses, they usually go between the auxiliary and past participle.',
        examples: [
          { french: 'Elle parle bien français.', english: 'She speaks French well.' },
          { french: "J'ai beaucoup mangé.", english: "I ate a lot. (between aux. and p.p.)" },
          { french: 'Il a bien dormi.', english: 'He slept well.' },
        ],
      },
    ],
    tips: [
      '"Bon" is an adjective (modifies nouns), "bien" is an adverb (modifies verbs): "un bon repas" vs "elle chante bien."',
      'Long adverbs ending in -ment usually go after the past participle: "Elle a parlé lentement."',
      '"Très" (very) modifies adjectives and adverbs, "beaucoup" (a lot) modifies verbs: "très grand" but "mange beaucoup."',
    ],
  },
  {
    id: 'comparatives-superlatives',
    title: 'Comparatives & Superlatives',
    shortDescription: 'Comparing with plus, moins, aussi...que',
    tier: 2,
    order: 4,
    introduction: 'French uses "plus" (more), "moins" (less), and "aussi" (as) to compare things. Unlike English, French doesn\'t add -er/-est endings to adjectives.',
    rules: [
      {
        title: 'Comparatives with Adjectives',
        formula: 'plus/moins/aussi + adjective + que',
        explanation: 'The adjective still agrees with the first noun being compared.',
        examples: [
          { french: 'Marie est plus grande que Paul.', english: 'Marie is taller than Paul.' },
          { french: 'Ce film est moins intéressant que le livre.', english: 'This movie is less interesting than the book.' },
          { french: 'Elle est aussi intelligente que lui.', english: 'She is as intelligent as him.' },
        ],
      },
      {
        title: 'Comparatives with Verbs and Nouns',
        formula: 'verb + plus/moins/autant (que) / plus de/moins de/autant de + noun',
        explanation: 'Use "autant" (not "aussi") after verbs. Use "de" before nouns.',
        examples: [
          { french: 'Il travaille plus que moi.', english: 'He works more than me.' },
          { french: "J'ai plus de livres que toi.", english: 'I have more books than you.' },
          { french: 'Elle mange autant que son frère.', english: 'She eats as much as her brother.' },
        ],
      },
      {
        title: 'Superlatives',
        formula: 'le/la/les plus/moins + adjective (+ de + group)',
        explanation: 'Add the definite article before plus/moins. "De" means "in/of" with the group being compared.',
        examples: [
          { french: "C'est le plus grand bâtiment de la ville.", english: "It's the tallest building in the city." },
          { french: 'Elle est la moins timide de la classe.', english: 'She is the least shy in the class.' },
        ],
      },
      {
        title: 'Irregular Comparatives',
        explanation: '"Bon" and "mauvais" have irregular comparative/superlative forms, similar to English good/better/best.',
        examples: [
          { french: 'bon → meilleur(e) → le/la meilleur(e)', english: 'good → better → the best' },
          { french: 'mauvais → pire (or plus mauvais) → le/la pire', english: 'bad → worse → the worst' },
          { french: 'bien → mieux → le mieux', english: 'well → better → the best (adverb)' },
        ],
      },
    ],
    tips: [
      'Never say "plus bon" — always use "meilleur." But "plus mauvais" is acceptable alongside "pire."',
      '"Meilleur" is an adjective (agrees in gender/number). "Mieux" is an adverb (invariable).',
      'In superlatives, if the adjective normally goes after the noun, the article repeats: "la fille la plus intelligente."',
    ],
  },
  {
    id: 'passe-compose-rules',
    title: 'Passé Composé Rules',
    shortDescription: 'Avoir vs être and past participle agreement',
    tier: 2,
    order: 5,
    introduction: 'The passé composé is formed with an auxiliary (avoir or être) + past participle. The tricky parts are knowing which auxiliary to use and when the past participle must agree.',
    rules: [
      {
        title: 'Formation',
        formula: 'Subject + auxiliary (avoir/être) + past participle',
        explanation: 'Most verbs use avoir. A small group of intransitive verbs (mostly movement/change of state) and all reflexive verbs use être.',
        examples: [
          { french: "J'ai mangé une pomme.", english: 'I ate an apple. (avoir)' },
          { french: 'Elle est partie hier.', english: 'She left yesterday. (être)' },
          { french: 'Nous nous sommes levés tôt.', english: 'We got up early. (reflexive → être)' },
        ],
      },
      {
        title: 'DR MRS VANDERTRAMP — Être Verbs',
        formula: 'Devenir, Revenir, Monter, Retourner, Sortir, Venir, Aller, Naître, Descendre, Entrer, Rentrer, Tomber, Rester, Arriver, Mourir, Partir',
        explanation: 'These verbs (and their compounds) use être. With être, the past participle agrees with the SUBJECT.',
        examples: [
          { french: 'Elle est allée au marché.', english: 'She went to the market. (allée: feminine agreement)' },
          { french: 'Ils sont venus hier.', english: 'They came yesterday. (venus: masculine plural)' },
          { french: 'Elles sont parties tôt.', english: 'They left early. (parties: feminine plural)' },
        ],
      },
      {
        title: 'Past Participle Agreement with Être',
        formula: 'Add -e for feminine, -s for plural, -es for feminine plural',
        explanation: 'When using être, the past participle agrees with the subject in gender and number.',
        examples: [
          { french: 'Il est arrivé. / Elle est arrivée.', english: 'He arrived. / She arrived.' },
          { french: 'Ils sont arrivés. / Elles sont arrivées.', english: 'They (m.) arrived. / They (f.) arrived.' },
        ],
      },
      {
        title: 'No Agreement with Avoir (usually)',
        explanation: 'With avoir, the past participle normally does NOT agree with the subject. It only agrees with a preceding direct object (covered in Advanced).',
        examples: [
          { french: 'Elle a mangé une pomme. (no agreement)', english: 'She ate an apple.' },
          { french: 'Ils ont fini le travail. (no agreement)', english: 'They finished the work.' },
        ],
      },
    ],
    tips: [
      'A mnemonic for être verbs: imagine a house — you go in (entrer), go out (sortir), go up (monter), go down (descendre), etc.',
      'Some DR MRS VANDERTRAMP verbs can take direct objects, and then they switch to avoir: "Elle a monté les valises" (She carried up the suitcases).',
      'All reflexive verbs use être: "Je me suis lavé(e)."',
    ],
  },
  {
    id: 'imparfait-vs-pc',
    title: 'Imparfait vs Passé Composé',
    shortDescription: 'When to use each past tense',
    tier: 2,
    order: 6,
    introduction: 'French uses two main past tenses that don\'t map neatly to English. The imparfait describes ongoing/habitual past actions (background). The passé composé describes completed, specific past actions (events).',
    rules: [
      {
        title: 'Imparfait — Background & Habits',
        explanation: 'Use for: ongoing states, habitual actions, descriptions, emotions/weather in the past, age, time. Think "was doing" or "used to do."',
        examples: [
          { french: 'Quand j\'étais petit, je jouais au foot.', english: 'When I was little, I used to play soccer.' },
          { french: 'Il faisait beau et les oiseaux chantaient.', english: 'The weather was nice and the birds were singing.' },
          { french: 'Elle avait vingt ans.', english: 'She was twenty years old.' },
        ],
      },
      {
        title: 'Passé Composé — Completed Events',
        explanation: 'Use for: specific completed actions, actions with clear start/end, sequences of events, interruptions. Think "did" or "has done."',
        examples: [
          { french: 'Hier, j\'ai mangé au restaurant.', english: 'Yesterday, I ate at a restaurant.' },
          { french: 'Elle a lu le livre en deux jours.', english: 'She read the book in two days.' },
          { french: 'Nous sommes partis à huit heures.', english: 'We left at eight o\'clock.' },
        ],
      },
      {
        title: 'Using Both Together',
        formula: 'Imparfait (background) + Passé composé (event/interruption)',
        explanation: 'In storytelling, imparfait sets the scene while passé composé narrates the events.',
        examples: [
          { french: 'Je dormais quand le téléphone a sonné.', english: 'I was sleeping when the phone rang.' },
          { french: 'Il pleuvait, alors j\'ai pris un taxi.', english: 'It was raining, so I took a taxi.' },
        ],
      },
      {
        title: 'Signal Words',
        explanation: 'Certain words tend to trigger one tense or the other.',
        examples: [
          { french: 'Imparfait: toujours, souvent, chaque jour, d\'habitude, quand j\'étais...', english: 'always, often, every day, usually, when I was...' },
          { french: 'Passé composé: hier, soudain, tout à coup, une fois, à ce moment-là', english: 'yesterday, suddenly, all of a sudden, once, at that moment' },
        ],
      },
    ],
    tips: [
      'Think of a movie: imparfait is the scenery/background music, passé composé is the action/dialogue.',
      'With "être" and "avoir," imparfait is almost always the right choice for descriptions: "j\'étais fatigué" (I was tired).',
      'If you can say "used to" or "was ...ing" in English, it\'s likely imparfait.',
    ],
  },
  {
    id: 'relative-pronouns',
    title: 'Relative Pronouns',
    shortDescription: 'qui, que, où, dont — connecting clauses',
    tier: 2,
    order: 7,
    introduction: 'Relative pronouns connect two sentences about the same thing into one. They introduce a relative clause that gives more information about a noun.',
    rules: [
      {
        title: 'Qui — Subject of the clause',
        formula: 'noun + qui + verb',
        explanation: '"Qui" replaces the subject of the relative clause. It\'s followed directly by a verb.',
        examples: [
          { french: "L'homme qui parle est mon père.", english: 'The man who is speaking is my father.' },
          { french: 'Le livre qui est sur la table est à moi.', english: 'The book that is on the table is mine.' },
        ],
      },
      {
        title: 'Que — Direct object of the clause',
        formula: 'noun + que + subject + verb',
        explanation: '"Que" (qu\' before vowels) replaces the direct object. It\'s followed by a subject + verb.',
        examples: [
          { french: 'Le film que j\'ai vu était excellent.', english: 'The movie that I saw was excellent.' },
          { french: 'La femme que tu connais est médecin.', english: 'The woman (whom) you know is a doctor.' },
        ],
      },
      {
        title: 'Où — Place or time',
        explanation: '"Où" replaces a place or a moment in time.',
        examples: [
          { french: 'La ville où j\'habite est petite.', english: 'The city where I live is small.' },
          { french: 'Le jour où il est arrivé, il pleuvait.', english: 'The day (when) he arrived, it was raining.' },
        ],
      },
      {
        title: 'Dont — "of which/whose"',
        explanation: '"Dont" replaces "de + noun." Used with verbs/expressions that take "de" (parler de, avoir besoin de, etc.).',
        examples: [
          { french: "Le livre dont j'ai besoin est cher.", english: 'The book (that) I need is expensive. (avoir besoin de)' },
          { french: "C'est la fille dont le père est acteur.", english: "That's the girl whose father is an actor." },
        ],
      },
    ],
    tips: [
      'Quick test: if you can drop the pronoun in English ("the book I read" = "the book THAT I read"), it\'s "que" in French.',
      '"Qui" is never shortened before a vowel. "Que" becomes "qu\'" before a vowel.',
      'After "que," the past participle may need to agree (advanced rule): "la pomme que j\'ai mangéE."',
    ],
  },
  {
    id: 'asking-questions',
    title: 'Asking Questions',
    shortDescription: 'Inversion, est-ce que, question words',
    tier: 2,
    order: 8,
    introduction: 'French has three main ways to ask yes/no questions (intonation, est-ce que, inversion) and uses specific interrogative words for information questions.',
    rules: [
      {
        title: 'Three Ways to Ask Yes/No Questions',
        explanation: 'From most casual to most formal.',
        examples: [
          { french: 'Tu viens ? (intonation)', english: 'You\'re coming? (casual)' },
          { french: 'Est-ce que tu viens ? (est-ce que)', english: 'Are you coming? (standard)' },
          { french: 'Viens-tu ? (inversion)', english: 'Are you coming? (formal)' },
        ],
      },
      {
        title: 'Inversion',
        formula: 'Verb-subject pronoun (with hyphen)',
        explanation: 'Swap the verb and subject pronoun and connect with a hyphen. If the verb ends in a vowel and the pronoun starts with one, add -t-.',
        examples: [
          { french: 'Parlez-vous français ?', english: 'Do you speak French?' },
          { french: 'A-t-il fini ?', english: 'Has he finished? (-t- added for pronunciation)' },
          { french: 'Où habite-t-elle ?', english: 'Where does she live?' },
        ],
      },
      {
        title: 'Question Words (Interrogatives)',
        explanation: 'These can be used with all three question structures.',
        examples: [
          { french: 'Qui ? / Que ? (Qu\'est-ce que ?)', english: 'Who? / What?' },
          { french: 'Où ? / Quand ? / Comment ?', english: 'Where? / When? / How?' },
          { french: 'Pourquoi ? / Combien ?', english: 'Why? / How much/many?' },
          { french: 'Quel(le)(s) + noun ?', english: 'Which/what + noun?' },
        ],
      },
      {
        title: 'Quel — Which/What',
        formula: 'quel (m.s.) / quelle (f.s.) / quels (m.pl.) / quelles (f.pl.)',
        explanation: '"Quel" agrees with the noun it modifies. It can be an adjective or used with être.',
        examples: [
          { french: 'Quelle heure est-il ?', english: 'What time is it?' },
          { french: 'Quels livres préfères-tu ?', english: 'Which books do you prefer?' },
          { french: 'Quel est ton nom ?', english: 'What is your name?' },
        ],
      },
    ],
    tips: [
      'In everyday speech, French people mostly use intonation or est-ce que. Save inversion for writing and formal speech.',
      '"Qu\'est-ce que" is the most common way to say "what" in questions: "Qu\'est-ce que tu fais ?" (What are you doing?)',
      'With inversion and "il/elle/on," always add -t- between a vowel-ending verb and the pronoun: "Mange-t-il ?" (not "Mange-il ?")',
    ],
  },

  // === TIER 3: ADVANCED ===
  {
    id: 'subjunctive-triggers',
    title: 'Subjunctive Triggers',
    shortDescription: 'When and why to use the subjunctive mood',
    tier: 3,
    order: 1,
    introduction: 'The subjunctive is a verb mood (not a tense) used after certain expressions of desire, doubt, emotion, necessity, and opinion. It appears in the subordinate clause after "que."',
    rules: [
      {
        title: 'When to Use Subjunctive',
        formula: 'Expression + que + subject + subjunctive verb',
        explanation: 'The subjunctive is required after expressions of: wanting/wishing, emotion, doubt, necessity, and certain conjunctions.',
        examples: [
          { french: 'Je veux que tu viennes.', english: 'I want you to come. (wanting)' },
          { french: "Je suis content qu'elle soit là.", english: "I'm happy she's here. (emotion)" },
          { french: 'Il faut que nous partions.', english: 'We must leave. (necessity)' },
        ],
      },
      {
        title: 'Common Subjunctive Triggers',
        explanation: 'Key expressions that require the subjunctive.',
        examples: [
          { french: 'vouloir que, souhaiter que, désirer que', english: 'to want, to wish, to desire (that)' },
          { french: 'il faut que, il est nécessaire que, il est important que', english: "it's necessary, it's important (that)" },
          { french: "avoir peur que, être content que, être triste que, être surpris que, c'est dommage que", english: 'to be afraid, happy, sad, surprised, it\'s a shame (that)' },
          { french: "douter que, ne pas penser que, il est possible que, il n'est pas sûr que", english: 'to doubt, not to think, it\'s possible, it\'s not sure (that)' },
        ],
      },
      {
        title: 'Conjunctions Requiring Subjunctive',
        explanation: 'Certain conjunctions always take the subjunctive.',
        examples: [
          { french: 'bien que / quoique', english: 'although' },
          { french: 'pour que / afin que', english: 'so that / in order that' },
          { french: 'avant que', english: 'before' },
          { french: 'à moins que', english: 'unless' },
        ],
      },
      {
        title: 'When NOT to Use Subjunctive',
        explanation: 'Use indicative (normal mood) after expressions of certainty and belief.',
        examples: [
          { french: 'Je pense qu\'il vient. (indicative)', english: 'I think he\'s coming. (certainty)' },
          { french: 'Je sais qu\'elle est là. (indicative)', english: "I know she's here. (certainty)" },
          { french: "Il est certain qu'il viendra. (indicative)", english: "It's certain he'll come." },
        ],
      },
    ],
    tips: [
      'If the subject is the same in both clauses, use an infinitive instead: "Je veux partir" (I want to leave) NOT "Je veux que je parte."',
      '"Penser que" and "croire que" take indicative in affirmative but subjunctive in negative: "Je ne pense pas qu\'il vienne."',
      '"Après que" takes the indicative (not subjunctive!) even though "avant que" takes subjunctive.',
    ],
  },
  {
    id: 'si-clauses',
    title: 'Conditional Sentences (Si Clauses)',
    shortDescription: 'If...then patterns with si + tense combinations',
    tier: 3,
    order: 2,
    introduction: 'French "si" (if) clauses follow strict tense patterns. The tense in the "si" clause determines which tense to use in the result clause.',
    rules: [
      {
        title: 'Type 1: Real/Likely Condition',
        formula: 'Si + présent → futur simple (or présent)',
        explanation: 'For conditions that are likely or possible. The result will happen if the condition is met.',
        examples: [
          { french: "Si tu étudies, tu réussiras.", english: 'If you study, you will succeed.' },
          { french: "S'il pleut, nous restons à la maison.", english: "If it rains, we stay home." },
        ],
      },
      {
        title: 'Type 2: Hypothetical/Unlikely Condition',
        formula: 'Si + imparfait → conditionnel présent',
        explanation: 'For imaginary or unlikely situations in the present/future.',
        examples: [
          { french: "Si j'avais de l'argent, j'achèterais une voiture.", english: 'If I had money, I would buy a car.' },
          { french: 'Si elle était là, elle serait contente.', english: 'If she were here, she would be happy.' },
        ],
      },
      {
        title: 'Type 3: Impossible/Past Condition',
        formula: 'Si + plus-que-parfait → conditionnel passé',
        explanation: 'For conditions that can no longer be fulfilled — things that didn\'t happen in the past.',
        examples: [
          { french: "Si j'avais étudié, j'aurais réussi.", english: 'If I had studied, I would have succeeded.' },
          { french: "S'il était venu, il aurait vu.", english: 'If he had come, he would have seen.' },
        ],
      },
    ],
    tips: [
      'NEVER put futur or conditionnel after "si": "Si je serais..." is ALWAYS wrong.',
      '"Si" becomes "s\'" only before "il" and "ils," not before "elle" or other words.',
      'You can mix Type 2 and 3: "Si j\'avais étudié (past), je serais prêt maintenant (present result)."',
    ],
  },
  {
    id: 'passive-voice',
    title: 'Passive Voice',
    shortDescription: 'Formation with être + past participle',
    tier: 3,
    order: 3,
    introduction: 'The passive voice emphasizes the action or its recipient rather than who performs it. It\'s formed with être + past participle, and the agent (doer) is introduced by "par."',
    rules: [
      {
        title: 'Formation',
        formula: 'Subject + être (conjugated) + past participle (+ par + agent)',
        explanation: 'The past participle agrees with the subject. Être is conjugated in whatever tense is needed.',
        examples: [
          { french: 'Le gâteau est mangé par les enfants.', english: 'The cake is eaten by the children. (present)' },
          { french: 'La lettre a été envoyée hier.', english: 'The letter was sent yesterday. (passé composé)' },
          { french: 'Le livre sera publié en mars.', english: 'The book will be published in March. (future)' },
        ],
      },
      {
        title: 'Avoiding the Passive',
        explanation: 'French prefers active voice or uses "on" to avoid passive constructions, especially in speech.',
        examples: [
          { french: 'On parle français ici. (instead of: Le français est parlé ici.)', english: 'French is spoken here.' },
          { french: 'On a volé mon sac. (instead of: Mon sac a été volé.)', english: 'My bag was stolen.' },
        ],
      },
      {
        title: 'Par vs De',
        explanation: 'Most agents use "par," but some verbs of emotion/state use "de."',
        examples: [
          { french: 'Il est aimé de tous.', english: 'He is loved by everyone. (emotion → de)' },
          { french: 'La ville est entourée de montagnes.', english: 'The city is surrounded by mountains. (state → de)' },
          { french: 'Le voleur a été arrêté par la police.', english: 'The thief was arrested by the police. (action → par)' },
        ],
      },
    ],
    tips: [
      'Only transitive verbs (verbs that take a direct object) can be made passive.',
      'French uses "on" much more than English uses passive. "On dit que..." = "It is said that..."',
      'Don\'t confuse passive with passé composé using être: "Elle est partie" (she left) is NOT passive.',
    ],
  },
  {
    id: 'direct-indirect-speech',
    title: 'Direct & Indirect Speech',
    shortDescription: 'Reporting what someone said, tense shifting',
    tier: 3,
    order: 4,
    introduction: 'Direct speech quotes someone\'s exact words. Indirect speech reports what was said, requiring changes in pronouns, tenses, and time expressions.',
    rules: [
      {
        title: 'Direct → Indirect Statements',
        formula: 'Subject + dire que + shifted tense',
        explanation: 'When the reporting verb (dire, expliquer, etc.) is in the past, the tense shifts back.',
        examples: [
          { french: 'Il dit : « Je suis fatigué. » → Il dit qu\'il est fatigué.', english: 'He says: "I am tired." → He says (that) he is tired. (present → no change)' },
          { french: 'Il a dit : « Je suis fatigué. » → Il a dit qu\'il était fatigué.', english: 'He said: "I am tired." → He said (that) he was tired. (présent → imparfait)' },
        ],
      },
      {
        title: 'Tense Shifting Rules',
        explanation: 'When the main verb is in the past, tenses in the subordinate clause shift back.',
        examples: [
          { french: 'présent → imparfait', english: '"je mange" → qu\'il mangeait' },
          { french: 'passé composé → plus-que-parfait', english: '"j\'ai mangé" → qu\'il avait mangé' },
          { french: 'futur → conditionnel', english: '"je mangerai" → qu\'il mangerait' },
        ],
      },
      {
        title: 'Indirect Questions',
        formula: 'demander si (yes/no) / demander + question word',
        explanation: 'Yes/no questions become "si" clauses. Information questions keep the question word but use statement word order.',
        examples: [
          { french: '« Tu viens ? » → Il demande si tu viens.', english: '"Are you coming?" → He asks if you\'re coming.' },
          { french: '« Où habites-tu ? » → Il demande où tu habites.', english: '"Where do you live?" → He asks where you live.' },
        ],
      },
      {
        title: 'Time Expression Changes',
        explanation: 'Time references shift when reporting past speech.',
        examples: [
          { french: 'aujourd\'hui → ce jour-là', english: 'today → that day' },
          { french: 'demain → le lendemain', english: 'tomorrow → the next day' },
          { french: 'hier → la veille', english: 'yesterday → the day before' },
        ],
      },
    ],
    tips: [
      'If the reporting verb is in the present tense, NO tense shift is needed: "Il dit qu\'il est content."',
      '"Que" is required in French indirect speech: "He said he was tired" = "Il a dit QU\'il était fatigué."',
      'The imperative becomes "de + infinitive" in indirect speech: "Pars !" → "Il m\'a dit de partir."',
    ],
  },
  {
    id: 'double-pronouns',
    title: 'Double Object Pronouns',
    shortDescription: 'Combining pronouns: order and placement',
    tier: 3,
    order: 5,
    introduction: 'When a sentence has both a direct and indirect object pronoun, they follow a strict order before the verb. This is one of French\'s trickiest grammar points.',
    rules: [
      {
        title: 'Pronoun Order Before the Verb',
        formula: 'me/te/se/nous/vous → le/la/les → lui/leur → y → en',
        explanation: 'When two pronouns appear, follow this left-to-right order. The first applicable pronoun comes first.',
        examples: [
          { french: 'Il me le donne.', english: 'He gives it to me. (me before le)' },
          { french: 'Je le lui ai dit.', english: 'I told it to him/her. (le before lui)' },
          { french: 'Elle nous les montre.', english: 'She shows them to us. (nous before les)' },
        ],
      },
      {
        title: 'With Y and En',
        explanation: 'Y and en always come last (before the verb), with en being the very last.',
        examples: [
          { french: "Il m'en donne.", english: 'He gives me some.' },
          { french: 'Je l\'y ai vu.', english: 'I saw him/her there.' },
          { french: 'Il y en a.', english: 'There are some.' },
        ],
      },
      {
        title: 'In Affirmative Commands',
        formula: 'Verb + le/la/les + moi/toi/lui/nous/vous/leur (+ y + en)',
        explanation: 'In positive imperatives, pronouns come AFTER the verb with hyphens, and the order changes.',
        examples: [
          { french: 'Donne-le-moi !', english: 'Give it to me!' },
          { french: 'Montrez-les-leur !', english: 'Show them to them!' },
          { french: 'Donnez-m\'en !', english: 'Give me some!' },
        ],
      },
      {
        title: 'In Negative Commands',
        explanation: 'In negative imperatives, pronouns return to their normal position before the verb.',
        examples: [
          { french: 'Ne me le donne pas !', english: "Don't give it to me!" },
          { french: 'Ne le lui dites pas !', english: "Don't tell it to him/her!" },
        ],
      },
    ],
    tips: [
      'You\'ll almost never see "lui/leur + y" or "lui/leur + en" together — French avoids these combinations and restructures the sentence.',
      'In affirmative commands, "me" becomes "moi" and "te" becomes "toi": "Donne-moi" (not "Donne-me").',
      'Practice the order as a chant: "me-te-se-nous-vous, le-la-les, lui-leur, y, en."',
    ],
  },
  {
    id: 'past-participle-agreement',
    title: 'Past Participle Agreement (Advanced)',
    shortDescription: 'Agreement with avoir and reflexive verbs',
    tier: 3,
    order: 6,
    introduction: 'Beyond the basic être agreement, the past participle also agrees with a preceding direct object when using avoir, and follows specific rules with reflexive verbs.',
    rules: [
      {
        title: 'Agreement with Preceding Direct Object (Avoir)',
        formula: 'When the direct object comes BEFORE avoir + p.p., the p.p. agrees with it',
        explanation: 'This happens with: direct object pronouns (le/la/les), "que" in relative clauses, and "quel/combien" in questions.',
        examples: [
          { french: 'La pomme ? Je l\'ai mangéE.', english: 'The apple? I ate it. (la → feminine agreement)' },
          { french: 'Les lettres que j\'ai écritES.', english: 'The letters that I wrote. (les lettres → feminine plural)' },
          { french: 'Combien de pommes as-tu achetéES ?', english: 'How many apples did you buy?' },
        ],
      },
      {
        title: 'Reflexive Verb Agreement',
        explanation: 'With reflexive verbs (always use être), the past participle agrees with the reflexive pronoun IF it\'s a direct object.',
        examples: [
          { french: 'Elle s\'est lavéE. (se = direct object)', english: 'She washed herself.' },
          { french: 'Ils se sont regardéS.', english: 'They looked at each other.' },
          { french: 'Elle s\'est lavé les mains. (les mains = direct object, so no agreement on lavé)', english: 'She washed her hands.' },
        ],
      },
      {
        title: 'When the Reflexive Pronoun is Indirect',
        explanation: 'If the reflexive pronoun is an indirect object, there\'s NO agreement. This happens when there\'s another direct object in the sentence.',
        examples: [
          { french: 'Elles se sont téléphoné. (téléphoner à → se = indirect)', english: 'They called each other. (no agreement)' },
          { french: 'Ils se sont parlé. (parler à → se = indirect)', english: 'They spoke to each other. (no agreement)' },
          { french: 'Elle s\'est acheté une robe. (une robe = direct object)', english: 'She bought herself a dress. (no agreement on acheté)' },
        ],
      },
    ],
    tips: [
      'The avoir agreement rule only applies when the direct object comes BEFORE the verb. "J\'ai mangé les pommes" → no agreement (object after verb).',
      'To check if a reflexive pronoun is direct or indirect, ask: "[verb] + qui/quoi?" If the answer is the reflexive pronoun, it\'s direct.',
      'This rule is tested heavily in French exams but is often ignored in casual speech and writing.',
    ],
  },
  {
    id: 'conjunctions',
    title: 'Conjunctions & Complex Sentences',
    shortDescription: 'Coordinating and subordinating conjunctions',
    tier: 3,
    order: 7,
    introduction: 'Conjunctions connect words, phrases, or clauses. Mastering them allows you to build complex, nuanced French sentences.',
    rules: [
      {
        title: 'Coordinating Conjunctions',
        formula: 'mais, ou, et, donc, or, ni, car',
        explanation: 'These connect equal elements (two nouns, two clauses, etc.). Remember the mnemonic: "Mais où est donc Ornicar?"',
        examples: [
          { french: 'Je suis fatigué mais content.', english: 'I am tired but happy.' },
          { french: "Tu veux du thé ou du café ?", english: 'Do you want tea or coffee?' },
          { french: 'Il pleut, donc je prends un parapluie.', english: "It's raining, so I'm taking an umbrella." },
          { french: 'Il ne mange ni viande ni poisson.', english: 'He eats neither meat nor fish.' },
        ],
      },
      {
        title: 'Common Subordinating Conjunctions',
        explanation: 'These introduce dependent clauses and take the indicative (unless noted).',
        examples: [
          { french: 'parce que / car / puisque', english: 'because / because / since (reason)' },
          { french: 'quand / lorsque / pendant que / tandis que', english: 'when / when / while / whereas' },
          { french: 'si / comme', english: 'if / as' },
          { french: 'après que / dès que / aussitôt que', english: 'after / as soon as' },
        ],
      },
      {
        title: 'Conjunctions Taking Subjunctive',
        explanation: 'These subordinating conjunctions require the subjunctive mood in the clause they introduce.',
        examples: [
          { french: 'bien que / quoique (although)', english: 'Bien qu\'il soit malade, il travaille. — Although he is sick, he works.' },
          { french: 'pour que / afin que (so that)', english: "Je parle lentement pour qu'il comprenne. — I speak slowly so he understands." },
          { french: 'avant que (before) / sans que (without)', english: "Pars avant qu'il ne pleuve. — Leave before it rains." },
        ],
      },
      {
        title: 'Building Complex Sentences',
        explanation: 'Combine multiple clauses to create sophisticated French sentences.',
        examples: [
          { french: 'Comme il faisait beau, nous sommes sortis, mais il a commencé à pleuvoir dès que nous sommes arrivés.', english: 'As the weather was nice, we went out, but it started raining as soon as we arrived.' },
          { french: "Bien qu'elle soit fatiguée, elle continue à travailler parce qu'elle veut finir avant ce soir.", english: 'Although she is tired, she keeps working because she wants to finish before tonight.' },
        ],
      },
    ],
    tips: [
      '"Parce que" answers "pourquoi?" (gives the reason). "Puisque" states a known/obvious reason. "Car" is formal/written.',
      '"Pendant que" is neutral (while/during). "Tandis que" implies contrast (whereas/while on the other hand).',
      'After "dès que" and "aussitôt que," use futur when English uses present: "Dès qu\'il arrivera" (As soon as he arrives).',
    ],
  },
  {
    id: 'formal-informal',
    title: 'Formal vs Informal Register',
    shortDescription: 'Tu/vous, formal constructions, written vs spoken',
    tier: 3,
    order: 8,
    introduction: 'French has a clear distinction between formal and informal language. Knowing when to use each register is essential for social situations, professional contexts, and understanding authentic French.',
    rules: [
      {
        title: 'Tu vs Vous',
        explanation: '"Tu" (tutoyer) is for informal relationships. "Vous" (vouvoyer) is for formal, respectful, or distant relationships.',
        examples: [
          { french: 'Tu veux un café ? (friend)', english: 'Do you want a coffee?' },
          { french: 'Voulez-vous un café ? (boss, stranger)', english: 'Would you like a coffee?' },
          { french: 'On se tutoie ? (proposing to switch)', english: 'Shall we use tu with each other?' },
        ],
      },
      {
        title: 'Spoken vs Written French',
        explanation: 'Spoken French drops many elements that are required in writing.',
        examples: [
          { french: 'Written: Je ne sais pas. → Spoken: Je sais pas. / Ch\'ais pas.', english: 'I don\'t know. (ne often dropped in speech)' },
          { french: 'Written: Nous allons → Spoken: On va', english: 'We are going (on replaces nous)' },
          { french: 'Written: Il y a → Spoken: Y\'a', english: 'There is/are' },
        ],
      },
      {
        title: 'Formal Constructions',
        explanation: 'Certain structures are preferred in formal French.',
        examples: [
          { french: 'Formal: Pourriez-vous... / Auriez-vous l\'amabilité de...', english: 'Could you... / Would you be so kind as to...' },
          { french: 'Formal: Veuillez agréer... (letter closing)', english: 'Please accept... (formal letter ending)' },
          { french: 'Formal: Il convient de... / Il s\'avère que...', english: 'It is appropriate to... / It turns out that...' },
        ],
      },
      {
        title: 'Common Informal Expressions',
        explanation: 'Everyday spoken French uses many shortcuts and colloquial expressions.',
        examples: [
          { french: "C'est pas grave. (instead of: Ce n'est pas grave.)", english: "It's not a big deal." },
          { french: "T'as raison. (instead of: Tu as raison.)", english: "You're right." },
          { french: 'Faut y aller. (instead of: Il faut y aller.)', english: 'We gotta go.' },
        ],
      },
    ],
    tips: [
      'When in doubt, use "vous." It\'s never offensive to be too formal, but using "tu" with the wrong person can be.',
      'In professional emails, always use "vous" and formal constructions. In texts with friends, "tu" and informal is expected.',
      'Learn to understand spoken French shortcuts even if you don\'t use them — they\'re everywhere in movies, music, and daily life.',
    ],
  },
];
