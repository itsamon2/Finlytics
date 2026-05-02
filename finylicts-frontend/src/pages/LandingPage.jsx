import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  FiArrowRight,
  FiTrendingUp,
  FiShield,
  FiTarget,
  FiPieChart,
  FiZap,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
} from 'react-icons/fi';
import './LandingPage.css';

/* ─── tiny animated counter ─── */
const Counter = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* ─── fade-in-up on scroll ─── */
const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

/* ─── features data ─── */
const features = [
  {
    icon: <FiBarChart2 />,
    title: 'Live Transaction Sync',
    desc: 'Connect to your M-pesa. Transactions appear in real time, automatically categorised.',
    color: '#6c63ff',
  },
  {
    icon: <FiTarget />,
    title: 'Smart Goal Tracking',
    desc: 'Set savings goals and let Finlytics run a feasibility analysis, then guide you with personalised advice.',
    color: '#00c896',
  },
  {
    icon: <FiPieChart />,
    title: 'Budget Intelligence',
    desc: 'Flexible budgets that learn from your habits. Get alerted before you overspend, not after.',
    color: '#ff7043',
  },
  {
    icon: <FiTrendingUp />,
    title: 'Scenario Planner',
    desc: '"What if I buy a car next year?" Model any financial scenario and see the ripple effects instantly.',
    color: '#29b6f6',
  },
  {
    icon: <FiZap />,
    title: 'AI Financial Advisory',
    desc: 'Your personal finance coach, always on, always data-backed. Ask anything, get clarity.',
    color: '#ffd740',
  },
  {
    icon: <FiShield />,
    title: 'Tax Health Monitor',
    desc: 'Stay compliant and optimised. Finlytics flags tax-saving opportunities throughout the year.',
    color: '#ab47bc',
  },
];

