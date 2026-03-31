import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Key, BarChart3, Users, FileText, CreditCard,
  Bell, TrendingUp, Sun, Moon, ChevronRight, ArrowRight,
  Home, CheckCircle, Star, Shield, Zap, MapPin,
  DollarSign, AlertCircle, Menu, X
} from 'lucide-react';

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useIntersection(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

const THEMES = {
  light: {
    '--brand-primary': '#1a6b3c',
    '--brand-secondary': '#f0faf4',
    '--surface-bg': '#f4f7f5',
    '--surface-card': '#ffffff',
    '--surface-border': '#d1e5d9',
    '--text-main': '#0f2419',
    '--text-muted': '#4a7560',
    '--text-inverse': '#ffffff',
    '--accent': '#e8a020',
    '--danger': '#d93025',
    '--success': '#1e8c4a',
    '--warning': '#e8a020',
  },
  dark: {
    '--brand-primary': '#2ecc71',
    '--brand-secondary': '#0a1f12',
    '--surface-bg': '#0b1a10',
    '--surface-card': '#112318',
    '--surface-border': '#1e3d28',
    '--text-main': '#e6f4ec',
    '--text-muted': '#7aab8a',
    '--text-inverse': '#0b1a10',
    '--accent': '#f0b429',
    '--danger': '#f05252',
    '--success': '#2ecc71',
    '--warning': '#f0b429',
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, delay = 0 }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm"
    style={{
      backgroundColor: 'var(--surface-card)',
      borderColor: 'var(--surface-border)',
      boxShadow: '0 4px 24px rgba(26,107,60,0.08)',
      animation: `floatCard 3s ease-in-out ${delay}s infinite alternate`,
    }}
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: 'rgba(26,107,60,0.12)' }}>
      <Icon size={18} style={{ color: 'var(--brand-primary)' }} />
    </div>
    <div>
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay = 0, visible }) => (
  <div
    className="group p-6 rounded-2xl border transition-all duration-300 cursor-default"
    style={{
      backgroundColor: 'var(--surface-card)',
      borderColor: 'var(--surface-border)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.2s`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,107,60,0.15)';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'var(--brand-primary)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = visible ? 'translateY(0)' : 'translateY(28px)';
      e.currentTarget.style.borderColor = 'var(--surface-border)';
    }}
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
      style={{ backgroundColor: 'rgba(26,107,60,0.1)' }}>
      <Icon size={22} style={{ color: 'var(--brand-primary)' }} />
    </div>
    <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-main)' }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const HeroPage = () => {
  const [theme, setTheme] = useState('light');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Section refs
  const [statsRef, statsVisible] = useIntersection(0.2);
  const [featRef, featVisible] = useIntersection(0.1);
  const [howRef, howVisible] = useIntersection(0.2);
  const [dashRef, dashVisible] = useIntersection(0.15);

  // Count-ups
  const props  = useCountUp(1200, 1800, statsVisible);
  const rent   = useCountUp(48,   1800, statsVisible);
  const agrs   = useCountUp(340,  1800, statsVisible);
  const tenants= useCountUp(890,  1800, statsVisible);

  // Apply CSS vars
  useEffect(() => {
    const vars = THEMES[theme];
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  const features = [
    { icon: Building2, title: 'Property Management', desc: 'Manage all your properties in one place — details, photos, types, and vacancy status.' },
    { icon: Users, title: 'Tenant Management', desc: 'Onboard tenants with KYC documents, contact details, and complete rental history.' },
    { icon: FileText, title: 'Smart Agreements', desc: 'Auto-generate rent cycles and ledgers when agreements are created. Fully digital.' },
    { icon: CreditCard, title: 'Rent Tracking', desc: 'Track partial, advance, and full payments with automatic balance carry-forward.' },
    { icon: BarChart3, title: 'Reports & Analytics', desc: 'Monthly summaries, collection reports, and occupancy analytics at your fingertips.' },
    { icon: Bell, title: 'Notifications', desc: 'Email and WhatsApp alerts for rent dues, agreement renewals, and payment receipts.' },
  ];

  const steps = [
    { num: '01', icon: Building2, title: 'Add Property', desc: 'Register your properties with type, location, and all necessary details in minutes.' },
    { num: '02', icon: FileText, title: 'Create Agreement', desc: 'Generate a tenant agreement and the system auto-creates all rent cycles for you.' },
    { num: '03', icon: CreditCard, title: 'Track Payments', desc: 'Record rent payments, view pending dues, and get notified — all automated.' },
  ];

  const fakeTenants = [
    { name: 'Rajesh Kumar', unit: 'Flat 2B, Pune', rent: '₹18,000', status: 'Paid', color: 'var(--success)' },
    { name: 'Priya Sharma',  unit: 'Shop 5, Mumbai', rent: '₹32,000', status: 'Pending', color: 'var(--accent)' },
    { name: 'Arjun Mehta',  unit: 'Flat 1A, Nashik', rent: '₹12,500', status: 'Overdue', color: 'var(--danger)' },
  ];

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes floatCard {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(26,107,60,0.3); }
          50%       { box-shadow: 0 0 0 12px rgba(26,107,60,0); }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      <div style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)', minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>

        {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
        <header
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            backgroundColor: scrolled ? 'rgba(var(--surface-card-raw, 255,255,255),0.85)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid var(--surface-border)' : 'none',
            background: scrolled
              ? (theme === 'dark' ? 'rgba(17,35,24,0.88)' : 'rgba(255,255,255,0.88)')
              : 'transparent',
          }}
        >
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-primary)' }}>
                <Building2 size={18} color="white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                Raut <span style={{ color: 'var(--brand-primary)' }}>Rentals</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {['features', 'how-it-works', 'contact'].map(id => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-sm font-medium capitalize transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}>
                  {id.replace('-', ' ')}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
              >
                {theme === 'light'
                  ? <Moon size={16} style={{ color: 'var(--text-muted)' }} />
                  : <Sun size={16} style={{ color: 'var(--accent)' }} />}
              </button>

              <Link to="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                Login <ArrowRight size={14} />
              </Link>

              {/* Mobile hamburger */}
              <button className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
                onClick={() => setMobileMenu(m => !m)}>
                {mobileMenu ? <X size={16} style={{ color: 'var(--text-main)' }} /> : <Menu size={16} style={{ color: 'var(--text-main)' }} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenu && (
            <div className="md:hidden px-5 pb-4 flex flex-col gap-3"
              style={{ borderTop: '1px solid var(--surface-border)', backgroundColor: theme === 'dark' ? 'rgba(17,35,24,0.97)' : 'rgba(255,255,255,0.97)' }}>
              {['features', 'how-it-works', 'contact'].map(id => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-sm font-medium capitalize py-1.5 text-left"
                  style={{ color: 'var(--text-muted)' }}>
                  {id.replace('-', ' ')}
                </button>
              ))}
              <Link to="/login" onClick={() => setMobileMenu(false)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                Login <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </header>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
          {/* Background mesh */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-8"
              style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(var(--text-main) 1px, transparent 1px), linear-gradient(90deg, var(--text-main) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full py-16 md:py-0">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left — copy */}
              <div className="flex-1 max-w-xl" style={{ animation: 'fadeUp 0.7s ease both' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                  style={{ backgroundColor: 'rgba(26,107,60,0.1)', color: 'var(--brand-primary)', border: '1px solid rgba(26,107,60,0.2)' }}>
                  <Zap size={12} /> Property Management, Simplified
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight mb-5"
                  style={{ color: 'var(--text-main)' }}>
                  Your Properties.<br />
                  <span style={{ color: 'var(--brand-primary)' }}>Perfectly</span> Managed.
                </h1>

                <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
                  Simplify rent collection, manage agreements, and track every tenant — all from a single powerful dashboard built for property owners.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)', animation: 'pulse-ring 2.5s infinite' }}>
                    Get Started Free <ArrowRight size={16} />
                  </Link>
                  <button
                    onClick={() => scrollTo('dashboard-preview')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                    style={{ border: '1.5px solid var(--surface-border)', color: 'var(--text-main)', backgroundColor: 'var(--surface-card)' }}>
                    <BarChart3 size={16} style={{ color: 'var(--brand-primary)' }} /> Learn More
                  </button>
                </div>

                <div className="flex items-center gap-5 mt-8">
                  {[
                    { icon: Shield, label: 'Secure & Reliable' },
                    { icon: Zap,    label: 'Instant Setup' },
                    { icon: Star,   label: 'Trusted by Owners' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Icon size={13} style={{ color: 'var(--brand-primary)' }} /> {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — floating stat cards */}
              <div className="flex-1 relative w-full max-w-sm lg:max-w-none" style={{ animation: 'fadeUp 0.9s ease 0.2s both' }}>
                <div className="relative w-full lg:h-[440px] flex flex-col lg:block gap-3">

                  <div className="lg:absolute lg:top-0 lg:left-8">
                    <StatCard icon={Building2} label="Total Properties" value="24 Properties" delay={0} />
                  </div>
                  <div className="lg:absolute lg:top-16 lg:right-0">
                    <StatCard icon={DollarSign} label="Monthly Revenue" value="₹4,20,000" delay={0.5} />
                  </div>
                  <div className="lg:absolute lg:top-[170px] lg:left-0">
                    <StatCard icon={Users} label="Active Tenants" value="21 Tenants" delay={1} />
                  </div>
                  <div className="lg:absolute lg:top-[230px] lg:right-8">
                    <StatCard icon={AlertCircle} label="Pending Rents" value="3 Pending" delay={1.5} />
                  </div>
                  <div className="lg:absolute lg:top-[330px] lg:left-16">
                    <StatCard icon={FileText} label="Active Agreements" value="21 Active" delay={2} />
                  </div>

                  {/* Center glow */}
                  <div className="hidden lg:block absolute top-[140px] left-[80px] w-56 h-56 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(26,107,60,0.12) 0%, transparent 70%)' }} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── STATS BAR ──────────────────────────────────────────────────── */}
        <div ref={statsRef} id="stats">
          <div style={{ backgroundColor: theme === 'dark' ? 'var(--brand-secondary)' : '#0f2419' }} className="py-10">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { label: 'Properties Managed', val: props,   suffix: '+' },
                  { label: 'Rent Collected (Lakhs)', val: rent, suffix: 'L+', prefix: '₹' },
                  { label: 'Active Agreements', val: agrs,      suffix: '+' },
                  { label: 'Happy Tenants',    val: tenants,    suffix: '+' },
                ].map(({ label, val, suffix, prefix = '' }) => (
                  <div key={label}>
                    <p className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                      {prefix}{val.toLocaleString()}{suffix}
                    </p>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FEATURES ───────────────────────────────────────────────────── */}
        <section id="features" className="py-20 px-5 md:px-8" ref={featRef}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14"
              style={{ opacity: featVisible ? 1 : 0, transform: featVisible ? 'none' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>Features</p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--text-main)' }}>
                Everything You Need to<br />Manage Your Properties
              </h2>
              <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                One platform to handle your entire rental portfolio — from onboarding tenants to tracking every rupee.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={i * 80} visible={featVisible} />
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 px-5 md:px-8" ref={howRef}
          style={{ backgroundColor: theme === 'dark' ? 'var(--brand-secondary)' : 'var(--brand-secondary)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14"
              style={{ opacity: howVisible ? 1 : 0, transform: howVisible ? 'none' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>How it works</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
                Get Started in 3 Simple Steps
              </h2>
            </div>

            {/* Stepper */}
            <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0 relative">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col md:flex-row items-center flex-1">
                  {/* Step card */}
                  <div
                    className="flex-1 w-full flex flex-col items-center text-center p-7 rounded-2xl border"
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      borderColor: 'var(--surface-border)',
                      opacity: howVisible ? 1 : 0,
                      transform: howVisible ? 'translateY(0)' : 'translateY(24px)',
                      transition: `all 0.5s ease ${i * 150}ms`,
                    }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black mb-4"
                      style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                      {step.num}
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(26,107,60,0.08)' }}>
                      <step.icon size={22} style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-main)' }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                  </div>

                  {/* Connector arrow */}
                  {i < steps.length - 1 && (
                    <div className="flex items-center justify-center py-4 md:py-0 md:px-3 flex-shrink-0">
                      <div className="hidden md:flex items-center gap-1">
                        <div className="w-8 border-t-2 border-dashed" style={{ borderColor: 'var(--brand-primary)' }} />
                        <ChevronRight size={16} style={{ color: 'var(--brand-primary)' }} />
                      </div>
                      <div className="md:hidden flex flex-col items-center gap-1">
                        <div className="h-6 border-l-2 border-dashed" style={{ borderColor: 'var(--brand-primary)' }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD PREVIEW ──────────────────────────────────────────── */}
        <section id="dashboard-preview" className="py-20 px-5 md:px-8" ref={dashRef}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12"
              style={{ opacity: dashVisible ? 1 : 0, transform: dashVisible ? 'none' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>Dashboard</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
                Powerful Dashboard at a Glance
              </h2>
            </div>

            {/* Mock dashboard */}
            <div
              className="rounded-3xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--surface-card)',
                borderColor: 'var(--surface-border)',
                boxShadow: '0 0 0 1px var(--surface-border), 0 24px 80px rgba(26,107,60,0.12)',
                opacity: dashVisible ? 1 : 0,
                transform: dashVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
                transition: 'all 0.6s ease',
              }}
            >
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b"
                style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-3 flex-1 h-6 rounded-md px-3 flex items-center text-xs"
                  style={{ backgroundColor: 'var(--surface-card)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                  rautrentals.app/dashboard
                </div>
              </div>

              <div className="p-5 md:p-7">
                {/* Mini stat row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Total Properties', val: '24', icon: Building2, color: '#1a6b3c' },
                    { label: 'Rented', val: '21', icon: Key, color: '#2ecc71' },
                    { label: 'Vacant', val: '3',  icon: Home, color: '#e8a020' },
                    { label: 'Monthly Revenue', val: '₹4.2L', icon: TrendingUp, color: '#1a6b3c' },
                  ].map(({ label, val, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl p-4 border"
                      style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <p className="text-xl font-extrabold" style={{ color: 'var(--text-main)' }}>{val}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-5">
                  {/* Bar chart placeholder */}
                  <div className="flex-1 rounded-xl border p-4"
                    style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
                    <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>RENT COLLECTION — LAST 6 MONTHS</p>
                    <div className="flex items-end gap-2 h-24">
                      {[65, 80, 55, 90, 75, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md transition-all"
                          style={{
                            height: `${h}%`,
                            backgroundColor: i === 5 ? 'var(--brand-primary)' : 'rgba(26,107,60,0.25)',
                          }} />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => (
                        <p key={m} className="flex-1 text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>{m}</p>
                      ))}
                    </div>
                  </div>

                  {/* Tenant mini-table */}
                  <div className="flex-1 rounded-xl border p-4"
                    style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
                    <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>RECENT TENANTS</p>
                    <div className="space-y-3">
                      {fakeTenants.map(t => (
                        <div key={t.name} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>{t.name}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.unit}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{t.rent}</p>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: `${t.color}22`, color: t.color }}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-85"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                View Live Demo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer id="contact" style={{ borderTop: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-card)' }} className="py-10 px-5 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--brand-primary)' }}>
                  <Building2 size={15} color="white" />
                </div>
                <span className="font-bold" style={{ color: 'var(--text-main)' }}>
                  Raut <span style={{ color: 'var(--brand-primary)' }}>Rentals</span>
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Premium property rental management for individual owners.</p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              {[{ label: 'Features', id: 'features' }, { label: 'How it Works', id: 'how-it-works' }].map(({ label, id }) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-sm transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}>
                  {label}
                </button>
              ))}
              <Link to="/login" className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: 'var(--brand-primary)' }}>
                Login
              </Link>
            </div>

            {/* Copy */}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © 2025 Raut Rentals. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default HeroPage;