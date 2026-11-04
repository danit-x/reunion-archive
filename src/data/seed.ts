import type {
  AppData,
  Announcement,
  GalleryImage,
  Registration,
  ScheduleItem,
} from './types';
import { PHOTO, portrait, unsplash } from './images';

// ─────────────────────────────────────────────────────────────
//  DEMO SEED DATA — every school/event detail lives here and is
//  editable from the admin dashboard (Settings / Event Details).
//  All people below are fictional.
// ─────────────────────────────────────────────────────────────

export const DATA_VERSION = 3;

const schedule: ScheduleItem[] = [
  { id: 's1', time: '08:30', endTime: '09:30', title: 'Registration & Welcome', category: 'Arrival', location: 'Main Gate & Quadrangle', description: 'Collect your archive pass, a cup of estate tea and your batch ribbon. Volunteers from every batch will be waiting at the old gate.' },
  { id: 's2', time: '09:30', endTime: '10:00', title: 'Opening Ceremony', category: 'Ceremony', location: 'Main Auditorium', description: 'Lighting of the traditional oil lamp, the school anthem sung together once more, and a roll-call of the eleven batches.' },
  { id: 's3', time: '10:00', endTime: '10:30', title: "Principal's Address", category: 'Ceremony', location: 'Main Auditorium', description: 'The Principal reflects on a decade of the school — what has changed, what never will, and where the next decade leads.' },
  { id: 's4', time: '10:30', endTime: '12:00', title: 'Reconnecting Activities', category: 'Community', location: 'Classrooms, Block C', description: 'Return to your old classrooms. Batch tables, name-tag bingo and the "find your desk" challenge — bring your stories.' },
  { id: 's5', time: '12:00', endTime: '13:00', title: 'The Great Group Photograph', category: 'Photography', location: 'Main Grounds', description: 'One frame, every batch. Our photographers will also shoot individual batch portraits on the auditorium steps.' },
  { id: 's6', time: '13:00', endTime: '14:00', title: 'Lunch in the Old Hall', category: 'Dining', location: 'Dining Hall', description: 'A long-table Sri Lankan lunch, including the canteen favourites you remember — yes, the fish buns are back.' },
  { id: 's7', time: '14:00', endTime: '15:30', title: 'Entertainment & Games', category: 'Entertainment', location: 'Grounds & Auditorium', description: 'Alumni band set, a friendly batch cricket match, tug-of-war and a quiz on school trivia hosted by former prefects.' },
  { id: 's8', time: '15:30', endTime: '16:00', title: 'Memories & Awards', category: 'Ceremony', location: 'Main Auditorium', description: 'A slideshow from the archive, followed by awards for the most-travelled alumnus, best-kept secret and longest friendship.' },
  { id: 's9', time: '16:00', endTime: '16:30', title: 'Closing Ceremony', category: 'Ceremony', location: 'Main Auditorium', description: 'The time capsule is sealed, the school song is sung one last time, and we walk out the gate together.' },
];

