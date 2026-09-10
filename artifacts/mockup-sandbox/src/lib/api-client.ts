export interface ApiClub {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'COMPLETED';
  capacity: number;
  membersCount?: number;
  minGrade?: number;
  maxGrade?: number;
  advisorName?: string;
  location?: string;
  dates?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  grade?: string;
  phone?: string;
  status?: string;
}

export interface ApiMembership {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel?: number;
  clubId: string;
  clubName: string;
  status: string;
  parentApprovedAt?: string | null;
  advisorApprovedAt?: string | null;
  createdAt: string;
}

export async function fetchClubs(orgSlug: string): Promise<ApiClub[]> {
  try {
    const res = await fetch(`/api/organizations/${orgSlug}/clubs`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.clubs || [];
  } catch {
    return [];
  }
}

export async function fetchExploreClubs(orgSlug: string): Promise<ApiClub[]> {
  try {
    const res = await fetch(`/api/organizations/${orgSlug}/clubs/explore`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.clubs || [];
  } catch {
    return [];
  }
}

export async function createClub(orgSlug: string, clubData: Partial<ApiClub>) {
  const res = await fetch(`/api/organizations/${orgSlug}/clubs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clubData),
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create club');
  }
  return res.json();
}

export async function requestJoinClub(orgSlug: string, clubId: string) {
  const res = await fetch(`/api/organizations/${orgSlug}/clubs/${clubId}/join`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit join request');
  }
  return res.json();
}

export async function fetchMemberships(orgSlug: string, params?: { status?: string }): Promise<ApiMembership[]> {
  try {
    const query = params?.status ? `?status=${params.status}` : '';
    const res = await fetch(`/api/organizations/${orgSlug}/club-memberships${query}`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.memberships || [];
  } catch {
    return [];
  }
}

export async function parentApproveMembership(orgSlug: string, membershipId: string) {
  const res = await fetch(`/api/organizations/${orgSlug}/club-memberships/${membershipId}/parent-approve`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Parent approval failed');
  return res.json();
}

export async function parentRejectMembership(orgSlug: string, membershipId: string, reason?: string) {
  const res = await fetch(`/api/organizations/${orgSlug}/club-memberships/${membershipId}/parent-reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Parent rejection failed');
  return res.json();
}

export async function advisorApproveMembership(orgSlug: string, membershipId: string) {
  const res = await fetch(`/api/organizations/${orgSlug}/club-memberships/${membershipId}/advisor-approve`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Advisor approval failed');
  return res.json();
}

export async function advisorRejectMembership(orgSlug: string, membershipId: string, reason?: string) {
  const res = await fetch(`/api/organizations/${orgSlug}/club-memberships/${membershipId}/advisor-reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Advisor rejection failed');
  return res.json();
}

export async function fetchUsers(orgSlug: string): Promise<ApiUser[]> {
  try {
    const res = await fetch(`/api/organizations/${orgSlug}/users`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.users || [];
  } catch {
    return [];
  }
}