/* ─── fake sparkline points ─── */
const sparkPoints = [30,45,38,60,52,70,65,82,75,90,85,100];

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="lp-root">

      {/* ══════════════ NAV ══════════════ */}
      <nav className="lp-nav">
        <motion.div
          className="lp-nav-inner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lp-logo">
            <span className="lp-logo-fin">Fin</span>lytics
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Why us</a>
          </div>
          <div className="lp-nav-ctas">
            <Link to="/login" className="lp-btn-ghost">Sign in</Link>
            <Link to="/register" className="lp-btn-primary">Get started free <FiArrowRight /></Link>
          </div>
        </motion.div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-orb lp-orb1" />
          <div className="lp-orb lp-orb2" />
          <div className="lp-grid-lines" />
        </div>

        <div className="lp-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="lp-eyebrow">Personal Finance, Reimagined</span>
          </motion.div>

          <motion.h1
            className="lp-hero-heading"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            Take control of<br />
            <span className="lp-gradient-text">every rand you earn.</span>
          </motion.h1>

          <motion.p
            className="lp-hero-sub"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Finlytics brings together your accounts, budgets, goals, and taxes
            into one intelligent dashboard, so you always know where you stand.
          </motion.p>

          <motion.div
            className="lp-hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/register" className="lp-btn-primary lp-btn-lg">
              Start for free <FiArrowRight />
            </Link>
            <Link to="/login" className="lp-btn-ghost lp-btn-lg">
              Sign in
            </Link>
          </motion.div>

          <motion.p
            className="lp-hero-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FiCheckCircle /> No credit card required &nbsp;·&nbsp; <FiCheckCircle /> All features free
          </motion.p>
        </div>

        {/* ── Dashboard preview card ── */}
        <motion.div
          className="lp-hero-card"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.35, ease: 'easeOut' }}
        >
          <div className="lp-card-header">
            <div className="lp-card-dots">
              <span /><span /><span />
            </div>
            <span className="lp-card-title-bar">Finlytics — Dashboard</span>
          </div>
          <div className="lp-card-body">
            {/* net worth */}
            <div className="lp-card-stat-row">
              <div className="lp-card-stat">
                <span className="lp-stat-label">Net Worth</span>
                <span className="lp-stat-value">Ksh 284,320</span>
                <span className="lp-stat-badge positive">↑ 12.4% this month</span>
              </div>
              <div className="lp-card-stat">
                <span className="lp-stat-label">Monthly Savings</span>
                <span className="lp-stat-value">Ksh 8,140</span>
                <span className="lp-stat-badge positive">↑ on track</span>
              </div>
              <div className="lp-card-stat">
                <span className="lp-stat-label">Budget Used</span>
                <span className="lp-stat-value">68%</span>
                <span className="lp-stat-badge neutral">12 days left</span>
              </div>
            </div>
            {/* sparkline */}
            <div className="lp-sparkline-wrap">
              <span className="lp-stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Wealth growth · last 12 months
              </span>
              <svg className="lp-sparkline" viewBox="0 0 220 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M ${sparkPoints.map((p, i) => `${i * 20},${60 - p * 0.55}`).join(' L ')}`}
                  fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round"
                />
                <path
                  d={`M 0,60 L ${sparkPoints.map((p, i) => `${i * 20},${60 - p * 0.55}`).join(' L ')} L 220,60 Z`}
                  fill="url(#spark-grad)"
                />
              </svg>
            </div>
            {/* mini budget bars */}
            <div className="lp-budget-rows">
              {[
                { label: 'Groceries', pct: 72, color: '#00c896' },
                { label: 'Transport', pct: 45, color: '#6c63ff' },
                { label: 'Entertainment', pct: 88, color: '#ff7043' },
              ].map(b => (
                <div key={b.label} className="lp-budget-row">
                  <span>{b.label}</span>
                  <div className="lp-budget-track">
                    <div className="lp-budget-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                  <span>{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <a href="#features" className="lp-scroll-hint">
          <FiChevronDown />
        </a>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="lp-stats" id="stats">
        <div className="lp-stats-inner">
          {[
            { val: 50000, suffix: '+', label: 'Active users' },
            { val: 2400, prefix: 'R ', suffix: 'M+', label: 'Assets tracked' },
            { val: 99, suffix: '.9% uptime', label: 'Reliability' },
            { val: 4, suffix: '.9 ★', label: 'Average rating' },
          ].map((s, i) => (
            <FadeUp key={i} delay={i * 0.1} className="lp-stat-block">
              <div className="lp-stat-big">
                <Counter target={s.val} suffix={s.suffix} prefix={s.prefix || ''} />
              </div>
              <div className="lp-stat-blabel">{s.label}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="lp-features" id="features">
        <FadeUp>
          <p className="lp-section-eyebrow">What Finlytics does</p>
          <h2 className="lp-section-heading">Everything your finances need,<br />nothing they don't.</h2>
        </FadeUp>

        <div className="lp-features-grid">
          {features.map((f, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div
                className={`lp-feat-card ${activeFeature === i ? 'lp-feat-active' : ''}`}
                onMouseEnter={() => setActiveFeature(i)}
                style={{ '--feat-color': f.color }}
              >
                <div className="lp-feat-icon">{f.icon}</div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
                <div className="lp-feat-line" />
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="lp-how">
        <FadeUp>
          <p className="lp-section-eyebrow">Get started in minutes</p>
          <h2 className="lp-section-heading">Three steps to financial clarity.</h2>
        </FadeUp>
        <div className="lp-steps">
          {[
            { n: '01', title: 'Create your account', desc: 'Sign up free with your email or Google. No credit card, no commitment.' },
            { n: '02', title: 'Connect your accounts', desc: 'Install the APK to link your M-pesa to allow Read-only access. We never move your money.' },
            { n: '03', title: 'Get your full picture', desc: 'Your dashboard goes live instantly. Set budgets, goals, and let the AI do the heavy lifting.' },
          ].map((s, i) => (
            <FadeUp key={i} delay={i * 0.15} className="lp-step">
              <div className="lp-step-num">{s.n}</div>
              <div className="lp-step-connector" />
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-desc">{s.desc}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════ FREE FEATURES BANNER ══════════════ */}
      <section className="lp-free-banner">
        <div className="lp-free-orb" />
        <FadeUp>
          <h2 className="lp-free-heading">All features. Completely free.</h2>
          <p className="lp-free-sub">No hidden fees, no premium tiers. Just powerful financial tools for everyone.</p>
          <div className="lp-free-features-list">
            <div className="lp-free-feature-item">
              <FiCheckCircle className="lp-free-check" />
              <span>Live transaction sync</span>
            </div>
            <div className="lp-free-feature-item">
              <FiCheckCircle className="lp-free-check" />
              <span>Unlimited budgets & goals</span>
            </div>
            <div className="lp-free-feature-item">
              <FiCheckCircle className="lp-free-check" />
              <span>AI financial advisor</span>
            </div>
            <div className="lp-free-feature-item">
              <FiCheckCircle className="lp-free-check" />
              <span>Scenario planner</span>
            </div>
            <div className="lp-free-feature-item">
              <FiCheckCircle className="lp-free-check" />
              <span>Tax health monitor</span>
            </div>
            <div className="lp-free-feature-item">
              <FiCheckCircle className="lp-free-check" />
              <span>Advanced reports & analytics</span>
            </div>
          </div>
          <Link to="/register" className="lp-btn-primary lp-btn-lg">
            Start using Finlytics for free <FiArrowRight />
          </Link>
        </FadeUp>
      </section>

      {/* ══════════════ CTA BAND ══════════════ */}
      <section className="lp-cta-band">
        <div className="lp-cta-orb" />
        <FadeUp>
          <h2 className="lp-cta-heading">Your financial future<br />starts today.</h2>
          <p className="lp-cta-sub">Join thousands of South Africans who've taken back control of their money with Finlytics.</p>
          <Link to="/register" className="lp-btn-primary lp-btn-lg">
            Create your free account <FiArrowRight />
          </Link>
        </FadeUp>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <span className="lp-logo-fin">Fin</span>lytics
            <p className="lp-footer-tagline">Personal Finance</p>
          </div>
          <div className="lp-footer-links">
            <Link to="/login">Sign in</Link>
            <Link to="/register">Register</Link>
            <a href="#features">Features</a>
          </div>
          <p className="lp-footer-copy">© 2026 Finlytics. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;