const announcements: Announcement[] = [
  { id: 'a1', title: 'Registration is now open', category: 'Registration', date: '2026-09-01', featured: true,
    excerpt: 'Places for The Grand Reunion 2026 are now open to every batch from 2010 to 2020.',
    body: 'After months of planning, the organising committee is delighted to open registration for The Grand Reunion 2026. Every former student from the batches of 2010 through 2020 is warmly invited to reserve a place.\n\nRegistration takes less than three minutes. You will receive a personal registration ID and a printable archive pass immediately. Places are limited by auditorium capacity, so we encourage you to register early and to tell your batch WhatsApp groups.' },
  { id: 'a2', title: 'Reunion date confirmed: 20 December 2026', category: 'Event', date: '2026-08-14', featured: false,
    excerpt: 'The school has confirmed the Main Auditorium for Sunday, 20 December 2026.',
    body: 'We are pleased to confirm that the school administration has reserved the Main Auditorium and grounds for Sunday, 20 December 2026. Doors open at 08:30 and the programme closes at 16:30.\n\nThe date was chosen so that alumni living abroad can travel home for the December holidays.' },
  { id: 'a3', title: 'Dress code announced', category: 'Event', date: '2026-09-18', featured: false,
    excerpt: 'Smart casual, with a touch of school colours. Batch ribbons will be provided.',
    body: 'The dress code for the day is smart casual. We invite everyone to add a touch of navy or gold — a tie, a scarf, a pocket square or even your old house colours.\n\nBatch ribbons will be handed out at registration. Please wear comfortable shoes: the classroom tour includes stairs in Block C.' },
  { id: 'a4', title: 'Event schedule published', category: 'Event', date: '2026-10-02', featured: false,
    excerpt: 'From the welcome at 08:30 to the time-capsule closing at 16:00 — the full order of the day.',
    body: 'The full order of the day is now available on the Schedule page. Highlights include the Principal\'s address, a return to your old classrooms, the great group photograph and a friendly batch cricket match.\n\nThe schedule may be refined in the coming weeks; any changes will appear here first.' },
  { id: 'a5', title: 'Transportation & shuttle information', category: 'Logistics', date: '2026-10-20', featured: false,
    excerpt: 'Free shuttles will run from Colombo Fort and Bambalapitiya every 30 minutes.',
    body: 'Two complimentary shuttle loops will run on the day: one from Colombo Fort Railway Station and one from Bambalapitiya Junction. Shuttles leave every 30 minutes from 07:45 until 10:15, with return trips from 16:30.\n\nLook for the navy banner marked "The Reunion Archive".' },
  { id: 'a6', title: 'Call for photographs: help build the archive', category: 'Community', date: '2026-10-08', featured: false,
    excerpt: 'Dig out the old albums. Share a photograph and it may appear on the big screen.',
    body: 'We are building the largest collection of photographs the school has ever had in one place. Use the "Submit a photograph" option on the Memories page to share your favourite moments.\n\nSelected images will be part of the Memories & Awards slideshow on the day.' },
  { id: 'a7', title: 'Teachers confirmed for the day', category: 'Community', date: '2026-10-27', featured: false,
    excerpt: 'Fourteen former teachers have confirmed they will join us — including two retired deputy principals.',
    body: 'We are thrilled to share that fourteen former teachers have accepted our invitation. They will join the reconnecting activities and the lunch in the Old Hall.\n\nIf you would like to write a short note of thanks to a teacher, bring it on the day — there will be a letters table near the auditorium entrance.' },
  { id: 'a8', title: 'Final registration reminder', category: 'Registration', date: '2026-11-02', featured: false,
    excerpt: 'Registration closes on 10 December. Over three-quarters of places are already reserved.',
    body: 'This is a friendly reminder that registration closes on 10 December 2026. Over three-quarters of available places have now been reserved.\n\nIf you have already registered, you can view your archive pass anytime from your account.' },
];

