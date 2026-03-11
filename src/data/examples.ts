import type { Example } from '../types';

export const examples: Example[] = [
  // être
  { verbId: "être", french: "Je suis étudiant.", english: "I am a student.", tense: "PRESENT" },
  { verbId: "être", french: "Il était fatigué hier.", english: "He was tired yesterday.", tense: "IMPARFAIT" },
  { verbId: "être", french: "Nous serons prêts demain.", english: "We will be ready tomorrow.", tense: "FUTUR" },

  // avoir
  { verbId: "avoir", french: "J'ai deux frères.", english: "I have two brothers.", tense: "PRESENT" },
  { verbId: "avoir", french: "Elle avait peur du noir.", english: "She was afraid of the dark.", tense: "IMPARFAIT" },
  { verbId: "avoir", french: "Tu auras le temps.", english: "You will have time.", tense: "FUTUR" },

  // faire
  { verbId: "faire", french: "Nous faisons la cuisine.", english: "We are cooking.", tense: "PRESENT" },
  { verbId: "faire", french: "Il a fait beau aujourd'hui.", english: "The weather was nice today.", tense: "PASSE_COMPOSE" },
  { verbId: "faire", french: "Je ferais un voyage.", english: "I would take a trip.", tense: "CONDITIONNEL_PRESENT" },

  // aller
  { verbId: "aller", french: "Je vais au marché.", english: "I go to the market.", tense: "PRESENT" },
  { verbId: "aller", french: "Nous sommes allés au cinéma.", english: "We went to the cinema.", tense: "PASSE_COMPOSE" },
  { verbId: "aller", french: "J'irai en France cet été.", english: "I will go to France this summer.", tense: "FUTUR" },

  // pouvoir
  { verbId: "pouvoir", french: "Je peux t'aider.", english: "I can help you.", tense: "PRESENT" },
  { verbId: "pouvoir", french: "Elle pouvait courir vite.", english: "She could run fast.", tense: "IMPARFAIT" },
  { verbId: "pouvoir", french: "Pourriez-vous m'aider ?", english: "Could you help me?", tense: "CONDITIONNEL_PRESENT" },

  // vouloir
  { verbId: "vouloir", french: "Je veux apprendre le français.", english: "I want to learn French.", tense: "PRESENT" },
  { verbId: "vouloir", french: "Il voudrait un café.", english: "He would like a coffee.", tense: "CONDITIONNEL_PRESENT" },

  // devoir
  { verbId: "devoir", french: "Tu dois étudier.", english: "You must study.", tense: "PRESENT" },
  { verbId: "devoir", french: "Nous devions partir tôt.", english: "We had to leave early.", tense: "IMPARFAIT" },

  // savoir
  { verbId: "savoir", french: "Je sais nager.", english: "I know how to swim.", tense: "PRESENT" },
  { verbId: "savoir", french: "Savais-tu la réponse ?", english: "Did you know the answer?", tense: "IMPARFAIT" },

  // dire
  { verbId: "dire", french: "Qu'est-ce que tu dis ?", english: "What are you saying?", tense: "PRESENT" },
  { verbId: "dire", french: "Il a dit la vérité.", english: "He told the truth.", tense: "PASSE_COMPOSE" },

  // venir
  { verbId: "venir", french: "Je viens de Paris.", english: "I come from Paris.", tense: "PRESENT" },
  { verbId: "venir", french: "Elle est venue hier.", english: "She came yesterday.", tense: "PASSE_COMPOSE" },

  // voir
  { verbId: "voir", french: "Je vois la mer.", english: "I see the sea.", tense: "PRESENT" },
  { verbId: "voir", french: "Nous avons vu un film.", english: "We saw a movie.", tense: "PASSE_COMPOSE" },

  // prendre
  { verbId: "prendre", french: "Je prends le bus.", english: "I take the bus.", tense: "PRESENT" },
  { verbId: "prendre", french: "Prenez votre temps.", english: "Take your time.", tense: "IMPERATIF" },

  // donner
  { verbId: "donner", french: "Elle donne des cours.", english: "She gives classes.", tense: "PRESENT" },
  { verbId: "donner", french: "Donne-moi le livre.", english: "Give me the book.", tense: "IMPERATIF" },

  // parler
  { verbId: "parler", french: "Nous parlons français.", english: "We speak French.", tense: "PRESENT" },
  { verbId: "parler", french: "Il parlait doucement.", english: "He was speaking softly.", tense: "IMPARFAIT" },

  // mettre
  { verbId: "mettre", french: "Je mets mon manteau.", english: "I put on my coat.", tense: "PRESENT" },
  { verbId: "mettre", french: "Elle a mis la table.", english: "She set the table.", tense: "PASSE_COMPOSE" },

  // trouver
  { verbId: "trouver", french: "Je trouve ça intéressant.", english: "I find that interesting.", tense: "PRESENT" },

  // aimer
  { verbId: "aimer", french: "J'aime la musique.", english: "I love music.", tense: "PRESENT" },
  { verbId: "aimer", french: "J'aimerais voyager.", english: "I would like to travel.", tense: "CONDITIONNEL_PRESENT" },

  // penser
  { verbId: "penser", french: "Je pense à toi.", english: "I think of you.", tense: "PRESENT" },

  // manger
  { verbId: "manger", french: "Nous mangeons ensemble.", english: "We eat together.", tense: "PRESENT" },
  { verbId: "manger", french: "J'ai mangé une pomme.", english: "I ate an apple.", tense: "PASSE_COMPOSE" },

  // boire
  { verbId: "boire", french: "Je bois de l'eau.", english: "I drink water.", tense: "PRESENT" },
  { verbId: "boire", french: "Nous avons bu du vin.", english: "We drank wine.", tense: "PASSE_COMPOSE" },

  // dormir
  { verbId: "dormir", french: "Il dort bien.", english: "He sleeps well.", tense: "PRESENT" },
  { verbId: "dormir", french: "J'ai dormi huit heures.", english: "I slept eight hours.", tense: "PASSE_COMPOSE" },

  // écrire
  { verbId: "écrire", french: "J'écris une lettre.", english: "I write a letter.", tense: "PRESENT" },
  { verbId: "écrire", french: "Il a écrit un livre.", english: "He wrote a book.", tense: "PASSE_COMPOSE" },

  // lire
  { verbId: "lire", french: "Elle lit un roman.", english: "She reads a novel.", tense: "PRESENT" },
  { verbId: "lire", french: "J'ai lu cet article.", english: "I read this article.", tense: "PASSE_COMPOSE" },

  // ouvrir
  { verbId: "ouvrir", french: "Ouvrez la fenêtre.", english: "Open the window.", tense: "IMPERATIF" },

  // fermer
  { verbId: "fermer", french: "Fermez la porte.", english: "Close the door.", tense: "IMPERATIF" },

  // finir
  { verbId: "finir", french: "Je finis mon travail.", english: "I finish my work.", tense: "PRESENT" },
  { verbId: "finir", french: "Nous avons fini le projet.", english: "We finished the project.", tense: "PASSE_COMPOSE" },

  // commencer
  { verbId: "commencer", french: "Le cours commence à neuf heures.", english: "The class starts at nine.", tense: "PRESENT" },

  // chercher
  { verbId: "chercher", french: "Je cherche mes clés.", english: "I'm looking for my keys.", tense: "PRESENT" },

  // comprendre
  { verbId: "comprendre", french: "Je comprends le français.", english: "I understand French.", tense: "PRESENT" },
  { verbId: "comprendre", french: "Il faut que tu comprennes.", english: "You need to understand.", tense: "SUBJONCTIF_PRESENT" },

  // attendre
  { verbId: "attendre", french: "J'attends le bus.", english: "I'm waiting for the bus.", tense: "PRESENT" },

  // entendre
  { verbId: "entendre", french: "J'entends de la musique.", english: "I hear music.", tense: "PRESENT" },

  // courir
  { verbId: "courir", french: "Il court tous les matins.", english: "He runs every morning.", tense: "PRESENT" },

  // vivre
  { verbId: "vivre", french: "Je vis à Paris.", english: "I live in Paris.", tense: "PRESENT" },
  { verbId: "vivre", french: "Il a vécu en France.", english: "He lived in France.", tense: "PASSE_COMPOSE" },

  // suivre
  { verbId: "suivre", french: "Je suis un cours de danse.", english: "I'm taking a dance class.", tense: "PRESENT" },

  // connaître
  { verbId: "connaître", french: "Je connais cette ville.", english: "I know this city.", tense: "PRESENT" },

  // sentir
  { verbId: "sentir", french: "Ça sent bon.", english: "That smells good.", tense: "PRESENT" },

  // partir
  { verbId: "partir", french: "Je pars demain.", english: "I'm leaving tomorrow.", tense: "PRESENT" },
  { verbId: "partir", french: "Nous sommes partis tôt.", english: "We left early.", tense: "PASSE_COMPOSE" },

  // sortir
  { verbId: "sortir", french: "Nous sortons ce soir.", english: "We're going out tonight.", tense: "PRESENT" },

  // tenir
  { verbId: "tenir", french: "Tiens ma main.", english: "Hold my hand.", tense: "IMPERATIF" },

  // conduire
  { verbId: "conduire", french: "Je conduis prudemment.", english: "I drive carefully.", tense: "PRESENT" },

  // recevoir
  { verbId: "recevoir", french: "J'ai reçu ta lettre.", english: "I received your letter.", tense: "PASSE_COMPOSE" },

  // envoyer
  { verbId: "envoyer", french: "J'envoie un message.", english: "I'm sending a message.", tense: "PRESENT" },

  // tomber
  { verbId: "tomber", french: "Il est tombé de l'arbre.", english: "He fell from the tree.", tense: "PASSE_COMPOSE" },

  // perdre
  { verbId: "perdre", french: "J'ai perdu mes clés.", english: "I lost my keys.", tense: "PASSE_COMPOSE" },

  // rire
  { verbId: "rire", french: "Nous rions ensemble.", english: "We laugh together.", tense: "PRESENT" },

  // pleurer
  { verbId: "pleurer", french: "Le bébé pleure.", english: "The baby is crying.", tense: "PRESENT" },

  // croire
  { verbId: "croire", french: "Je crois que oui.", english: "I believe so.", tense: "PRESENT" },

  // jouer
  { verbId: "jouer", french: "Les enfants jouent dehors.", english: "The children play outside.", tense: "PRESENT" },

  // chanter
  { verbId: "chanter", french: "Elle chante bien.", english: "She sings well.", tense: "PRESENT" },

  // danser
  { verbId: "danser", french: "Nous dansons la valse.", english: "We dance the waltz.", tense: "PRESENT" },

  // nager
  { verbId: "nager", french: "Je nage dans la mer.", english: "I swim in the sea.", tense: "PRESENT" },

  // voyager
  { verbId: "voyager", french: "J'aime voyager.", english: "I love to travel.", tense: "PRESENT" },

  // travailler
  { verbId: "travailler", french: "Je travaille à la maison.", english: "I work from home.", tense: "PRESENT" },

  // acheter
  { verbId: "acheter", french: "J'achète du pain.", english: "I buy bread.", tense: "PRESENT" },

  // payer
  { verbId: "payer", french: "Je paie l'addition.", english: "I pay the bill.", tense: "PRESENT" },

  // apprendre
  { verbId: "apprendre", french: "J'apprends le français.", english: "I'm learning French.", tense: "PRESENT" },

  // regarder
  { verbId: "regarder", french: "Nous regardons un film.", english: "We watch a movie.", tense: "PRESENT" },

  // marcher
  { verbId: "marcher", french: "Je marche dans le parc.", english: "I walk in the park.", tense: "PRESENT" },

  // arriver
  { verbId: "arriver", french: "Le train arrive à midi.", english: "The train arrives at noon.", tense: "PRESENT" },

  // rester
  { verbId: "rester", french: "Je reste à la maison.", english: "I stay at home.", tense: "PRESENT" },

  // devenir
  { verbId: "devenir", french: "Il devient médecin.", english: "He is becoming a doctor.", tense: "PRESENT" },

  // naître
  { verbId: "naître", french: "Je suis né en France.", english: "I was born in France.", tense: "PASSE_COMPOSE" },

  // mourir
  { verbId: "mourir", french: "La plante meurt de soif.", english: "The plant is dying of thirst.", tense: "PRESENT" },

  // appeler
  { verbId: "appeler", french: "J'appelle un taxi.", english: "I'm calling a taxi.", tense: "PRESENT" },

  // montrer
  { verbId: "montrer", french: "Montre-moi ta photo.", english: "Show me your photo.", tense: "IMPERATIF" },

  // demander
  { verbId: "demander", french: "Je demande de l'aide.", english: "I'm asking for help.", tense: "PRESENT" },

  // laisser
  { verbId: "laisser", french: "Laissez-moi tranquille.", english: "Leave me alone.", tense: "IMPERATIF" },

  // passer
  { verbId: "passer", french: "Le temps passe vite.", english: "Time passes quickly.", tense: "PRESENT" },

  // porter
  { verbId: "porter", french: "Elle porte une robe rouge.", english: "She wears a red dress.", tense: "PRESENT" },

  // répondre
  { verbId: "répondre", french: "Répondez à la question.", english: "Answer the question.", tense: "IMPERATIF" },

  // servir
  { verbId: "servir", french: "Le dîner est servi.", english: "Dinner is served.", tense: "PRESENT" },

  // plaire
  { verbId: "plaire", french: "Cette ville me plaît.", english: "I like this city.", tense: "PRESENT" },

  // descendre
  { verbId: "descendre", french: "Je descends l'escalier.", english: "I go down the stairs.", tense: "PRESENT" },

  // monter
  { verbId: "monter", french: "Nous montons au sommet.", english: "We climb to the top.", tense: "PRESENT" },

  // entrer
  { verbId: "entrer", french: "Entrez, s'il vous plaît.", english: "Come in, please.", tense: "IMPERATIF" },

  // craindre
  { verbId: "craindre", french: "Je crains le pire.", english: "I fear the worst.", tense: "PRESENT" },

  // choisir
  { verbId: "choisir", french: "Choisis ton dessert.", english: "Choose your dessert.", tense: "IMPERATIF" },
  { verbId: "choisir", french: "J'ai choisi le menu.", english: "I chose the menu.", tense: "PASSE_COMPOSE" },

  // réussir
  { verbId: "réussir", french: "Il a réussi son examen.", english: "He passed his exam.", tense: "PASSE_COMPOSE" },

  // grandir
  { verbId: "grandir", french: "Les enfants grandissent vite.", english: "Children grow up fast.", tense: "PRESENT" },

  // construire
  { verbId: "construire", french: "Nous construisons une maison.", english: "We are building a house.", tense: "PRESENT" },

  // produire
  { verbId: "produire", french: "La France produit du vin.", english: "France produces wine.", tense: "PRESENT" },

  // traduire
  { verbId: "traduire", french: "Je traduis ce texte.", english: "I translate this text.", tense: "PRESENT" },

  // détruire
  { verbId: "détruire", french: "L'ouragan a détruit la ville.", english: "The hurricane destroyed the city.", tense: "PASSE_COMPOSE" },

  // cuire
  { verbId: "cuire", french: "Le gâteau cuit au four.", english: "The cake bakes in the oven.", tense: "PRESENT" },

  // offrir
  { verbId: "offrir", french: "Je t'offre un cadeau.", english: "I'm giving you a gift.", tense: "PRESENT" },

  // découvrir
  { verbId: "découvrir", french: "J'ai découvert un restaurant.", english: "I discovered a restaurant.", tense: "PASSE_COMPOSE" },

  // souffrir
  { verbId: "souffrir", french: "Il souffre du dos.", english: "He suffers from back pain.", tense: "PRESENT" },

  // essayer
  { verbId: "essayer", french: "Essaie encore une fois.", english: "Try one more time.", tense: "IMPERATIF" },

  // permettre
  { verbId: "permettre", french: "Permettez-moi de parler.", english: "Allow me to speak.", tense: "IMPERATIF" },

  // promettre
  { verbId: "promettre", french: "Je promets de revenir.", english: "I promise to come back.", tense: "PRESENT" },

  // couper
  { verbId: "couper", french: "Coupe le pain.", english: "Cut the bread.", tense: "IMPERATIF" },

  // préparer
  { verbId: "préparer", french: "Je prépare le dîner.", english: "I'm preparing dinner.", tense: "PRESENT" },

  // expliquer
  { verbId: "expliquer", french: "Expliquez-moi le problème.", english: "Explain the problem to me.", tense: "IMPERATIF" },

  // changer
  { verbId: "changer", french: "Le monde change.", english: "The world changes.", tense: "PRESENT" },

  // décider
  { verbId: "décider", french: "Nous décidons ensemble.", english: "We decide together.", tense: "PRESENT" },

  // accepter
  { verbId: "accepter", french: "J'accepte votre invitation.", english: "I accept your invitation.", tense: "PRESENT" },

  // refuser
  { verbId: "refuser", french: "Il refuse de partir.", english: "He refuses to leave.", tense: "PRESENT" },

  // proposer
  { verbId: "proposer", french: "Je propose une solution.", english: "I suggest a solution.", tense: "PRESENT" },

  // organiser
  { verbId: "organiser", french: "Nous organisons une fête.", english: "We are organizing a party.", tense: "PRESENT" },

  // se lever
  { verbId: "se lever", french: "Je me lève tôt.", english: "I wake up early.", tense: "PRESENT" },

  // se coucher
  { verbId: "se coucher", french: "Il se couche tard.", english: "He goes to bed late.", tense: "PRESENT" },

  // se promener
  { verbId: "se promener", french: "Nous nous promenons dans le parc.", english: "We walk in the park.", tense: "PRESENT" },

  // se souvenir
  { verbId: "se souvenir", french: "Je me souviens de toi.", english: "I remember you.", tense: "PRESENT" },

  // s'asseoir
  { verbId: "s'asseoir", french: "Asseyez-vous.", english: "Sit down.", tense: "IMPERATIF" },
];
