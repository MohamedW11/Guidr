import React, { useState } from 'react';
import { Bell, BookOpen, CalendarDays, ChevronDown, ClipboardCheck, Compass, LayoutDashboard, LogOut, Menu, Search, Settings2, Users, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/AuthContext';
import { type Role } from '@/lib/demo';

type ShellProps = { children: React.ReactNode; role?: Role };

export function AppShell({ children, role: overrideRole }: ShellProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, activeOrganization, logout } = useAuth();

  // Determine user's active role in org or fallback
  const userRoles = activeOrganization?.roles || ['ADMIN'];
  const activeRole: Role = (overrideRole || (userRoles.includes('ADMIN') ? 'ADMIN' : userRoles.includes('ADVISOR') ? 'ADVISOR' : userRoles.includes('STUDENT') ? 'STUDENT' : userRoles.includes('PARENT') ? 'PARENT' : 'ADMIN')) as Role;

  const orgSlug = activeOrganization?.slug || 'al-noor';

  const navByRole: Record<Role, { label: string; href: string; icon: React.ElementType }[]> = {
    ADMIN: [
      { label: 'Overview', href: `/${orgSlug}/dashboard`, icon: LayoutDashboard },
      { label: 'Activities', href: `/${orgSlug}/clubs`, icon: BookOpen },
      { label: 'Students & users', href: `/${orgSlug}/users`, icon: Users },
      { label: 'Approvals', href: `/${orgSlug}/requests`, icon: ClipboardCheck },
      { label: 'Schedule', href: `/${orgSlug}/schedule`, icon: CalendarDays },
    ],
    ADVISOR: [
      { label: 'Overview', href: `/${orgSlug}/dashboard`, icon: LayoutDashboard },
      { label: 'My activities', href: `/${orgSlug}/my-clubs`, icon: BookOpen },
      { label: 'Requests', href: `/${orgSlug}/advisor-requests`, icon: ClipboardCheck },
      { label: 'Schedule', href: `/${orgSlug}/schedule`, icon: CalendarDays },
    ],
    STUDENT: [
      { label: 'My week', href: `/${orgSlug}/dashboard`, icon: LayoutDashboard },
      { label: 'My activities', href: `/${orgSlug}/clubs/model-united-nations`, icon: BookOpen },
      { label: 'Explore', href: `/${orgSlug}/clubs/explore`, icon: Compass },
      { label: 'Requests', href: `/${orgSlug}/requests`, icon: ClipboardCheck },
    ],
    PARENT: [
      { label: 'Overview', href: `/${orgSlug}/dashboard`, icon: LayoutDashboard },
      { label: 'My children', href: `/${orgSlug}/my-children`, icon: Users },
      { label: 'Requests', href: `/${orgSlug}/children/layla/requests`, icon: ClipboardCheck },
      { label: 'Schedule', href: `/${orgSlug}/schedule`, icon: CalendarDays },
    ],
  };

  const items = navByRole[activeRole];
  const userName = user?.fullName || 'Nadia Farouk';
  const userInitials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'NF';

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-zinc-800 bg-[#111110] text-stone-100">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button data-testid="button-open-navigation" className="rounded p-1 md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={18} /></button>
            <Link data-testid="link-home" href={`/${orgSlug}/dashboard`} className="text-lg font-semibold tracking-tight">guidr</Link>
            <span className="hidden h-6 w-px bg-zinc-700 md:block" />
            <div className="hidden text-[10px] uppercase tracking-[.18em] text-stone-400 md:block">
              {activeOrganization?.name || 'Al Noor International School'} · {activeRole.toLowerCase()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link data-testid="link-notifications" href={`/${orgSlug}/notifications`} className="relative rounded-md p-2 text-stone-300 hover:bg-zinc-800"><Bell size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#9a2733]" /></Link>
            <Link data-testid="link-profile" href={`/${orgSlug}/profile`} className="hidden rounded border border-zinc-700 px-3 py-1 text-xs hover:border-stone-500 md:block">Profile</Link>
            <button
              data-testid="button-logout"
              title="Sign out"
              onClick={() => logout()}
              className="hidden rounded border border-zinc-800 p-1.5 text-stone-400 hover:border-zinc-700 hover:text-stone-100 md:flex items-center"
            >
              <LogOut size={15} />
            </button>
            <div data-testid="text-user-initials" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8e2531] text-[11px] font-semibold">{userInitials}</div>
          </div>
        </div>
      </header>
      <aside className={`fixed bottom-0 left-0 top-14 z-40 w-56 border-r border-zinc-800 bg-[#111110] text-stone-300 transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 md:hidden"><span className="text-xs uppercase tracking-widest">Navigation</span><button data-testid="button-close-navigation" onClick={() => setOpen(false)}><X size={17} /></button></div>
        <div className="border-b border-zinc-800 px-5 py-5">
          <div className="mb-1 text-[10px] uppercase tracking-[.2em] text-stone-500">{activeRole === 'ADMIN' ? 'Admin space' : `${activeRole.toLowerCase()} space`}</div>
          <div className="flex items-center gap-2 text-sm font-medium text-stone-100">{userName}<ChevronDown size={14} className="text-stone-500" /></div>
        </div>
        <nav className="space-y-1 p-3">
          {items.map(({ label, href, icon: Icon }) => {
            const active = location === href || (href !== `/${orgSlug}/dashboard` && location.startsWith(href));
            return <Link key={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded px-3 py-2.5 text-xs ${active ? 'bg-[#8e2531] text-white' : 'text-stone-400 hover:bg-zinc-900 hover:text-stone-100'}`}><Icon size={15} />{label}</Link>;
          })}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-zinc-800 p-4">
          <div className="mb-4 text-[11px] leading-relaxed text-stone-500">A clear view of participation, progress, and the next meaningful step.</div>
          <Link data-testid="link-switch-role" href="/select-organization" className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-100"><Settings2 size={14} />Switch space</Link>
        </div>
      </aside>
      <main className="min-h-[100dvh] pt-14 md:pl-56">{children}</main>
    </div>
  );
}

export function PageFrame({ eyebrow, title, description, action, children }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="guidr-grid min-h-[calc(100dvh-3.5rem)] px-4 py-7 sm:px-6 lg:px-9"><div className="mx-auto max-w-[1180px]"><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-primary">{eyebrow}</div><h1 data-testid="text-page-title" className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{title}</h1>{description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>{action}</div>{children}</div></div>;
}

export function SectionCard({ title, action, children, className = '' }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(43,35,26,.04)] ${className}`}><div className={`${title ? 'border-b border-border px-5 py-4' : ''} flex items-center justify-between`}>{title && <h2 className="text-sm font-semibold">{title}</h2>}{action}</div><div className="p-5">{children}</div></section>;
}

export function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const tones = { neutral: 'bg-secondary text-secondary-foreground', good: 'bg-[#e7eee8] text-[#32553d]', warn: 'bg-[#f5ecd8] text-[#745b27]', bad: 'bg-[#f2e1e0] text-[#8e302b]' };
  return <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = (name || '').split(' ').map((part) => part[0]).join('').slice(0, 2);
  return <span data-testid={`avatar-${(name || '').toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#e7d8ce] font-semibold text-[#713b38] ${small ? 'h-7 w-7 text-[9px]' : 'h-10 w-10 text-xs'}`}>{initials}</span>;
}

export function SearchBox({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="flex h-10 items-center gap-2 rounded border border-input bg-card px-3 text-muted-foreground"><Search size={15} /><input data-testid="input-search" value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder={placeholder} /></label>;
}