type G = Omit<GalleryImage, 'id' | 'status'>;
const galleryRaw: G[] = [
  { src: unsplash(PHOTO.classroomDesks, 1200), caption: 'The front row of Grade 10-B, the morning before the term test.', year: '2013', category: 'Classrooms', ratio: '4/3' },
  { src: unsplash(PHOTO.cricketBall, 1000), caption: 'The ball that won the Big Match — or so the story goes.', year: '2016', category: 'Sports Days', ratio: '3/4' },
  { src: unsplash(PHOTO.libraryGirl, 1000), caption: 'Afternoons in the old library, long after the last bell.', year: '2012', category: 'School Days', ratio: '4/5' },
  { src: unsplash(PHOTO.teacher, 1000), caption: 'Mrs. Perera, who taught three generations to love literature.', year: '2014', category: 'Teachers', ratio: '3/4' },
  { src: unsplash(PHOTO.roadTrip, 1200), caption: 'Grade 11 trip to the hill country. Nobody slept on the bus.', year: '2015', category: 'Trips and Adventures', ratio: '3/2' },
  { src: unsplash(PHOTO.track, 1200), caption: 'Inter-house athletics, 400 m final, lane four.', year: '2017', category: 'Sports Days', ratio: '16/10' },
  { src: unsplash(PHOTO.audience, 1200), caption: 'Prize-giving night in the Main Auditorium.', year: '2018', category: 'School Events', ratio: '4/3' },
  { src: unsplash(PHOTO.friendsSunset, 1000), caption: 'The first reunion of the 2010 batch, five years on.', year: '2015', category: 'Previous Reunions', ratio: '1/1' },
  { src: unsplash(PHOTO.classroomTeacher, 1000), caption: 'Sir explaining the same theorem for the fourth time. Patiently.', year: '2011', category: 'Teachers', ratio: '4/5' },
  { src: unsplash(PHOTO.mountains, 1200), caption: 'Sunrise from the summit — the Scouts expedition.', year: '2019', category: 'Trips and Adventures', ratio: '3/2' },
  { src: unsplash(PHOTO.classroomKids, 1000), caption: 'Science day experiments, Block C laboratory.', year: '2012', category: 'Classrooms', ratio: '1/1' },
  { src: unsplash(PHOTO.studentsGroup, 1000), caption: 'Prefects\' council, the year we organised everything.', year: '2018', category: 'School Days', ratio: '3/4' },
  { src: unsplash(PHOTO.football, 1200), caption: 'Under-17 football — the pitch after the monsoon.', year: '2014', category: 'Sports Days', ratio: '4/3' },
  { src: unsplash(PHOTO.stageLights, 1000), caption: 'The annual concert. The lights, the nerves, the encore.', year: '2019', category: 'School Events', ratio: '4/5' },
  { src: unsplash(PHOTO.reunionDinner, 1200), caption: 'Batch of 2012, ten-year dinner in Colombo.', year: '2022', category: 'Previous Reunions', ratio: '3/2' },
  { src: unsplash(PHOTO.books, 1000), caption: 'A stack of O/L past papers we swore we would never open again.', year: '2016', category: 'School Days', ratio: '1/1' },
  { src: unsplash(PHOTO.travel, 1200), caption: 'Planning the leavers\' trip, maps and all.', year: '2020', category: 'Trips and Adventures', ratio: '4/3' },
  { src: unsplash(PHOTO.lectureHall, 1200), caption: 'Assembly hall, Monday 7:30 a.m., the full school in one room.', year: '2013', category: 'School Events', ratio: '16/10' },
  { src: unsplash(PHOTO.teacherClass, 1000), caption: 'Our class teacher, who remembered every birthday.', year: '2017', category: 'Teachers', ratio: '4/5' },
  { src: unsplash(PHOTO.friendsCircle, 1000), caption: 'Old friends, new stories — the 2015 batch meet-up.', year: '2023', category: 'Previous Reunions', ratio: '1/1' },
  { src: unsplash(PHOTO.classroomChairs, 1200), caption: 'The empty classroom on the very last day of school.', year: '2020', category: 'Classrooms', ratio: '3/2' },
];

const gallery: GalleryImage[] = galleryRaw.map((g, i) => ({ ...g, id: `g${i + 1}`, status: 'published' }));

// Fictional alumni ─ name, gender for portrait, portrait number, batch, section, occupation, city
const people: [string, 'men' | 'women', number, number, string, string, string][] = [
  ['Ashan Wijesinghe', 'men', 32, 2010, 'Maths A', 'Civil Engineer', 'Colombo'],
  ['Nadeesha Fernando', 'women', 44, 2011, 'Bio A', 'Paediatrician', 'Kandy'],
  ['Kavindu Jayawardena', 'men', 46, 2012, 'Commerce', 'Chartered Accountant', 'Colombo'],
  ['Tharushi Senanayake', 'women', 65, 2013, 'Arts', 'Documentary Photographer', 'Galle'],
  ['Ravindu Perera', 'men', 75, 2014, 'Technology', 'Software Architect', 'Melbourne'],
  ['Dilini Rathnayake', 'women', 68, 2015, 'Bio B', 'Marine Biologist', 'Trincomalee'],
  ['Sahan Abeysekara', 'men', 12, 2016, 'Maths B', 'Pilot', 'Dubai'],
  ['Imesha Gunawardena', 'women', 17, 2017, 'Commerce', 'Brand Strategist', 'Colombo'],
  ['Pasindu Karunaratne', 'men', 52, 2018, 'Technology', 'Product Designer', 'Singapore'],
  ['Shenali de Silva', 'women', 33, 2019, 'Arts', 'Journalist', 'Colombo'],
  ['Minura Bandara', 'men', 85, 2020, 'Maths A', 'Data Scientist', 'London'],
  ['Hiruni Weerasinghe', 'women', 90, 2010, 'Bio A', 'Pharmacist', 'Negombo'],
  ['Chamath Herath', 'men', 22, 2011, 'Maths B', 'Mechanical Engineer', 'Toronto'],
  ['Oshadi Dissanayake', 'women', 50, 2012, 'Arts', 'Secondary School Teacher', 'Kurunegala'],
  ['Yasiru Samarasinghe', 'men', 61, 2013, 'Commerce', 'Investment Analyst', 'Colombo'],
  ['Anjali Ranasinghe', 'women', 26, 2014, 'Technology', 'Cloud Engineer', 'Seattle'],
  ['Lahiru Mendis', 'men', 41, 2015, 'Maths A', 'Architect', 'Colombo'],
  ['Sachini Kumari', 'women', 79, 2016, 'Bio B', 'Veterinarian', 'Matara'],
  ['Thisara Wickramasinghe', 'men', 67, 2017, 'Arts', 'Musician', 'Colombo'],
  ['Kaveesha Liyanage', 'women', 57, 2018, 'Commerce', 'Entrepreneur', 'Kandy'],
  ['Dinuka Hettiarachchi', 'men', 8, 2019, 'Maths B', 'Medical Student', 'Peradeniya'],
  ['Ruvini Jayasuriya', 'women', 12, 2020, 'Bio A', 'Research Assistant', 'Colombo'],
  ['Nuwan Silva', 'men', 36, 2014, 'Commerce', 'Hotelier', 'Bentota'],
  ['Pavithra Alwis', 'women', 3, 2012, 'Maths A', 'Structural Engineer', 'Sydney'],
  ['Janith Amarasekara', 'men', 55, 2016, 'Technology', 'Cyber-security Consultant', 'Colombo'],
  ['Senuri Edirisinghe', 'women', 31, 2018, 'Arts', 'Illustrator', 'Galle'],
  ['Malith Gamage', 'men', 71, 2010, 'Commerce', 'Bank Manager', 'Colombo'],
  ['Hasini Pathirana', 'women', 40, 2020, 'Technology', 'UX Researcher', 'Berlin'],
];

