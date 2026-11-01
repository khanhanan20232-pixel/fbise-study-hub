// Field / stream data for FBISE classes (presentational only — no DB use).
// Used by the "Choose Your Field" section on each class page to recommend
// subjects: compulsory subjects for the class + the student's field subjects.

export interface StreamInfo {
  id: string;
  name: string;
  description: string;
  subjects: string[];
}

export interface StreamData {
  compulsory: string[];
  streams: StreamInfo[];
  note?: string;
}

// ---- SSC (Class 9 & 10) ----

const SSC_STREAMS: StreamInfo[] = [
  {
    id: 'ssc-science',
    name: 'Science',
    description: 'The most common SSC stream – base for Pre-Medical and Pre-Engineering in college.',
    subjects: ['Physics', 'Chemistry', 'Biology'],
  },
  {
    id: 'ssc-computer-science',
    name: 'Computer Science',
    description: 'Science stream with Computer Science instead of Biology – base for ICS in college.',
    subjects: ['Physics', 'Chemistry', 'Computer Science'],
  },
  {
    id: 'ssc-humanities',
    name: 'Humanities',
    description: 'General subjects stream. Electives vary by school – common choices are listed here.',
    subjects: ['General Science', 'General Mathematics', 'Education', 'Civics'],
  },
];

const SSC_DATA: Record<string, StreamData> = {
  '9': {
    compulsory: ['English', 'Urdu', 'Mathematics', 'Islamiat'],
    streams: SSC_STREAMS,
    note: 'Humanities students study General Mathematics and General Science in place of Mathematics and the Science subjects.',
  },
  '10': {
    compulsory: ['English', 'Urdu', 'Mathematics', 'Pakistan Studies'],
    streams: SSC_STREAMS,
    note: 'Humanities students study General Mathematics and General Science in place of Mathematics and the Science subjects.',
  },
};

// ---- HSSC (Class 11 & 12) ----

const HSSC_STREAMS: StreamInfo[] = [
  {
    id: 'hssc-pre-medical',
    name: 'Pre-Medical',
    description: 'For students aiming at MBBS, BDS and other medical / life-science fields.',
    subjects: ['Biology', 'Physics', 'Chemistry'],
  },
  {
    id: 'hssc-pre-engineering',
    name: 'Pre-Engineering',
    description: 'For students aiming at engineering universities and technical fields.',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
  },
  {
    id: 'hssc-ics',
    name: 'ICS (Computer Science)',
    description: 'Intermediate in Computer Science – Physics, Computer Science, Mathematics + compulsory subjects.',
    subjects: ['Computer Science', 'Mathematics', 'Physics'],
  },
  {
    id: 'hssc-commerce',
    name: 'Commerce (I.Com)',
    description: 'For students aiming at business, accounting and finance studies.',
    subjects: ['Principles of Accounting', 'Principles of Economics', 'Commercial Geography'],
  },
  {
    id: 'hssc-humanities',
    name: 'Humanities',
    description: 'Arts / humanities stream. Elective combinations vary by college – common subjects are listed here.',
    subjects: ['Psychology', 'Education', 'Civics', 'Economics'],
  },
];

const HSSC_DATA: Record<string, StreamData> = {
  '11': {
    compulsory: ['English', 'Urdu', 'Islamiat'],
    streams: HSSC_STREAMS,
  },
  '12': {
    compulsory: ['English', 'Urdu', 'Pakistan Studies'],
    streams: HSSC_STREAMS,
  },
};

export function getStreamData(classGrade: string): StreamData {
  return SSC_DATA[classGrade] || HSSC_DATA[classGrade] || SSC_DATA['9'];
}
