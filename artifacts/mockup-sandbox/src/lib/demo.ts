export type Role = 'ADMIN' | 'ADVISOR' | 'STUDENT' | 'PARENT';
export type ClubStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'COMPLETED';
export type RequestStatus = 'PENDING_PARENT' | 'PENDING_ADVISOR' | 'ACTIVE' | 'REJECTED' | 'WITHDRAWN';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type DemoUser = { id: string; name: string; email: string; role: Role; grade?: string; phone?: string; status: 'Active' | 'On leave' };
export type Club = {
  id: string; name: string; description: string; category: string; grades: string; location: string;
  dates: string; status: ClubStatus; capacity: number; members: number; advisor: string;
};

export const organization = { name: 'Al Noor International School', slug: 'al-noor', city: 'New Cairo, Egypt', initials: 'AN' };
export const currentUser: DemoUser = { id: 'user-admin', name: 'Nadia Farouk', email: 'nadia.farouk@alnoor.edu.eg', role: 'ADMIN', phone: '+20 100 555 0182', status: 'Active' };
export const users: DemoUser[] = [
  currentUser,
  { id: 'student-001', name: 'Layla Hassan', email: 'layla.hassan@alnoor.edu.eg', role: 'STUDENT', grade: 'Grade 10', phone: '+20 101 284 7721', status: 'Active' },
  { id: 'student-002', name: 'Youssef Amin', email: 'youssef.amin@alnoor.edu.eg', role: 'STUDENT', grade: 'Grade 11', status: 'Active' },
  { id: 'student-003', name: 'Mariam Adel', email: 'mariam.adel@alnoor.edu.eg', role: 'STUDENT', grade: 'Grade 9', status: 'Active' },
  { id: 'advisor-001', name: 'Omar Nabil', email: 'omar.nabil@alnoor.edu.eg', role: 'ADVISOR', phone: '+20 100 110 9812', status: 'Active' },
  { id: 'advisor-002', name: 'Mariam Fawzy', email: 'mariam.fawzy@alnoor.edu.eg', role: 'ADVISOR', status: 'Active' },
  { id: 'parent-001', name: 'Hana Hassan', email: 'hana.hassan@gmail.com', role: 'PARENT', phone: '+20 102 883 2120', status: 'Active' },
];
export const clubs: Club[] = [
  { id: 'model-united-nations', name: 'Model United Nations', description: 'Practice research, listening, and confident public speaking through thoughtful debate.', category: 'Academic', grades: 'Grades 9–12', location: 'Room 204', dates: '14–22 Oct', status: 'ACTIVE', capacity: 24, members: 18, advisor: 'Omar Nabil' },
  { id: 'varsity-basketball', name: 'Varsity Basketball', description: 'Build competitive habits, teamwork, and fitness with the school varsity squad.', category: 'Sports', grades: 'Grades 10–12', location: 'Sports Hall', dates: '14–25 Oct', status: 'ACTIVE', capacity: 30, members: 24, advisor: 'Mariam Fawzy' },
  { id: 'ceramics-studio', name: 'Ceramics Studio', description: 'A quiet studio practice exploring form, texture, and the patience of making.', category: 'Arts', grades: 'Grades 8–12', location: 'Art Studio', dates: '14–18 Oct', status: 'ACTIVE', capacity: 14, members: 12, advisor: 'Laila Hassan' },
  { id: 'community-garden', name: 'Community Garden', description: 'Grow a shared garden and learn about care, food systems, and stewardship.', category: 'Service', grades: 'Grades 7–10', location: 'East Garden', dates: '21–30 Oct', status: 'DRAFT', capacity: 20, members: 0, advisor: 'Nour El Din' },
  { id: 'creative-writing', name: 'Creative Writing Lab', description: 'A workshop for short stories, essays, and finding a clear personal voice.', category: 'Academic', grades: 'Grades 9–12', location: 'Library', dates: '—', status: 'ARCHIVED', capacity: 16, members: 0, advisor: 'Hany Said' },
];
export const notifications = [
  { id: 'n1', title: 'Parent approval received', message: 'Hana Hassan approved Layla’s participation in Model United Nations.', time: '18 min ago', read: false, type: 'Approval' },
  { id: 'n2', title: 'Attendance needs review', message: 'The 14 October session has two attendance records to complete.', time: '2 hours ago', read: false, type: 'Attendance' },
  { id: 'n3', title: 'New advisor request', message: 'Model United Nations requested one additional advisor for Term 1.', time: 'Yesterday', read: true, type: 'Request' },
  { id: 'n4', title: 'New announcement', message: 'Omar Nabil posted “Position paper workshop next week”.', time: 'Yesterday', read: true, type: 'Announcement' },
];
export const requests = [
  { id: 'r1', student: 'Youssef Amin', club: 'Model United Nations', stage: 'Advisor approval', status: 'PENDING_ADVISOR' as RequestStatus, detail: 'Grade 11 · requested 13 Oct' },
  { id: 'r2', student: 'Mariam Adel', club: 'Ceramics Studio', stage: 'Parent approval', status: 'PENDING_PARENT' as RequestStatus, detail: 'Grade 9 · requested 12 Oct' },
  { id: 'r3', student: 'Layla Hassan', club: 'Varsity Basketball', stage: 'Active', status: 'ACTIVE' as RequestStatus, detail: 'Grade 10 · joined 02 Sep' },
];
export const sessions = [
  { id: 's1', date: '14 Oct', title: 'Opening statements', time: '15:30–16:45', location: 'Room 204', status: 'Completed' },
  { id: 's2', date: '21 Oct', title: 'Position paper workshop', time: '15:30–16:45', location: 'Room 204', status: 'Scheduled' },
  { id: 's3', date: '28 Oct', title: 'Mock committee', time: '15:30–16:45', location: 'Auditorium', status: 'Scheduled' },
];
export const audit = [
  { action: 'Parent approved membership', actor: 'Hana Hassan', target: 'Layla Hassan · Model United Nations', time: 'Today, 09:42' },
  { action: 'Attendance updated', actor: 'Omar Nabil', target: '14 Oct session', time: 'Yesterday, 16:54' },
  { action: 'Club published', actor: 'Nadia Farouk', target: 'Community Garden', time: '12 Oct, 11:20' },
];
