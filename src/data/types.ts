// ─────────────────────────────────────────────────────────────
//  Type-safe data models for The Reunion Archive
// ─────────────────────────────────────────────────────────────

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';
export type AttendanceMark = 'unmarked' | 'present' | 'absent';
export type AttendanceIntent = 'yes' | 'maybe';
export type Dietary = 'none' | 'vegetarian' | 'vegan' | 'halal' | 'gluten-free' | 'other';

export interface Registration {
  id: string; // e.g. TRA-26-4K7Q
  fullName: string;
  email: string;
  phone: string;
  batch: number;
  section: string;
  occupation?: string;
  intent: AttendanceIntent;
  guests: number;
  dietary: Dietary;
  requests?: string;
  status: RegistrationStatus;
  attendance: AttendanceMark;
  checkedInAt?: string;
  createdAt: string;
  photo?: string;
  bio?: string;
  city?: string;
  showInDirectory: boolean;
  userId?: string;
}

export interface ScheduleItem {
  id: string;
  time: string; // "08:30"
  endTime?: string;
  title: string;
  description: string;
  location?: string;
  category: ScheduleCategory;
}

export type ScheduleCategory = 'Arrival' | 'Ceremony' | 'Community' | 'Dining' | 'Entertainment' | 'Photography';

export type AnnouncementCategory = 'Registration' | 'Event' | 'Logistics' | 'Community';

export interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  date: string; // ISO date
  category: AnnouncementCategory;
  featured: boolean;
}

export type GalleryCategory =
  | 'School Days'
  | 'Classrooms'
  | 'Teachers'
  | 'Sports Days'
  | 'School Events'
  | 'Trips and Adventures'
  | 'Previous Reunions';

export interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  year: string;
  category: GalleryCategory;
  ratio: '3/4' | '4/5' | '1/1' | '4/3' | '3/2' | '16/10';
  credit?: string;
  status: 'published' | 'pending';
  submittedBy?: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface EventDetails {
  schoolName: string;
  schoolMotto: string;
  eventTitle: string;
  batchFrom: number;
  batchTo: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  timezoneOffset: string; // +05:30
  venue: string;
  address: string;
  city: string;
  country: string;
  mapQuery: string;
  description: string;
  dressCode: string;
  dressCodeNote: string;
  ticketAlumni: number;
  ticketGuest: number;
  currency: string;
  ticketIncludes: string[];
  food: string;
  transport: string;
  parking: string;
  instructions: string[];
  faqs: FAQ[];
}

export interface Organizer {
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
}

export interface RegistrationSettings {
  open: boolean;
  autoConfirm: boolean;
  maxGuests: number;
  deadline: string; // YYYY-MM-DD
  capacity: number;
}

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  batch: number;
  section: string;
  occupation?: string;
  city?: string;
  bio?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AppData {
  version: number;
  event: EventDetails;
  organizer: Organizer;
  registration: RegistrationSettings;
  admin: AdminProfile;
  schedule: ScheduleItem[];
  announcements: Announcement[];
  gallery: GalleryImage[];
  registrations: Registration[];
  users: UserAccount[];
  messages: ContactMessage[];
}