const bios = [
  'Still remembers the canteen queue strategy that never failed.',
  'Ran the school magazine for two years and never missed a deadline (almost).',
  'House captain, debate team, and the loudest voice at the Big Match.',
  'Spent most interval breaks in the library — and is not sorry about it.',
  'Played in the school band; still owns the trumpet.',
  'Can still recite the school song backwards.',
];

const statusFor = (i: number): Registration['status'] => (i % 9 === 4 ? 'pending' : i % 13 === 7 ? 'cancelled' : 'confirmed');

// Registrations spread across Sept – early Nov 2026
const regDate = (i: number) => {
  const start = new Date('2026-09-01T09:00:00+05:30').getTime();
  const span = new Date('2026-11-03T18:00:00+05:30').getTime() - start;
  const t = start + span * Math.pow((i + 1) / (people.length + 1), 0.85);
  return new Date(t).toISOString();
};

const codes = ['4K7Q','8MZR','2HPD','9XTA','6WCF','3NBV','7LQE','5RJY','1GSK','8DTU','4PVN','2YKH','9CWA','6QME','3FZL','7BRX','5TJD','1NHW','8KAP','4ZQS','2EVT','9MLC','6RBY','3WHK','7JPF','5XDG','1QTN','8CVL'];

const registrations: Registration[] = people.map(([fullName, g, n, batch, section, occupation, city], i) => {
  const first = fullName.split(' ')[0].toLowerCase();
  return {
    id: `TRA-26-${codes[i]}`,
    fullName,
    email: `${first}.${batch}@example.com`,
    phone: `+94 7${(i % 8) + 1} ${String(1000000 + i * 37717).slice(0, 3)} ${String(4000 + i * 211).slice(0, 4)}`,
    batch,
    section,
    occupation,
    city,
    intent: i % 7 === 3 ? 'maybe' : 'yes',
    guests: [0, 1, 0, 2, 1, 0, 0, 1, 3, 0][i % 10],
    dietary: (['none', 'vegetarian', 'none', 'halal', 'none', 'vegan', 'none', 'gluten-free'] as const)[i % 8],
    requests: i === 5 ? 'Wheelchair access for my father, who will accompany me.' : undefined,
    status: statusFor(i),
    attendance: 'unmarked',
    createdAt: regDate(i),
    photo: portrait(g, n),
    bio: bios[i % bios.length],
    showInDirectory: i !== 26,
  };
});

