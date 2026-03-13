// Conversation scenarios for French speaking practice
// Each scenario presents a real-life situation with guided dialogue exchanges

export interface DialogueLine {
  speaker: 'french' | 'user';
  french: string;
  english: string;
  hint?: string;
}

export interface ConversationScenario {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  dialogue: DialogueLine[];
  keyVerbs: string[];
}

export const conversationScenarios: ConversationScenario[] = [
  {
    id: 'cafe-order',
    title: 'At the Café',
    titleFr: 'Au café',
    description: 'Order a drink and a snack at a French café',
    icon: '☕',
    difficulty: 1,
    keyVerbs: ['vouloir', 'prendre', 'avoir', 'être'],
    dialogue: [
      { speaker: 'french', french: 'Bonjour ! Qu\'est-ce que vous voulez ?', english: 'Hello! What would you like?' },
      { speaker: 'user', french: 'Je voudrais un café, s\'il vous plaît.', english: 'I would like a coffee, please.', hint: 'vouloir (conditionnel) + un café' },
      { speaker: 'french', french: 'Très bien. Vous prenez quelque chose à manger ?', english: 'Very well. Are you having something to eat?' },
      { speaker: 'user', french: 'Oui, je prends un croissant.', english: 'Yes, I\'ll have a croissant.', hint: 'prendre (présent)' },
      { speaker: 'french', french: 'C\'est tout ?', english: 'Is that all?' },
      { speaker: 'user', french: 'Oui, c\'est tout. Merci !', english: 'Yes, that\'s all. Thank you!' },
    ],
  },
  {
    id: 'introduce-yourself',
    title: 'Meeting Someone',
    titleFr: 'Se présenter',
    description: 'Introduce yourself and ask about someone',
    icon: '👋',
    difficulty: 1,
    keyVerbs: ['être', 'avoir', 'habiter', 'travailler', 'parler'],
    dialogue: [
      { speaker: 'french', french: 'Bonjour ! Comment vous appelez-vous ?', english: 'Hello! What is your name?' },
      { speaker: 'user', french: 'Je m\'appelle Marie. Et vous ?', english: 'My name is Marie. And you?', hint: 's\'appeler (présent)' },
      { speaker: 'french', french: 'Je m\'appelle Pierre. Vous habitez à Paris ?', english: 'My name is Pierre. Do you live in Paris?' },
      { speaker: 'user', french: 'Non, j\'habite à Lyon. Je travaille ici.', english: 'No, I live in Lyon. I work here.', hint: 'habiter + travailler (présent)' },
      { speaker: 'french', french: 'Vous parlez bien français !', english: 'You speak French well!' },
      { speaker: 'user', french: 'Merci, j\'apprends depuis un an.', english: 'Thank you, I\'ve been learning for a year.', hint: 'apprendre (présent)' },
    ],
  },
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    titleFr: 'Au restaurant',
    description: 'Order a meal and ask for the bill',
    icon: '🍽️',
    difficulty: 2,
    keyVerbs: ['vouloir', 'prendre', 'pouvoir', 'recommander', 'avoir'],
    dialogue: [
      { speaker: 'french', french: 'Bonsoir, vous avez réservé ?', english: 'Good evening, do you have a reservation?' },
      { speaker: 'user', french: 'Oui, j\'ai réservé une table pour deux.', english: 'Yes, I reserved a table for two.', hint: 'avoir + réserver (passé composé)' },
      { speaker: 'french', french: 'Parfait. Voici le menu. Qu\'est-ce que vous prenez ?', english: 'Perfect. Here is the menu. What are you having?' },
      { speaker: 'user', french: 'Qu\'est-ce que vous recommandez ?', english: 'What do you recommend?', hint: 'recommander (présent)' },
      { speaker: 'french', french: 'Le poisson est très bon aujourd\'hui.', english: 'The fish is very good today.' },
      { speaker: 'user', french: 'D\'accord, je prends le poisson. Et une carafe d\'eau, s\'il vous plaît.', english: 'Alright, I\'ll have the fish. And a carafe of water, please.', hint: 'prendre (présent)' },
      { speaker: 'french', french: 'Vous avez bien mangé ?', english: 'Did you eat well?' },
      { speaker: 'user', french: 'Oui, c\'était délicieux. L\'addition, s\'il vous plaît.', english: 'Yes, it was delicious. The bill, please.', hint: 'être (imparfait)' },
    ],
  },
  {
    id: 'directions',
    title: 'Asking for Directions',
    titleFr: 'Demander son chemin',
    description: 'Ask and understand directions in a city',
    icon: '🗺️',
    difficulty: 2,
    keyVerbs: ['chercher', 'aller', 'prendre', 'tourner', 'pouvoir'],
    dialogue: [
      { speaker: 'user', french: 'Excusez-moi, je cherche la gare.', english: 'Excuse me, I\'m looking for the train station.', hint: 'chercher (présent)' },
      { speaker: 'french', french: 'La gare ? C\'est assez loin d\'ici. Vous allez tout droit.', english: 'The station? It\'s quite far from here. Go straight.' },
      { speaker: 'user', french: 'D\'accord. Et ensuite, je tourne à droite ?', english: 'Okay. And then, do I turn right?', hint: 'tourner (présent)' },
      { speaker: 'french', french: 'Non, vous tournez à gauche au feu rouge. Puis vous prenez la deuxième rue à droite.', english: 'No, turn left at the traffic light. Then take the second street on the right.' },
      { speaker: 'user', french: 'Merci beaucoup ! Je peux y aller à pied ?', english: 'Thank you very much! Can I go there on foot?', hint: 'pouvoir + aller (présent)' },
      { speaker: 'french', french: 'Oui, c\'est à dix minutes environ.', english: 'Yes, it\'s about ten minutes.' },
    ],
  },
  {
    id: 'shopping',
    title: 'At the Market',
    titleFr: 'Au marché',
    description: 'Buy fruits and vegetables at a French market',
    icon: '🛒',
    difficulty: 1,
    keyVerbs: ['vouloir', 'coûter', 'prendre', 'avoir', 'mettre'],
    dialogue: [
      { speaker: 'french', french: 'Bonjour ! Qu\'est-ce que je vous mets ?', english: 'Hello! What can I get you?' },
      { speaker: 'user', french: 'Je voudrais un kilo de pommes, s\'il vous plaît.', english: 'I would like a kilo of apples, please.', hint: 'vouloir (conditionnel)' },
      { speaker: 'french', french: 'Voilà. Autre chose ?', english: 'Here you are. Anything else?' },
      { speaker: 'user', french: 'Oui, est-ce que vous avez des fraises ?', english: 'Yes, do you have strawberries?', hint: 'avoir (présent)' },
      { speaker: 'french', french: 'Bien sûr ! Elles sont à trois euros la barquette.', english: 'Of course! They are three euros per basket.' },
      { speaker: 'user', french: 'J\'en prends deux. Ça coûte combien en tout ?', english: 'I\'ll take two. How much is that in total?', hint: 'prendre + coûter (présent)' },
    ],
  },
  {
    id: 'doctor-visit',
    title: 'At the Doctor\'s',
    titleFr: 'Chez le médecin',
    description: 'Describe symptoms and understand instructions',
    icon: '🏥',
    difficulty: 2,
    keyVerbs: ['avoir', 'être', 'devoir', 'prendre', 'se sentir'],
    dialogue: [
      { speaker: 'french', french: 'Bonjour. Qu\'est-ce qui ne va pas ?', english: 'Hello. What\'s wrong?' },
      { speaker: 'user', french: 'Je ne me sens pas bien. J\'ai mal à la tête depuis deux jours.', english: 'I\'m not feeling well. I\'ve had a headache for two days.', hint: 'se sentir + avoir (présent)' },
      { speaker: 'french', french: 'Vous avez de la fièvre ?', english: 'Do you have a fever?' },
      { speaker: 'user', french: 'Oui, j\'ai un peu de fièvre et je suis fatigué.', english: 'Yes, I have a slight fever and I\'m tired.', hint: 'avoir + être (présent)' },
      { speaker: 'french', french: 'D\'accord. Je vais vous examiner. Ouvrez la bouche.', english: 'Alright. I\'m going to examine you. Open your mouth.' },
      { speaker: 'user', french: 'Est-ce que je dois prendre des médicaments ?', english: 'Do I need to take medicine?', hint: 'devoir + prendre (présent)' },
      { speaker: 'french', french: 'Oui, vous devez prendre ce médicament trois fois par jour.', english: 'Yes, you must take this medicine three times a day.' },
      { speaker: 'user', french: 'D\'accord, merci docteur. Je vais me reposer.', english: 'Alright, thank you doctor. I\'m going to rest.', hint: 'aller + se reposer' },
    ],
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel Check-in',
    titleFr: 'Arrivée à l\'hôtel',
    description: 'Check into a hotel and ask about amenities',
    icon: '🏨',
    difficulty: 2,
    keyVerbs: ['avoir', 'vouloir', 'pouvoir', 'être', 'partir'],
    dialogue: [
      { speaker: 'french', french: 'Bonsoir et bienvenue. Vous avez une réservation ?', english: 'Good evening and welcome. Do you have a reservation?' },
      { speaker: 'user', french: 'Oui, j\'ai réservé une chambre pour trois nuits.', english: 'Yes, I booked a room for three nights.', hint: 'avoir + réserver (passé composé)' },
      { speaker: 'french', french: 'Quel nom, s\'il vous plaît ?', english: 'What name, please?' },
      { speaker: 'user', french: 'C\'est au nom de Dupont. Est-ce que je peux avoir une chambre avec vue ?', english: 'It\'s under the name Dupont. Can I have a room with a view?', hint: 'pouvoir + avoir (présent)' },
      { speaker: 'french', french: 'Bien sûr. Le petit-déjeuner est servi de sept heures à dix heures.', english: 'Of course. Breakfast is served from 7 to 10 AM.' },
      { speaker: 'user', french: 'Parfait. À quelle heure est-ce que je dois partir dimanche ?', english: 'Perfect. What time do I have to leave on Sunday?', hint: 'devoir + partir (présent)' },
    ],
  },
  {
    id: 'phone-call',
    title: 'Phone Call',
    titleFr: 'Au téléphone',
    description: 'Make a phone call and leave a message',
    icon: '📞',
    difficulty: 3,
    keyVerbs: ['pouvoir', 'vouloir', 'rappeler', 'laisser', 'dire'],
    dialogue: [
      { speaker: 'french', french: 'Allô, société Martin, bonjour.', english: 'Hello, Martin company, good morning.' },
      { speaker: 'user', french: 'Bonjour, je voudrais parler à Madame Leblanc, s\'il vous plaît.', english: 'Hello, I would like to speak with Mrs. Leblanc, please.', hint: 'vouloir (conditionnel) + parler' },
      { speaker: 'french', french: 'Je suis désolé, elle n\'est pas disponible. Vous voulez laisser un message ?', english: 'I\'m sorry, she\'s not available. Would you like to leave a message?' },
      { speaker: 'user', french: 'Oui, pouvez-vous lui dire que j\'ai appelé ?', english: 'Yes, can you tell her that I called?', hint: 'pouvoir + dire (présent) + appeler (passé composé)' },
      { speaker: 'french', french: 'Bien sûr. Quel est votre numéro ?', english: 'Of course. What is your number?' },
      { speaker: 'user', french: 'C\'est le zéro six, douze, trente-quatre, cinquante-six. Elle peut me rappeler demain.', english: 'It\'s 06 12 34 56. She can call me back tomorrow.', hint: 'pouvoir + rappeler (présent)' },
    ],
  },
  {
    id: 'past-weekend',
    title: 'Talking About the Weekend',
    titleFr: 'Raconter son week-end',
    description: 'Describe what you did last weekend using past tenses',
    icon: '🌅',
    difficulty: 2,
    keyVerbs: ['aller', 'faire', 'voir', 'manger', 'rentrer'],
    dialogue: [
      { speaker: 'french', french: 'Salut ! Qu\'est-ce que tu as fait ce week-end ?', english: 'Hi! What did you do this weekend?' },
      { speaker: 'user', french: 'Samedi, je suis allé au marché et j\'ai fait les courses.', english: 'Saturday, I went to the market and did the shopping.', hint: 'aller + faire (passé composé)' },
      { speaker: 'french', french: 'Et dimanche ?', english: 'And Sunday?' },
      { speaker: 'user', french: 'Dimanche, j\'ai vu un film au cinéma avec des amis.', english: 'Sunday, I saw a movie at the cinema with friends.', hint: 'voir (passé composé)' },
      { speaker: 'french', french: 'C\'était bien ?', english: 'Was it good?' },
      { speaker: 'user', french: 'Oui, c\'était très bien ! Après, nous avons mangé dans un restaurant.', english: 'Yes, it was very good! After, we ate at a restaurant.', hint: 'être (imparfait) + manger (passé composé)' },
      { speaker: 'french', french: 'Tu es rentré tard ?', english: 'Did you get home late?' },
      { speaker: 'user', french: 'Non, je suis rentré vers dix heures.', english: 'No, I got home around ten.', hint: 'rentrer (passé composé)' },
    ],
  },
  {
    id: 'future-plans',
    title: 'Making Plans',
    titleFr: 'Faire des projets',
    description: 'Discuss future plans and make arrangements',
    icon: '📅',
    difficulty: 3,
    keyVerbs: ['aller', 'vouloir', 'pouvoir', 'devoir', 'finir'],
    dialogue: [
      { speaker: 'french', french: 'Tu veux faire quelque chose ce week-end ?', english: 'Do you want to do something this weekend?' },
      { speaker: 'user', french: 'Oui, je voudrais aller au musée. Tu veux venir ?', english: 'Yes, I\'d like to go to the museum. Do you want to come?', hint: 'vouloir (conditionnel) + aller + vouloir (présent)' },
      { speaker: 'french', french: 'Samedi je ne peux pas, je dois travailler.', english: 'Saturday I can\'t, I have to work.' },
      { speaker: 'user', french: 'Et dimanche ? Je finirai vers midi, on pourra y aller l\'après-midi.', english: 'And Sunday? I\'ll finish around noon, we could go in the afternoon.', hint: 'finir (futur) + pouvoir (futur)' },
      { speaker: 'french', french: 'D\'accord, c\'est une bonne idée. On se retrouve à quelle heure ?', english: 'Okay, that\'s a good idea. What time shall we meet?' },
      { speaker: 'user', french: 'On se retrouve à deux heures devant le musée ?', english: 'Shall we meet at two o\'clock in front of the museum?', hint: 'se retrouver (présent)' },
    ],
  },
];
