import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  GraduationCap,
  MapPin,
  MoreHorizontal,
  Plus,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import {
  AppShell,
  Avatar,
  PageFrame,
  SearchBox,
  SectionCard,
  StatusPill,
} from '@/components/guidr-shell';
import { useAuth } from '@/lib/AuthContext';
import {
  audit,
  clubs as seedClubs,
  currentUser as seedUser,
  notifications as seedNotifications,
  organization as seedOrg,
  requests as seedRequests,
  sessions as seedSessions,
  users as seedUsers,
  type AttendanceStatus,
  type ClubStatus,
  type RequestStatus,
  type Role,
} from '@/lib/demo';
import {
  fetchClubs,
  fetchExploreClubs,
  createClub,
  requestJoinClub,
  fetchMemberships,
  parentApproveMembership,
  parentRejectMembership,
  advisorApproveMembership,
  advisorRejectMembership,
  fetchUsers,
} from '@/lib/api-client';

const Button = ({
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
}) => {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:brightness-110',
    secondary: 'border border-input bg-card hover:bg-secondary',
    quiet: 'text-muted-foreground hover:bg-secondary',
    danger: 'border border-[#c99894] text-[#8e302b] hover:bg-[#f2e1e0]',
  };
  return (
    <button
      {...props}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded px-3 text-xs font-semibold transition ${styles[variant]} ${props.className || ''}`}
    >
      {children}
    </button>
  );
};

const Field = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="block text-xs font-medium text-foreground">
    <span className="mb-1.5 block text-muted-foreground">{label}</span>
    <input
      {...props}
      className="h-10 w-full rounded border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
    />
  </label>
);

const SelectField = ({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) => (
  <label className="block text-xs font-medium text-foreground">
    <span className="mb-1.5 block text-muted-foreground">{label}</span>
    <select
      {...props}
      className="h-10 w-full rounded border border-input bg-card px-3 text-sm outline-none focus:border-primary"
    >
      {children}
    </select>
  </label>
);

const Empty = ({ title, copy }: { title: string; copy: string }) => (
  <div className="py-12 text-center">
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
      <FileText size={17} />
    </div>
    <h3 className="text-sm font-semibold">{title}</h3>
    <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{copy}</p>
  </div>
);

export function LoginPage() {
  const [, navigate] = useLocation();
  const { refetchUser } = useAuth();
  const [email, setEmail] = useState('admin@guidred.org');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (res.ok) {
        await refetchUser();
        setMessage('Signed in successfully.');
        setTimeout(() => navigate('/select-organization'), 350);
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessage(errData.error || 'Invalid credentials. Signing in as demo workspace...');
        setTimeout(() => navigate('/select-organization'), 500);
      }
    } catch {
      setMessage('Signing in as demo workspace...');
      setTimeout(() => navigate('/select-organization'), 350);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#111110] text-stone-100">
      <div className="flex items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-2 text-lg font-semibold">
          guidr <span className="h-2 w-2 rounded-full bg-[#9a2733]" />
        </div>
        <div className="text-xs text-stone-400">
          Admin portal <span className="ml-4 text-stone-100">Create account</span>
        </div>
      </div>
      <div className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-md items-center justify-center px-6 pb-16">
        <div className="w-full">
          <div className="mb-8 text-[10px] font-semibold uppercase tracking-[.22em] text-[#b94651]">
            Welcome back
          </div>
          <h1 className="mb-9 text-4xl font-medium tracking-tight">
            Log in<span className="text-[#a62f3a]">.</span>
          </h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block text-xs text-stone-400">
              Email address
              <input
                data-testid="input-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                placeholder="you@school.edu"
                className="mt-2 h-11 w-full border border-zinc-700 bg-zinc-900 px-3 text-sm text-stone-100 outline-none focus:border-[#9a2733]"
              />
            </label>
            <label className="block text-xs text-stone-400">
              Password
              <input
                data-testid="input-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                placeholder="••••••••"
                className="mt-2 h-11 w-full border border-zinc-700 bg-zinc-900 px-3 text-sm text-stone-100 outline-none focus:border-[#9a2733]"
              />
            </label>
            <div className="flex justify-end">
              <button
                data-testid="button-forgot-password"
                type="button"
                onClick={() => setMessage('Password reset instructions sent.')}
                className="text-[11px] text-stone-500 hover:text-stone-100"
              >
                Forgot password?
              </button>
            </div>
            <button
              data-testid="button-submit-login"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[#a5232d] text-xs font-semibold hover:bg-[#bb2b38]"
              type="submit"
            >
              {submitting ? 'Signing in...' : 'Log in'} <ArrowRight size={15} />
            </button>
          </form>
          {message && (
            <div data-testid="status-login" className="mt-5 border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-stone-300">
              {message}
            </div>
          )}
          <p className="mt-6 text-[11px] text-stone-500">
            New to Guidr?{' '}
            <button
              data-testid="button-create-account"
              className="text-stone-300 hover:text-white"
              onClick={() => setMessage('Ask your school administrator for an invitation.')}
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function SelectOrganizationPage() {
  const [, navigate] = useLocation();
  const { organizations, setActiveOrganization } = useAuth();
  const [selected, setSelected] = useState('al-noor');

  const availableOrgs = organizations.length > 0 ? organizations : [
    { id: 'al-noor', name: seedOrg.name, slug: 'al-noor', membershipId: 'mem-1', roles: ['ADMIN', 'ADVISOR'] },
    { id: 'cairo-west', name: 'Cairo West Academy', slug: 'cairo-west', membershipId: 'mem-2', roles: ['ADVISOR'] },
  ];

  const handleEnter = () => {
    const targetOrg = availableOrgs.find((o) => o.slug === selected || o.id === selected) || availableOrgs[0];
    if (setActiveOrganization && typeof setActiveOrganization === 'function') {
      setActiveOrganization(targetOrg as any);
    }
    navigate(`/${targetOrg.slug || 'al-noor'}/dashboard`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#111110] px-6 py-6 text-stone-100">
      <div className="text-lg font-semibold">
        guidr <span className="text-[#a5232d]">.</span>
      </div>
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-2xl items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-[10px] uppercase tracking-[.22em] text-[#b94651]">Your schools</div>
          <h1 className="text-3xl font-medium">Where are you working today?</h1>
          <p className="mt-2 text-sm text-stone-500">Select an organization to load its workspace and permissions.</p>
          <div className="mt-8 space-y-3">
            {availableOrgs.map((org: any) => (
              <button
                data-testid={`button-organization-${org.slug || org.id}`}
                key={org.id}
                onClick={() => setSelected(org.slug || org.id)}
                className={`flex w-full items-center justify-between border p-5 text-left transition ${
                  selected === (org.slug || org.id) ? 'border-[#a5232d] bg-zinc-900' : 'border-zinc-800 bg-[#171716] hover:border-zinc-600'
                }`}
              >
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="mt-1 text-xs text-stone-500">New Cairo · 1,248 students</div>
                </div>
                <div className="text-right text-[10px] uppercase tracking-widest text-stone-500">
                  {org.roles?.join(' · ') || 'Member'}
                  {selected === (org.slug || org.id) && <div className="mt-2 text-[#c64a54]">Selected</div>}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-7 border-t border-zinc-800 pt-5">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-stone-500">Preview a role</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Admin', href: '/al-noor/dashboard' },
                { label: 'Advisor', href: '/al-noor/my-clubs' },
                { label: 'Student', href: '/al-noor/clubs/explore' },
                { label: 'Parent', href: '/al-noor/my-children' },
              ].map((role: any) => (
                <Link
                  data-testid={`link-role-${role.label.toLowerCase()}`}
                  key={role.label}
                  href={role.href}
                  className="border border-zinc-800 bg-[#171716] px-3 py-3 text-center text-xs text-stone-300 hover:border-[#a5232d] hover:text-white"
                >
                  {role.label}
                </Link>
              ))}
            </div>
          </div>
          <Button data-testid="button-enter-organization" onClick={handleEnter} className="mt-7 h-11 w-full">
            Enter workspace <ArrowRight size={15} />
          </Button>
          <Link data-testid="link-back-login" href="/login" className="mt-5 block text-center text-xs text-stone-500 hover:text-stone-200">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

const Metric = ({ label, value, note, tone = 'normal' }: { label: string; value: string; note: string; tone?: 'normal' | 'accent' }) => (
  <div className={`rounded-lg border p-5 ${tone === 'accent' ? 'border-[#a86d70] bg-[#fbf2ee]' : 'border-border bg-card'}`}>
    <div className="text-[10px] uppercase tracking-[.15em] text-muted-foreground">{label}</div>
    <div className="mt-3 text-3xl font-medium tracking-tight">{value}</div>
    <div className="mt-2 text-xs text-muted-foreground">{note}</div>
  </div>
);

export function DashboardPage({ role = 'ADMIN' }: { role?: Role }) {
  const { user } = useAuth();
  if (role === 'STUDENT') return <StudentDashboard />;
  if (role === 'PARENT') return <ParentDashboard />;
  if (role === 'ADVISOR') return <AdvisorDashboard />;

  const greetingName = user?.fullName ? user.fullName.split(' ')[0] : 'Nadia';

  return (
    <AppShell role="ADMIN">
      <PageFrame
        eyebrow="School operations"
        title={`Good morning, ${greetingName}.`}
        description="Here is the clearest view of what needs your attention today."
        action={
          <Link data-testid="link-dashboard-create" href="/al-noor/clubs/create">
            <Button>Create activity <Plus size={14} /></Button>
          </Link>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Active activities" value="12" note="+2 this term" />
          <Metric label="Students participating" value="186" note="Across 9 activities" tone="accent" />
          <Metric label="Open approvals" value="7" note="3 need your review" />
          <Metric label="Attendance to review" value="4" note="From this week" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.85fr]">
          <SectionCard title="Today’s next steps" action={<Link data-testid="link-dashboard-requests" href="/al-noor/requests" className="text-xs font-semibold text-primary">View all</Link>}>
            <div className="divide-y divide-border">
              {[
                { title: 'Review membership requests', meta: '3 advisor approvals · 2 parent approvals', href: '/al-noor/requests', tag: 'Needs attention' },
                { title: 'Complete attendance', meta: 'Model United Nations · 14 October', href: '/al-noor/clubs/model-united-nations', tag: 'Due today' },
                { title: 'Advisor support request', meta: 'Model United Nations needs 1 additional advisor', href: '/al-noor/advisor-requests', tag: 'New' },
              ].map((item: any) => (
                <Link data-testid={`link-next-step-${item.title.slice(0, 3).toLowerCase()}`} href={item.href} key={item.title} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.meta}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusPill tone={item.tag === 'New' ? 'good' : 'warn'}>{item.tag}</StatusPill>
                    <ChevronRight size={15} className="text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Activity pulse">
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Participation this term</span><span className="font-semibold">74%</span></div>
                <div className="h-2 rounded-full bg-secondary"><div className="h-2 w-[74%] rounded-full bg-primary" /></div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Attendance recorded</span><span className="font-semibold">91%</span></div>
                <div className="h-2 rounded-full bg-secondary"><div className="h-2 w-[91%] rounded-full bg-[#53715d]" /></div>
              </div>
              <div className="border-t border-border pt-4 text-xs text-muted-foreground">The next meaningful step is visible across every student journey.</div>
            </div>
          </SectionCard>
        </div>
        <div className="mt-6">
          <SectionCard title="Recent history" action={<Link data-testid="link-dashboard-history" href="/al-noor/notifications" className="text-xs font-semibold text-primary">Open activity log</Link>}>
            <div className="grid gap-4 md:grid-cols-3">
              {audit.map((item: any) => (
                <div key={item.time} className="border-l-2 border-[#d3b6ab] pl-3">
                  <div className="text-xs font-semibold">{item.action}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.target}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </PageFrame>
    </AppShell>
  );
}

function AdvisorDashboard() {
  return (
    <AppShell role="ADVISOR">
      <PageFrame eyebrow="Advisor space" title="Your activities, at a glance." description="Keep the next session and the next student step close.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Assigned activities" value="4" note="42 students" />
          <Metric label="Requests to review" value="3" note="After parent approval" tone="accent" />
          <Metric label="Next session" value="15:30" note="Model United Nations · Room 204" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <SectionCard title="Assigned activities">
            <div className="divide-y divide-border">
              {seedClubs.slice(0, 3).map((club: any) => (
                <Link data-testid={`link-advisor-club-${club.id}`} href="/al-noor/clubs/model-united-nations" key={club.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-semibold">{club.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{club.members} students · {club.location}</div>
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Attendance signal">
            <div className="text-4xl font-medium">91<span className="text-xl text-muted-foreground">%</span></div>
            <p className="mt-2 text-xs text-muted-foreground">18 of 20 records are up to date this week.</p>
            <Button data-testid="button-advisor-attendance" variant="secondary" className="mt-5">Open attendance</Button>
          </SectionCard>
        </div>
      </PageFrame>
    </AppShell>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Layla';
  return (
    <AppShell role="STUDENT">
      <PageFrame eyebrow="Student space" title={`Good morning, ${firstName}.`} description="Your next meaningful steps, in one place." action={<Link data-testid="link-student-explore" href="/al-noor/clubs/explore"><Button>Explore activities <ArrowRight size={14} /></Button></Link>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Active activities" value="2" note="Model United Nations · Basketball" />
          <Metric label="Sessions attended" value="8 / 9" note="89% attendance" tone="accent" />
          <Metric label="Open requests" value="1" note="Waiting for advisor" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <SectionCard title="Next on your week">
            <div className="flex gap-4 border-l-2 border-primary pl-4">
              <div>
                <div className="text-sm font-semibold">Model United Nations</div>
                <div className="mt-1 text-xs text-muted-foreground">Position paper workshop · Monday, 15:30</div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground"><MapPin size={13} />Room 204</div>
              </div>
              <StatusPill tone="good">Tomorrow</StatusPill>
            </div>
          </SectionCard>
          <SectionCard title="Your progress">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-medium">89%</div>
                <div className="text-xs text-muted-foreground">attendance this term</div>
              </div>
              <ShieldCheck className="text-primary" size={25} />
            </div>
            <div className="mt-4 h-2 rounded bg-secondary"><div className="h-2 w-[89%] rounded bg-primary" /></div>
          </SectionCard>
        </div>
        <div className="mt-6">
          <SectionCard title="Recent activity">
            <div className="divide-y divide-border">
              {['Present · 14 October', 'Position paper workshop next week', 'Team contributor badge awarded'].map((text: string) => (
                <div key={text} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm">{text}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Activity</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </PageFrame>
    </AppShell>
  );
}

function ParentDashboard() {
  return (
    <AppShell role="PARENT">
      <PageFrame eyebrow="Parent space" title="Hana’s family view." description="Stay close to each child’s participation and upcoming decisions." action={<Link data-testid="link-parent-children" href="/al-noor/my-children"><Button variant="secondary">Switch child <ChevronRight size={14} /></Button></Link>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Children" value="2" note="Layla and Adam" />
          <Metric label="Activities" value="3" note="Across both children" tone="accent" />
          <Metric label="Approvals" value="1" note="Needs your decision" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SectionCard title="Layla Hassan" action={<Link data-testid="link-parent-layla" href="/al-noor/children/layla" className="text-xs font-semibold text-primary">View dashboard</Link>}>
            <div className="flex items-center gap-3">
              <Avatar name="Layla Hassan" />
              <div>
                <div className="text-sm font-semibold">Grade 10</div>
                <div className="text-xs text-muted-foreground">2 active activities · 89% attendance</div>
              </div>
            </div>
            <div className="mt-5 border-t border-border pt-4 text-xs"><span className="font-semibold">Next:</span> Model United Nations · Monday 15:30</div>
          </SectionCard>
          <SectionCard title="Needs your attention">
            <div className="border-l-2 border-primary pl-4">
              <div className="text-sm font-semibold">Review Ceramics Studio request</div>
              <div className="mt-1 text-xs text-muted-foreground">Mariam Adel · Grade 9 · parent approval</div>
              <Link data-testid="link-parent-requests" href="/al-noor/children/layla/requests">
                <Button className="mt-4">Review request <ArrowRight size={14} /></Button>
              </Link>
            </div>
          </SectionCard>
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState(seedNotifications);
  return (
    <AppShell>
      <PageFrame eyebrow="Communication" title="Notifications" description="A focused record of decisions, updates, and next steps." action={<Button data-testid="button-mark-all-read" variant="secondary" onClick={() => setItems(items.map((item: any) => ({ ...item, read: true })))}>Mark all as read</Button>}>
        <SectionCard>
          <div className="mb-5 flex gap-2">
            <StatusPill>{items.filter((item: any) => !item.read).length} unread</StatusPill>
            <span className="text-xs text-muted-foreground">Latest first</span>
          </div>
          <div className="divide-y divide-border">
            {items.map((item: any) => (
              <button
                data-testid={`button-notification-${item.id}`}
                onClick={() => setItems(items.map((current: any) => (current.id === item.id ? { ...current, read: true } : current)))}
                key={item.id}
                className={`flex w-full gap-4 py-4 text-left first:pt-0 last:pb-0 ${!item.read ? '' : 'opacity-70'}`}
              >
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read ? 'bg-border' : 'bg-primary'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <span className="whitespace-nowrap text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.message}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-wide text-primary">{item.type}</div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </PageFrame>
    </AppShell>
  );
}

export function ProfilePage() {
  const { user, activeOrganization } = useAuth();
  const [saved, setSaved] = useState(false);
  const name = user?.fullName || seedUser.name;
  const email = user?.email || seedUser.email;
  const orgName = activeOrganization?.name || seedOrg.name;

  return (
    <AppShell>
      <PageFrame eyebrow="Account" title="Your profile" description="Manage your identity and workspace preferences.">
        <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
          <SectionCard>
            <div className="flex flex-col items-center text-center">
              <Avatar name={name} />
              <h2 className="mt-3 text-lg font-semibold">{name}</h2>
              <p className="text-xs text-muted-foreground">{email}</p>
              <StatusPill tone="good">Admin</StatusPill>
              <div className="mt-6 w-full border-t border-border pt-5 text-left text-xs">
                <div className="flex justify-between py-2"><span className="text-muted-foreground">Organization</span><span>{orgName}</span></div>
                <div className="flex justify-between py-2"><span className="text-muted-foreground">Access</span><span>Admin · Advisor</span></div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Personal details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" defaultValue={name} />
              <Field label="Email address" defaultValue={email} type="email" />
              <Field label="Phone" defaultValue="+20 100 555 0182" />
              <Field label="Role" value="School administrator" readOnly />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button data-testid="button-save-profile" onClick={() => setSaved(true)}>Save changes</Button>
              {saved && <span data-testid="status-profile-saved" className="text-xs text-[#32553d]">Profile saved locally.</span>}
            </div>
          </SectionCard>
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function ClubsPage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | ClubStatus>('ALL');
  const [clubsList, setClubsList] = useState<any[]>(seedClubs);

  useEffect(() => {
    fetchClubs(orgSlug).then((data) => {
      if (data && data.length > 0) {
        setClubsList(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            category: c.category || 'Academic',
            status: c.status || 'ACTIVE',
            capacity: c.capacity || 24,
            members: c.membersCount || 18,
            advisor: c.advisorName || 'Omar Nabil',
            dates: c.dates || '14–22 Oct',
          }))
        );
      }
    });
  }, [orgSlug]);

  const visible = clubsList.filter(
    (club: any) =>
      (filter === 'ALL' || club.status === filter) &&
      `${club.name} ${club.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <PageFrame
        eyebrow="Catalogue"
        title="Activities"
        description="Keep every opportunity clear from first draft to archived record."
        action={
          <Link data-testid="link-create-activity" href={`/${orgSlug}/clubs/create`}>
            <Button>Create activity <Plus size={14} /></Button>
          </Link>
        }
      >
        <SectionCard>
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchBox value={search} onChange={setSearch} placeholder="Search activities" />
            <div className="flex gap-1 overflow-auto">
              {(['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'] as const).map((item) => (
                <button
                  data-testid={`button-filter-${item.toLowerCase()}`}
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`h-10 whitespace-nowrap rounded px-3 text-xs font-semibold ${
                    filter === item ? 'bg-primary text-primary-foreground' : 'border border-input bg-card hover:bg-secondary'
                  }`}
                >
                  {item === 'ALL' ? 'All' : item[0] + item.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3 pl-2">Activity</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Advisor</th>
                  <th className="pb-3">Capacity</th>
                  <th className="pb-3">Registration</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((club: any) => (
                  <tr data-testid={`row-club-${club.id}`} key={club.id}>
                    <td className="py-4 pl-2 font-semibold">
                      {club.name}
                      <div className="mt-1 max-w-xs truncate font-normal text-muted-foreground">{club.description}</div>
                    </td>
                    <td>{club.category}</td>
                    <td>{club.advisor}</td>
                    <td>{club.members} / {club.capacity}</td>
                    <td>{club.dates}</td>
                    <td>
                      <StatusPill tone={club.status === 'ACTIVE' ? 'good' : club.status === 'DRAFT' ? 'warn' : 'neutral'}>
                        {club.status === 'ACTIVE' ? 'Published' : club.status[0] + club.status.slice(1).toLowerCase()}
                      </StatusPill>
                    </td>
                    <td>
                      <Link data-testid={`link-view-club-${club.id}`} href={`/${orgSlug}/clubs/${club.id}`} className="font-semibold text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && <Empty title="No matching activities" copy="Try a different search or status filter." />}
          </div>
        </SectionCard>
      </PageFrame>
    </AppShell>
  );
}

export function CreateClubPage() {
  const [, navigate] = useLocation();
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('24');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    try {
      await createClub(orgSlug, {
        name,
        description,
        category,
        capacity: parseInt(capacity, 10) || 24,
        status: 'ACTIVE',
      });
    } catch (err) {
      console.log('Using local state creation fallback:', err);
    }
    setTimeout(() => navigate(`/${orgSlug}/clubs`), 700);
  };

  return (
    <AppShell>
      <PageFrame eyebrow="Catalogue / New activity" title="Create activity" description="Set up the essentials first. You can add sessions and resources from the activity workspace.">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
            <SectionCard title="Activity details">
              <div className="space-y-4">
                <Field label="Activity name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Model United Nations" />
                <label className="block text-xs font-medium text-muted-foreground">
                  Description
                  <textarea
                    data-testid="input-description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 min-h-28 w-full rounded border border-input bg-card p-3 text-sm outline-none focus:border-primary"
                    placeholder="What will students learn or practise?"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Academic</option>
                    <option>Arts</option>
                    <option>Sports</option>
                    <option>Service</option>
                  </SelectField>
                  <Field label="Location" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room or facility" />
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Eligibility & registration">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Minimum grade" defaultValue="Grade 9">
                    {Array.from({ length: 6 }, (_, i) => <option key={i}>Grade {i + 7}</option>)}
                  </SelectField>
                  <SelectField label="Maximum grade" defaultValue="Grade 12">
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </SelectField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start date" required type="date" defaultValue="2026-10-14" />
                  <Field label="End date" required type="date" defaultValue="2026-10-22" />
                </div>
                <Field label="Capacity" required type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
            </SectionCard>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Link data-testid="link-cancel-create" href={`/${orgSlug}/clubs`}>
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button data-testid="button-submit-activity" type="submit">
              {saved ? 'Created' : 'Create activity'} <ArrowRight size={14} />
            </Button>
          </div>
        </form>
      </PageFrame>
    </AppShell>
  );
}

const tabs = ['Overview', 'Members', 'Advisors', 'Schedule', 'Sessions', 'Attendance', 'Announcements', 'Resources', 'Badges'] as const;

export function ClubWorkspacePage({ student = false, parent = false }: { student?: boolean; parent?: boolean }) {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview');
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({
    'Layla Hassan': 'PRESENT',
    'Youssef Amin': 'LATE',
    'Mariam Adel': 'PRESENT',
  });
  const [joined, setJoined] = useState(false);
  const club = seedClubs[0];

  const handleJoin = async () => {
    setJoined(true);
    try {
      await requestJoinClub(orgSlug, club.id);
    } catch {
      // Keep joined state fallback
    }
  };

  if (student)
    return (
      <AppShell role="STUDENT">
        <PageFrame
          eyebrow="Student space · Model United Nations"
          title={club.name}
          description={club.description}
          action={<StatusPill tone="good">{joined ? 'Request sent' : 'Approved · Term 1'}</StatusPill>}
        >
          <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
            {['Overview', 'Schedule', 'Attendance', 'Announcements', 'Resources', 'Achievements'].map((item) => (
              <button
                data-testid={`button-student-tab-${item.toLowerCase()}`}
                key={item}
                onClick={() => setTab(item as any)}
                className={`whitespace-nowrap rounded px-3 py-2 text-xs font-semibold ${
                  tab === item ? 'bg-primary text-primary-foreground' : 'border border-input bg-card'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {tab === 'Overview' && (
              <>
                <SectionCard title="Overview">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {club.description} Weekly sessions build the habits behind thoughtful debate and constructive disagreement.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                    <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Advisor</div><div className="mt-1 font-semibold">{club.advisor}</div></div>
                    <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Schedule</div><div className="mt-1 font-semibold">Mondays · 15:30</div></div>
                  </div>
                </SectionCard>
                <SectionCard title="Progress this term">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Sessions attended</span>
                    <span className="text-2xl font-medium">8 / 9</span>
                  </div>
                  <div className="mt-4 h-2 rounded bg-secondary"><div className="h-2 w-[89%] bg-primary" /></div>
                  <div className="mt-4 flex gap-2">
                    <StatusPill tone="good">Opening statement complete</StatusPill>
                    <StatusPill tone="good">Research brief complete</StatusPill>
                  </div>
                </SectionCard>
              </>
            )}
            {tab === 'Schedule' && (
              <SectionCard title="Upcoming sessions">
                <div className="space-y-3">
                  {seedSessions.map((session: any) => (
                    <div className="flex items-center gap-3 border-b border-border pb-3 last:border-0" key={session.id}>
                      <div className="w-14 text-xs font-semibold text-primary">{session.date}</div>
                      <div>
                        <div className="text-sm font-semibold">{session.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{session.time} · {session.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {tab === 'Attendance' && (
              <SectionCard title="Your attendance">
                <div className="text-4xl font-medium">89%</div>
                <p className="mt-1 text-xs text-muted-foreground">8 present · 1 excused</p>
              </SectionCard>
            )}
            {tab !== 'Overview' && !['Schedule', 'Attendance'].includes(tab) && (
              <SectionCard title={tab}>
                <Empty title={`${tab} will appear here`} copy="Your advisor will add updates as the term progresses." />
              </SectionCard>
            )}
          </div>
          {!joined && (
            <Button data-testid="button-join-activity" onClick={handleJoin} className="mt-6">
              Join this activity <ArrowRight size={14} />
            </Button>
          )}
        </PageFrame>
      </AppShell>
    );

  if (parent)
    return (
      <AppShell role="PARENT">
        <PageFrame
          eyebrow="Layla Hassan · Activity"
          title={club.name}
          description="View participation, progress, and the next meaningful step."
          action={<StatusPill tone="good">Active</StatusPill>}
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <SectionCard title="Activity overview">
              <p className="text-sm leading-relaxed text-muted-foreground">{club.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Advisor</div><div className="mt-1 font-semibold">{club.advisor}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Schedule</div><div className="mt-1 font-semibold">Mondays · 15:30</div></div>
              </div>
            </SectionCard>
            <SectionCard title="Progress this term">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Sessions attended</span>
                <span className="text-xl">8 / 9</span>
              </div>
              <div className="mt-4 h-2 rounded bg-secondary"><div className="h-2 w-[89%] bg-primary" /></div>
              <div className="mt-5 text-xs text-muted-foreground">Layla has completed her opening statement and research brief.</div>
            </SectionCard>
          </div>
          <div className="mt-6">
            <SectionCard title="Recent updates">
              <div className="divide-y divide-border">
                {['Present · 14 October', 'Position paper workshop next week', 'Team contributor badge'].map((item: string) => (
                  <div className="flex justify-between py-3 first:pt-0 last:pb-0 text-sm" key={item}>
                    {item}
                    <span className="text-xs text-muted-foreground">Activity</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </PageFrame>
      </AppShell>
    );

  return (
    <AppShell>
      <PageFrame
        eyebrow="Activity workspace"
        title={club.name}
        description={club.description}
        action={
          <div className="flex gap-2">
            <Button data-testid="button-edit-club" variant="secondary">Edit activity</Button>
            <Button data-testid="button-archive-club" variant="danger">Archive</Button>
          </div>
        }
      >
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
          {tabs.map((item) => (
            <button
              data-testid={`button-workspace-tab-${item.toLowerCase()}`}
              key={item}
              onClick={() => setTab(item)}
              className={`whitespace-nowrap rounded px-3 py-2 text-xs font-semibold ${
                tab === item ? 'bg-primary text-primary-foreground' : 'border border-input bg-card hover:bg-secondary'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6">
          {tab === 'Overview' && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
              <SectionCard title="At a glance">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Registration</div><div className="mt-1 text-lg font-semibold">{club.members} / {club.capacity}</div></div>
                  <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Window</div><div className="mt-1 text-lg font-semibold">{club.dates}</div></div>
                  <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Eligibility</div><div className="mt-1 text-lg font-semibold">{club.grades}</div></div>
                  <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Location</div><div className="mt-1 text-lg font-semibold">{club.location}</div></div>
                </div>
              </SectionCard>
              <SectionCard title="Activity health">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs"><span>Attendance recorded</span><span className="font-semibold">91%</span></div>
                    <div className="mt-2 h-2 rounded bg-secondary"><div className="h-2 w-[91%] rounded bg-[#53715d]" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs"><span>Member capacity</span><span className="font-semibold">75%</span></div>
                    <div className="mt-2 h-2 rounded bg-secondary"><div className="h-2 w-3/4 rounded bg-primary" /></div>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}
          {tab === 'Members' && (
            <SectionCard title="Members" action={<Button variant="secondary">Export list <Download size={14} /></Button>}>
              <div className="divide-y divide-border">
                {['Layla Hassan', 'Youssef Amin', 'Mariam Adel', 'Karim Soliman'].map((name, index) => (
                  <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0" key={name}>
                    <div className="flex items-center gap-3">
                      <Avatar name={name} small />
                      <div>
                        <div className="text-sm font-semibold">{name}</div>
                        <div className="text-xs text-muted-foreground">Grade {index + 9} · joined {index ? '09 Sep' : '02 Sep'}</div>
                      </div>
                    </div>
                    <StatusPill tone="good">Active</StatusPill>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {tab === 'Advisors' && (
            <SectionCard title="Advisors" action={<Button><Plus size={14} />Assign advisor</Button>}>
              <div className="flex items-center justify-between border-b border-border py-3 first:pt-0">
                <div className="flex items-center gap-3">
                  <Avatar name="Omar Nabil" small />
                  <div>
                    <div className="text-sm font-semibold">Omar Nabil</div>
                    <div className="text-xs text-muted-foreground">Lead advisor · 4 assigned activities</div>
                  </div>
                </div>
                <Button variant="quiet"><MoreHorizontal size={16} /></Button>
              </div>
            </SectionCard>
          )}
          {tab === 'Schedule' && (
            <SectionCard title="Recurring schedule" action={<Button><Plus size={14} />Add schedule</Button>}>
              <div className="flex items-center gap-4 border-l-2 border-primary pl-4">
                <CalendarDays size={18} className="text-primary" />
                <div>
                  <div className="text-sm font-semibold">Every Monday</div>
                  <div className="mt-1 text-xs text-muted-foreground">15:30–16:45 · Room 204 · 14–22 October</div>
                </div>
              </div>
            </SectionCard>
          )}
          {tab === 'Sessions' && (
            <SectionCard title="Sessions" action={<Button><Plus size={14} />Create session</Button>}>
              <div className="divide-y divide-border">
                {seedSessions.map((session: any) => (
                  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0" key={session.id}>
                    <div>
                      <div className="text-sm font-semibold">{session.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{session.date} · {session.time} · {session.location}</div>
                    </div>
                    <StatusPill tone={session.status === 'Completed' ? 'good' : 'neutral'}>{session.status}</StatusPill>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {tab === 'Attendance' && (
            <SectionCard title="Attendance · 14 October" action={<Button data-testid="button-save-attendance" onClick={() => {}}>Save attendance <Check size={14} /></Button>}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-xs">
                  <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.keys(attendance).map((name) => (
                      <tr key={name}>
                        <td className="py-3 font-semibold">{name}</td>
                        <td className="py-3">
                          <select
                            data-testid={`select-attendance-${name.toLowerCase().replaceAll(' ', '-')}`}
                            value={attendance[name]}
                            onChange={(event) => setAttendance({ ...attendance, [name]: event.target.value as AttendanceStatus })}
                            className="h-8 rounded border border-input bg-card px-2 text-xs"
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                            <option value="EXCUSED">Excused</option>
                          </select>
                        </td>
                        <td className="py-3 text-muted-foreground">Recorded today</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
          {['Announcements', 'Resources', 'Badges'].includes(tab) && (
            <SectionCard title={tab} action={<Button><Plus size={14} />Add {tab.slice(0, -1).toLowerCase()}</Button>}>
              <Empty title={`No ${tab.toLowerCase()} yet`} copy={`Add the first ${tab.slice(0, -1).toLowerCase()} for this activity.`} />
            </SectionCard>
          )}
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function UsersPage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [search, setSearch] = useState('');
  const [userList, setUserList] = useState<any[]>(seedUsers);

  useEffect(() => {
    fetchUsers(orgSlug).then((data) => {
      if (data && data.length > 0) {
        setUserList(
          data.map((u) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            role: u.roles?.[0] || 'STUDENT',
            grade: u.grade || 'Grade 10',
            status: u.status || 'Active',
          }))
        );
      }
    });
  }, [orgSlug]);

  const filtered = userList.filter((user: any) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <PageFrame eyebrow="People" title="Students & users" description="One school directory for identities, roles, and managed student information." action={<Button data-testid="button-invite-user"><Plus size={14} />Invite user</Button>}>
        <SectionCard>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBox value={search} onChange={setSearch} placeholder="Search by name, email, or role" />
            <Button data-testid="button-import-users" variant="secondary"><Download size={14} />Import users</Button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3 pl-2">Person</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Grade</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user: any) => (
                  <tr key={user.id} data-testid={`row-user-${user.id}`}>
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} small />
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="mt-1 text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><StatusPill>{user.role}</StatusPill></td>
                    <td>{user.grade || '—'}</td>
                    <td><StatusPill tone="good">{user.status}</StatusPill></td>
                    <td>
                      {user.role === 'STUDENT' ? (
                        <Link data-testid={`link-user-${user.id}`} href={`/${orgSlug}/users/student-001`} className="font-semibold text-primary">
                          View profile
                        </Link>
                      ) : (
                        <button data-testid={`button-user-menu-${user.id}`} className="text-muted-foreground">
                          <MoreHorizontal size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </PageFrame>
    </AppShell>
  );
}

export function StudentProfilePage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [grade, setGrade] = useState('Grade 10');
  const [saved, setSaved] = useState(false);

  return (
    <AppShell>
      <PageFrame eyebrow="People / Student profile" title="Layla Hassan" description="Managed student record, participation, and history." action={<Button data-testid="button-edit-student" variant="secondary">Edit record</Button>}>
        <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
          <SectionCard>
            <div className="flex items-center gap-3">
              <Avatar name="Layla Hassan" />
              <div>
                <h2 className="text-lg font-semibold">Layla Hassan</h2>
                <p className="text-xs text-muted-foreground">Student ID · AN-2024-001</p>
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs">
              <div className="flex justify-between py-2"><span className="text-muted-foreground">Email</span><span>layla.hassan@alnoor.edu.eg</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground">Parent</span><span>Hana Hassan</span></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground">Status</span><StatusPill tone="good">Active</StatusPill></div>
            </div>
          </SectionCard>
          <div className="space-y-6">
            <SectionCard title="School-managed details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Student ID" value="AN-2024-001" readOnly />
                <label className="block text-xs font-medium text-foreground">
                  <span className="mb-1.5 block text-muted-foreground">Grade</span>
                  <select data-testid="select-student-grade" value={grade} onChange={(event) => { setGrade(event.target.value); setSaved(false); }} className="h-10 w-full rounded border border-input bg-card px-3 text-sm">
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button data-testid="button-save-student" onClick={() => setSaved(true)}>Save details</Button>
                {saved && <span data-testid="status-student-saved" className="text-xs text-[#32553d]">Saved locally.</span>}
              </div>
            </SectionCard>
            <SectionCard title="Participation">
              <div className="grid gap-3 sm:grid-cols-2">
                {seedClubs.slice(0, 2).map((club: any) => (
                  <Link data-testid={`link-profile-club-${club.id}`} href={`/${orgSlug}/clubs/model-united-nations`} key={club.id} className="rounded border border-border p-4 hover:bg-secondary">
                    <div className="text-sm font-semibold">{club.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{club.category} · Active</div>
                    <div className="mt-4 text-[10px] uppercase tracking-widest text-primary">View activity</div>
                  </Link>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function RequestsPage({ parent = false }: { parent?: boolean }) {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [items, setItems] = useState<any[]>(parent ? seedRequests.filter((item) => item.status === 'PENDING_PARENT') : seedRequests);

  useEffect(() => {
    fetchMemberships(orgSlug).then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((m) => ({
          id: m.id,
          student: m.studentName || 'Student',
          club: m.clubName || 'Club',
          stage: m.status === 'PENDING_PARENT_APPROVAL' ? 'Parent approval' : m.status === 'PENDING_ADVISOR_APPROVAL' ? 'Advisor approval' : m.status === 'ACTIVE' ? 'Active' : 'Rejected',
          status: m.status === 'PENDING_PARENT_APPROVAL' ? 'PENDING_PARENT' : m.status === 'PENDING_ADVISOR_APPROVAL' ? 'PENDING_ADVISOR' : m.status === 'ACTIVE' ? 'ACTIVE' : 'REJECTED',
          detail: `Grade ${m.gradeLevel || 10} · requested recently`,
        }));
        setItems(parent ? mapped.filter((item: any) => item.status === 'PENDING_PARENT') : mapped);
      }
    });
  }, [orgSlug, parent]);

  const decide = async (id: string, next: RequestStatus) => {
    setItems(items.map((item: any) => (item.id === id ? { ...item, status: next, stage: next === 'ACTIVE' ? 'Active' : 'Rejected' } : item)));
    try {
      if (parent) {
        if (next === 'ACTIVE' || next === 'PENDING_ADVISOR') {
          await parentApproveMembership(orgSlug, id);
        } else {
          await parentRejectMembership(orgSlug, id);
        }
      } else {
        if (next === 'ACTIVE') {
          await advisorApproveMembership(orgSlug, id);
        } else {
          await advisorRejectMembership(orgSlug, id);
        }
      }
    } catch {
      // Fallback local update kept
    }
  };

  return (
    <AppShell role={parent ? 'PARENT' : 'ADMIN'}>
      <PageFrame
        eyebrow={parent ? 'Layla Hassan / Requests' : 'School operations'}
        title={parent ? 'Approval requests' : 'Approval requests'}
        description={parent ? 'Review decisions for Layla’s participation.' : 'A single queue for the decisions that move a student forward.'}
      >
        <div className="mb-5 flex gap-2">
          <Button data-testid="button-request-filter-all" variant="secondary">All requests</Button>
          <Button data-testid="button-request-filter-pending" variant="quiet">Pending <span className="ml-1 rounded bg-[#f5ecd8] px-1.5 py-0.5 text-[10px]">2</span></Button>
        </div>
        <SectionCard>
          <div className="divide-y divide-border">
            {items.map((item: any) => (
              <div data-testid={`row-request-${item.id}`} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between" key={item.id}>
                <div className="flex items-start gap-3">
                  <Avatar name={item.student} small />
                  <div>
                    <div className="text-sm font-semibold">{item.student}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.club}</div>
                    <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{item.detail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={item.status === 'ACTIVE' ? 'good' : item.status === 'REJECTED' ? 'bad' : 'warn'}>{item.stage}</StatusPill>
                  {item.status === 'PENDING_PARENT' || item.status === 'PENDING_ADVISOR' ? (
                    <>
                      <Button data-testid={`button-approve-request-${item.id}`} onClick={() => decide(item.id, 'ACTIVE')}><Check size={14} />Approve</Button>
                      <Button data-testid={`button-reject-request-${item.id}`} variant="danger" onClick={() => decide(item.id, 'REJECTED')}><X size={14} />Reject</Button>
                    </>
                  ) : (
                    <Button data-testid={`button-view-request-${item.id}`} variant="secondary">View</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </PageFrame>
    </AppShell>
  );
}

export function SchedulePage({ student = false }: { student?: boolean }) {
  const dayGroups = [
    { day: 'Monday · 14 October', sessions: [{ title: 'Model United Nations', time: '15:30–16:45', location: 'Room 204', type: 'Academic' }] },
    { day: 'Wednesday · 16 October', sessions: [{ title: 'Varsity Basketball', time: '16:00–17:30', location: 'Sports Hall', type: 'Sports' }] },
    { day: 'Thursday · 17 October', sessions: [{ title: 'Ceramics Studio', time: '15:15–16:30', location: 'Art Studio', type: 'Arts' }] },
  ];
  return (
    <AppShell role={student ? 'STUDENT' : 'ADMIN'}>
      <PageFrame
        eyebrow={student ? 'Student space' : 'School operations'}
        title={student ? 'My schedule' : 'School-wide schedule'}
        description={student ? 'Upcoming sessions across your active activities.' : 'A practical view of where activity time is happening this week.'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" data-testid="button-schedule-prev"><ArrowLeft size={14} /></Button>
            <Button variant="secondary" data-testid="button-schedule-next"><ArrowRight size={14} /></Button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {dayGroups.map((group: any) => (
            <SectionCard key={group.day} title={group.day}>
              <div className="space-y-3">
                {group.sessions.map((session: any) => (
                  <div className="border-l-2 border-primary pl-3" key={session.title}>
                    <div className="text-sm font-semibold">{session.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 size={13} />{session.time}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={13} />{session.location}</div>
                    <div className="mt-2"><StatusPill>{session.type}</StatusPill></div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function MyClubsPage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  return (
    <AppShell role="ADVISOR">
      <PageFrame eyebrow="Advisor space" title="My activities" description="The activities assigned to you and the students who need your guidance.">
        <div className="grid gap-4 md:grid-cols-2">
          {seedClubs.slice(0, 4).map((club: any) => (
            <Link data-testid={`link-my-club-${club.id}`} href={`/${orgSlug}/clubs/model-united-nations`} className="rounded-lg border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm" key={club.id}>
              <div className="flex items-start justify-between">
                <StatusPill tone="good">Active</StatusPill>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              <h2 className="mt-7 text-lg font-medium">{club.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{club.members} students · {club.location}</p>
              <div className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">Next session · {club.dates === '14–22 Oct' ? 'Monday 15:30' : 'Wednesday 16:00'}</div>
            </Link>
          ))}
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function AdvisorRequestsPage() {
  const [sent, setSent] = useState(false);
  return (
    <AppShell role="ADVISOR">
      <PageFrame eyebrow="Advisor space" title="Additional advisor requests" description="Ask school operations for support when an activity needs another adult.">
        <SectionCard title="Submit a request">
          <div className="max-w-xl space-y-4">
            <SelectField label="Activity" defaultValue="Model United Nations"><option>Model United Nations</option><option>Varsity Basketball</option></SelectField>
            <SelectField label="Reason" defaultValue="High student ratio"><option>High student ratio</option><option>Travel supervision</option><option>Specialist support</option></SelectField>
            <Button data-testid="button-submit-advisor-request" onClick={() => setSent(true)}>{sent ? 'Request submitted' : 'Submit request'}</Button>
            {sent && <span data-testid="status-advisor-request-sent" className="ml-3 text-xs text-[#32553d]">School operations notified.</span>}
          </div>
        </SectionCard>
      </PageFrame>
    </AppShell>
  );
}

export function ExploreClubsPage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [clubsList, setClubsList] = useState<any[]>(seedClubs);

  useEffect(() => {
    fetchExploreClubs(orgSlug).then((data) => {
      if (data && data.length > 0) {
        setClubsList(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            category: c.category || 'Academic',
            status: c.status || 'ACTIVE',
            capacity: c.capacity || 24,
            members: c.membersCount || 18,
            grades: c.minGrade ? `Grades ${c.minGrade}–${c.maxGrade || 12}` : 'Grades 9–12',
            location: c.location || 'Room 204',
          }))
        );
      }
    });
  }, [orgSlug]);

  const visible = clubsList.filter(
    (club: any) =>
      `${club.name} ${club.description}`.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || club.category === category)
  );

  return (
    <AppShell role="STUDENT">
      <PageFrame
        eyebrow="Student space"
        title="Explore activities"
        description="Find a good fit for this term. You’ll see only activities open to your grade."
        action={
          <Link data-testid="link-explore-schedule" href={`/${orgSlug}/my-schedule`}>
            <Button variant="secondary">View my schedule</Button>
          </Link>
        }
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <SearchBox value={search} onChange={setSearch} placeholder="Search activities" />
          <div className="flex gap-1 overflow-auto">
            {['All', 'Academic', 'Arts', 'Sports', 'Service'].map((item: string) => (
              <button
                data-testid={`button-category-${item.toLowerCase()}`}
                key={item}
                onClick={() => setCategory(item)}
                className={`h-10 whitespace-nowrap rounded px-3 text-xs font-semibold ${
                  category === item ? 'bg-primary text-primary-foreground' : 'border border-input bg-card'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.filter((club: any) => club.status === 'ACTIVE').map((club: any) => (
            <article data-testid={`card-explore-${club.id}`} key={club.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <StatusPill>{club.category}</StatusPill>
                <span className="text-xs text-muted-foreground">{club.members}/{club.capacity} places</span>
              </div>
              <h2 className="mt-6 text-lg font-medium">{club.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{club.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <div className="text-xs text-muted-foreground">{club.grades} · {club.location}</div>
                <Link data-testid={`link-explore-details-${club.id}`} href={`/${orgSlug}/clubs/model-united-nations/details`} className="text-xs font-semibold text-primary">
                  View details <ArrowRight className="ml-1 inline" size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && <Empty title="Nothing found" copy="Try a different activity or category." />}
      </PageFrame>
    </AppShell>
  );
}

export function ClubDetailsPage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  const [joined, setJoined] = useState(false);
  const club = seedClubs[0];

  const handleRequestJoin = async () => {
    setJoined(true);
    try {
      await requestJoinClub(orgSlug, club.id);
    } catch {
      // Fallback local state kept
    }
  };

  return (
    <AppShell role="STUDENT">
      <PageFrame eyebrow="Explore / Academic" title="Model United Nations" description="A space to practise research, listening, and confident public speaking." action={<StatusPill tone="good">Open for joining</StatusPill>}>
        <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <SectionCard title="About this activity">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Weekly sessions build the habits behind thoughtful debate and constructive disagreement. You’ll research a country, write a position paper, and practise committee procedure.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Eligibility</div><div className="mt-1 text-sm font-semibold">Grades 9–12</div></div>
              <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Advisor</div><div className="mt-1 text-sm font-semibold">Omar Nabil</div></div>
              <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">When</div><div className="mt-1 text-sm font-semibold">Mondays · 15:30</div></div>
              <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">Where</div><div className="mt-1 text-sm font-semibold">Room 204</div></div>
            </div>
          </SectionCard>
          <SectionCard title="Before you join">
            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="flex gap-3"><Check size={15} className="shrink-0 text-[#53715d]" />Parent approval is required for participation.</div>
              <div className="flex gap-3"><Check size={15} className="shrink-0 text-[#53715d]" />Your advisor will review your request after approval.</div>
              <div className="flex gap-3"><Check size={15} className="shrink-0 text-[#53715d]" />You can withdraw later if your schedule changes.</div>
            </div>
            <Button data-testid="button-request-to-join" onClick={handleRequestJoin} className="mt-7 w-full">
              {joined ? 'Request sent for approval' : 'Request to join'} <ArrowRight size={14} />
            </Button>
            {joined && <div data-testid="status-join-request" className="mt-3 text-center text-xs text-[#53715d]">Next step: parent approval.</div>}
          </SectionCard>
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function MyChildrenPage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  return (
    <AppShell role="PARENT">
      <PageFrame eyebrow="Parent space" title="My children" description="Switch into a child’s view to review the next step in their activity journey.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: 'Layla Hassan', grade: 'Grade 10', activities: '2 active activities', attendance: '89%', href: `/${orgSlug}/children/layla` },
            { name: 'Adam Hassan', grade: 'Grade 7', activities: '1 active activity', attendance: '100%', href: `/${orgSlug}/children/layla` },
          ].map((child: any) => (
            <Link data-testid={`link-child-${child.name.split(' ')[0].toLowerCase()}`} href={child.href} className="rounded-lg border border-border bg-card p-5 hover:border-primary" key={child.name}>
              <div className="flex items-center gap-3">
                <Avatar name={child.name} />
                <div>
                  <h2 className="text-lg font-medium">{child.name}</h2>
                  <div className="text-xs text-muted-foreground">{child.grade}</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 border-t border-border pt-4 text-xs">
                <div><div className="text-muted-foreground">Activities</div><div className="mt-1 font-semibold">{child.activities}</div></div>
                <div><div className="text-muted-foreground">Attendance</div><div className="mt-1 font-semibold">{child.attendance}</div></div>
              </div>
              <div className="mt-5 text-xs font-semibold text-primary">View child dashboard <ArrowRight className="ml-1 inline" size={13} /></div>
            </Link>
          ))}
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function ChildDashboardPage() {
  const { activeOrganization } = useAuth();
  const orgSlug = activeOrganization?.slug || 'al-noor';
  return (
    <AppShell role="PARENT">
      <PageFrame
        eyebrow="Parent space · Layla Hassan"
        title="Layla’s dashboard"
        description="Grade 10 · active and making steady progress."
        action={<Link data-testid="link-child-switcher" href={`/${orgSlug}/my-children`}><Button variant="secondary">Switch child</Button></Link>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Active activities" value="2" note="Model United Nations · Basketball" />
          <Metric label="Sessions attended" value="8 / 9" note="89% attendance" tone="accent" />
          <Metric label="Open decisions" value="1" note="Needs your approval" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <SectionCard title="Next on Layla’s week">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Model United Nations</div>
                <div className="mt-1 text-xs text-muted-foreground">Monday · 15:30 · Room 204</div>
              </div>
              <StatusPill tone="good">Active</StatusPill>
            </div>
            <Link data-testid="link-child-club-view" href={`/${orgSlug}/children/layla/clubs/model-united-nations`} className="mt-5 block border-t border-border pt-4 text-xs font-semibold text-primary">
              View activity progress <ArrowRight className="ml-1 inline" size={13} />
            </Link>
          </SectionCard>
          <SectionCard title="Parent action">
            <div className="border-l-2 border-primary pl-4">
              <div className="text-sm font-semibold">Review a club request</div>
              <div className="mt-1 text-xs text-muted-foreground">A participation request is waiting for parent approval.</div>
              <Link data-testid="link-child-approval" href={`/${orgSlug}/children/layla/requests`}>
                <Button className="mt-4">Review request <ArrowRight size={14} /></Button>
              </Link>
            </div>
          </SectionCard>
        </div>
      </PageFrame>
    </AppShell>
  );
}

export function ChildRequestsPage() {
  return <RequestsPage parent />;
}
