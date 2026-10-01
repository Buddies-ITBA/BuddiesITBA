import type { FormField } from '@/lib/forms/schema';

/**
 * Starting questionnaire for a new buddy program. Admins can edit, remove or
 * add questions per program; `matchWeight` (0-5) sets how much each one
 * counts in the matching algorithm. Matching questions use `audience: 'both'`
 * so locals and exchange students answer the same thing.
 */
export const defaultBuddyQuestions: FormField[] = [
  {
    id: 'interests',
    type: 'multiselect',
    label: { es: '¿Qué te gusta hacer?', en: 'What do you enjoy doing?' },
    help: { es: 'Elegí todas las que quieras.', en: 'Pick as many as you like.' },
    required: true,
    audience: 'both',
    matchWeight: 5,
    options: [
      { value: 'sports', label: { es: 'Deportes', en: 'Sports' } },
      { value: 'outdoors', label: { es: 'Naturaleza y aire libre', en: 'Nature & outdoors' } },
      { value: 'music', label: { es: 'Música y recitales', en: 'Music & concerts' } },
      { value: 'nightlife', label: { es: 'Salir de noche', en: 'Nightlife' } },
      { value: 'food', label: { es: 'Gastronomía', en: 'Food' } },
      { value: 'culture', label: { es: 'Museos y cultura', en: 'Museums & culture' } },
      { value: 'travel', label: { es: 'Viajar', en: 'Travel' } },
      { value: 'gaming', label: { es: 'Videojuegos', en: 'Gaming' } },
      { value: 'art', label: { es: 'Arte y fotografía', en: 'Art & photography' } },
      { value: 'tech', label: { es: 'Tecnología', en: 'Tech' } },
      { value: 'movies', label: { es: 'Cine y series', en: 'Movies & series' } },
      { value: 'reading', label: { es: 'Lectura', en: 'Reading' } },
    ],
  },
  {
    id: 'goals',
    type: 'multiselect',
    label: { es: '¿Qué buscás del programa?', en: 'What are you looking for in the program?' },
    required: true,
    audience: 'both',
    matchWeight: 3,
    options: [
      { value: 'friends', label: { es: 'Hacer amigos', en: 'Make friends' } },
      { value: 'language', label: { es: 'Practicar idiomas', en: 'Practice languages' } },
      { value: 'city', label: { es: 'Conocer la ciudad', en: 'Discover the city' } },
      { value: 'party', label: { es: 'Salir y divertirme', en: 'Go out and have fun' } },
      { value: 'academic', label: { es: 'Ayuda con la facultad', en: 'Help with university' } },
      { value: 'trips', label: { es: 'Viajes por Argentina', en: 'Trips around Argentina' } },
    ],
  },
  {
    id: 'social_energy',
    type: 'scale',
    label: { es: '¿Qué tan sociable te considerás?', en: 'How outgoing are you?' },
    required: true,
    audience: 'both',
    matchWeight: 3,
    scale: {
      min: 1,
      max: 5,
      minLabel: { es: 'Tranqui, grupos chicos', en: 'Low-key, small groups' },
      maxLabel: { es: 'Muy social, ¡cuantos más mejor!', en: 'Very social, the more the merrier!' },
    },
  },
  {
    id: 'going_out',
    type: 'scale',
    label: { es: '¿Cuánto te gusta salir de noche?', en: 'How much do you like going out at night?' },
    required: true,
    audience: 'both',
    matchWeight: 2,
    scale: {
      min: 1,
      max: 5,
      minLabel: { es: 'Casi nunca', en: 'Hardly ever' },
      maxLabel: { es: 'Todos los fines de semana', en: 'Every weekend' },
    },
  },
  {
    id: 'planning',
    type: 'scale',
    label: { es: '¿Sos más de planificar o de improvisar?', en: 'Are you more of a planner or spontaneous?' },
    required: true,
    audience: 'both',
    matchWeight: 1,
    scale: {
      min: 1,
      max: 5,
      minLabel: { es: 'Planifico todo', en: 'I plan everything' },
      maxLabel: { es: 'Improviso', en: 'I go with the flow' },
    },
  },
  {
    id: 'availability',
    type: 'select',
    label: { es: '¿Cuánto tiempo podés dedicarle?', en: 'How much time can you spend together?' },
    required: true,
    audience: 'both',
    matchWeight: 2,
    options: [
      { value: 'low', label: { es: 'Poco: algún mensaje y eventos', en: 'A little: messages and events' } },
      { value: 'medium', label: { es: 'Vernos un par de veces al mes', en: 'Meet a couple of times a month' } },
      { value: 'high', label: { es: 'Mucho: salir seguido', en: 'A lot: hang out often' } },
    ],
  },
  {
    id: 'about',
    type: 'textarea',
    label: { es: 'Contanos un poco sobre vos', en: 'Tell us a bit about yourself' },
    help: { es: 'Lo leemos para ajustar el matching a mano.', en: 'We read it to fine-tune matches by hand.' },
    required: false,
    audience: 'both',
    matchWeight: 0,
  },
];
