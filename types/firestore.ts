export type BandRole = 'admin' | 'edit' | 'read';

export type BandMemberTitle =
  | 'Member'
  | 'Manager'
  | 'Tour Manager'
  | 'Merch'
  | 'Sound Engineer'
  | 'Crew';

export interface BandMember {
  role: BandRole;
  title?: BandMemberTitle;
}

export interface BandMediaLink {
  id: string;
  type: 'video' | 'audio' | 'other';
  title: string;
  url: string;
}

export interface Band {
  id: string;
  name: string;
  bio?: string;
  profilePictureUrl?: string;
  mediaLinks?: BandMediaLink[];
  status?: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  members: Record<string, BandMember>;
}

export interface BandDocument {
  id: string;
  bandId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  name?: string;
}

export interface BandMessage {
  id: string;
  bandId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  message: string;
  createdAt: Date;
  updatedAt?: Date;
  edited?: boolean;
}

export interface PromoterDetails {
  name: string;
  email: string;
  phone: string;
}

export interface GuestListEntry {
  id: string;
  name: string;
  addedBy: string;
  addedAt: Date;
}

export interface ShowContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  title?: string;
}

export interface SetListSong {
  id: string;
  title: string;
  order: number;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  description: string;
  order: number;
}

export interface ShowSchedule {
  wheelsUp?: string;
  loadIn?: string;
  soundCheck?: string;
  setTimes?: string[];
  events: ScheduleEvent[];
}

export interface ShowDocument {
  id: string;
  showId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  name?: string;
}

export interface ShowAccounting {
  revenue: {
    settlement: number;
    buyout: number;
    merchCash: number;
    merchDigital: number;
  };
  expenses: {
    supportPayout: number;
    bookingCut: number;
    merchCut: number;
    lodging: number;
    gas: number;
    food: number;
    misc: number;
  };
  notes?: string;
}

export interface Show {
  id: string;
  bandId: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  address?: string;
  phone?: string;
  schedule?: ShowSchedule;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  promoter?: PromoterDetails;
  guestList: GuestListEntry[];
  contacts: ShowContact[];
  setList: SetListSong[];
  documents: ShowDocument[];
  capacity?: number;
  ticketsSold?: number;
  buyout?: number;
  riderAvailable?: boolean;
  greenroom?: boolean;
  guestSpotsAvailable?: number;
  compsAvailable?: number;
  ticketLink?: string;
  notes?: string;
  isTravelDay?: boolean;
}

export interface ShowAttachment {
  id: string;
  showId: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export type InviteStatus = 'pending' | 'accepted' | 'revoked';

export interface Invite {
  id: string;
  bandId: string;
  bandName: string;
  email: string;
  role: BandRole;
  status: InviteStatus;
  createdAt: Date;
  acceptedAt?: Date;
  userId?: string;
}

export interface MediaLink {
  id: string;
  type: 'video' | 'audio' | 'other';
  title: string;
  url: string;
  order: number;
}

export type Instrument =
  | 'vocals'
  | 'guitar'
  | 'bass'
  | 'drums'
  | 'keyboard'
  | 'violin'
  | 'pedal steel'
  | 'harmonica'
  | 'accordion'
  | 'theremin'
  | 'orchestration'
  | 'saxophone'
  | 'trombone'
  | 'flute'
  | 'trumpet'
  | 'percussion'
  | 'synth'
  | 'promoter'
  | 'dj'
  | 'production'
  | 'ableton'
  | 'tour manager'
  | 'sound engineering'
  | 'lighting'
  | 'video'
  | 'photography'
  | 'merchandising';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  bio?: string;
  website?: string;
  phone?: string;
  showPhone: boolean;
  profilePictureUrl?: string;
  isPublic: boolean;
  instruments: Instrument[];
  mediaLinks: MediaLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tour {
  id: string;
  bandId: string;
  name: string;
  description?: string;
  posterUrl?: string;
  startDate: string;
  endDate: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

export interface MerchItem {
  id: string;
  tourId: string;
  bandId: string;
  name: string;
  hasSizes: boolean;
  quantity?: number;
  count?: number;
  sizes: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; xxxl: number };
  counts?: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; xxxl: number };
  cost: number;
  salePrice: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

export interface TourExpense {
  id: string;
  tourId: string;
  bandId: string;
  title: string;
  amount: number;
  isPayout?: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}