export const seedData = (): AppData => ({
  version: DATA_VERSION,
  event: {
    schoolName: 'Royal College (Demo)',
    schoolMotto: 'Disce aut Discede',
    eventTitle: 'The Grand Reunion 2026',
    batchFrom: 2010,
    batchTo: 2020,
    date: '2026-12-20',
    startTime: '08:30',
    endTime: '16:30',
    timezoneOffset: '+05:30',
    venue: 'School Main Auditorium',
    address: 'Rajakeeya Mawatha, Colombo 07',
    city: 'Colombo',
    country: 'Sri Lanka',
    mapQuery: 'Colombo 07, Sri Lanka',
    description:
      'Eleven batches, one auditorium and a single day to remember why it all mattered. The Grand Reunion brings the classes of 2010 to 2020 back through the old gate — to the classrooms, the grounds and the people who shaped us.',
    dressCode: 'Smart Casual',
    dressCodeNote: 'Add a touch of navy or gold — a tie, scarf, pin or your old house colours. Comfortable shoes recommended for the classroom tour.',
    ticketAlumni: 7500,
    ticketGuest: 5000,
    currency: 'LKR',
    ticketIncludes: ['Welcome tea & breakfast bites', 'Long-table Sri Lankan lunch', 'Commemorative batch ribbon & archive pass', 'Printed group photograph', 'Access to all activities'],
    food: 'A long-table Sri Lankan lunch is served in the Old Hall, with vegetarian, vegan, halal and gluten-free options prepared separately. Morning tea and afternoon short-eats — including the canteen classics — are included.',
    transport: 'Complimentary shuttles run every 30 minutes from Colombo Fort Railway Station and Bambalapitiya Junction between 07:45 and 10:15, with return trips from 16:30. Ride-hailing drop-off is at the Main Gate.',
    parking: 'Limited parking is available on the main grounds (entry via the side gate) on a first-come basis. Overflow parking is available at the neighbouring sports complex, a five-minute walk away.',
    instructions: [
      'Bring your archive pass — printed or on your phone — and a photo ID.',
      'Registration desks close at 10:00. Late arrivals can check in at the auditorium foyer.',
      'Guests must be registered in advance under your registration ID.',
      'Photography and video will take place throughout the day for the school archive.',
      'The school is a smoke-free and alcohol-free premises.',
    ],
    faqs: [
      { q: 'Who can attend?', a: 'All former students from the batches of 2010 to 2020, together with registered guests (partners, family members). Former teachers attend as our guests of honour.' },
      { q: 'Can I register on the day?', a: 'We strongly recommend registering online. On-the-day registration will only be possible if places remain after 10 December.' },
      { q: 'I studied at the school but did not finish A/Ls here. Can I come?', a: 'Of course. Choose the batch you would have graduated with — everyone who walked the corridors is welcome.' },
      { q: 'How do I pay for my ticket?', a: 'This demo collects registrations only. In a live deployment, payment would be collected by bank transfer or at the registration desk; your archive pass shows the amount due.' },
      { q: 'Can I change my number of guests?', a: 'Yes. Contact the organising committee with your registration ID before 10 December, or ask an administrator to update your registration.' },
      { q: 'Is the venue accessible?', a: 'The auditorium, Old Hall and grounds are step-free. Classroom Block C has stairs; volunteers will offer assistance. Please mention access needs in your registration.' },
    ],
  },
  organizer: {
    name: 'The Old Students’ Reunion Committee',
    role: 'Organising Committee',
    email: 'reunion@royalcollege-demo.lk',
    phone: '+94 11 269 1029',
    address: 'Old Students’ Office, Rajakeeya Mawatha, Colombo 07',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
  },
  registration: { open: true, autoConfirm: true, maxGuests: 4, deadline: '2026-12-10', capacity: 650 },
  admin: { name: 'Dulani Wijeratne', email: 'admin@royalcollege-demo.lk', role: 'Reunion Coordinator' },
  schedule,
  announcements,
  gallery,
  registrations,
  users: [],
  messages: [
    { id: 'm1', name: 'Gayan Perera', email: 'gayan@example.com', subject: 'Volunteering', message: 'I would love to help at the registration desk on the day. Batch of 2013.', createdAt: '2026-10-29T10:12:00.000Z', read: false },
  ],
});

/** Base set of batches & sections used by forms and filters. */
export const GALLERY_CATEGORIES = ['School Days', 'Classrooms', 'Teachers', 'Sports Days', 'School Events', 'Trips and Adventures', 'Previous Reunions'] as const;

export const SECTIONS = ['Maths A','Maths B', 'Bio A', 'Bio B', 'Commerce', 'Arts', 'Technology'];
