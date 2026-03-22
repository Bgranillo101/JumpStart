import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/buttons';
import { Toast } from '../../components/Toast';
import { ReadinessGauge } from '../../components/ReadinessGauge';
import { Confetti } from '../../components/Confetti';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useSSE } from '../../hooks/useSSE';
import {
  getTeam, getMembers, getTeamHeatmap, getAnalysisResults, runAnalysis,
  generateInviteLink, getTechStackResults, runTechStackAnalysis,
} from '../../api';
import type { Startup, User, AnalysisResult, SkillData, TechStackRecommendation } from '../../types';
import '../../../css/dashboard.css';

const NAV_LINKS = [
  { icon: '\u2B21', label: 'Overview', id: 'overview' },
  { icon: '👥', label: 'Team', id: 'team' },
  { icon: '\u26A1', label: 'Analysis', id: 'analysis' },
  { icon: '🔧', label: 'Tech Stack', id: 'techstack' },
  { icon: '\u2699', label: 'Settings', id: 'settings' },
];

const CATEGORY_ICONS: Record<string, string> = {
  LANGUAGE: '\uD83D\uDCDD',
  FRAMEWORK: '\uD83C\uDFD7\uFE0F',
  DATABASE: '\uD83D\uDDC4\uFE0F',
  TOOL: '\uD83D\uDD27',
  INFRASTRUCTURE: '\u2601\uFE0F',
};

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Must-Have',
  2: 'Recommended',
  3: 'Nice-to-Have',
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { currentUser, startupId, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const [startup, setStartup] = useState<Startup | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [heatmapData, setHeatmapData] = useState<SkillData[]>([]);
  const [aiHeatmap, setAiHeatmap] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Sprint 2 state
  const [techStack, setTechStack] = useState<TechStackRecommendation[]>([]);
  const [generatingTechStack, setGeneratingTechStack] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const heatmapRef = useRef<HTMLDivElement>(null);

  // SSE real-time updates
  const { latestEvent, clearEvent } = useSSE(startupId);

  // Handle SSE member-joined events
  useEffect(() => {
    if (!latestEvent || !startupId) return;
    const displayName = latestEvent.name || latestEvent.username;
    setToastMessage(`${displayName} just joined your team!`);
    setToastVisible(true);
    clearEvent();
    // Re-fetch members and heatmap
    getMembers(startupId).then(setMembers).catch(() => {});
    getTeamHeatmap(startupId).then(h => {
      setAiHeatmap(h.aiGenerated ?? false);
      setHeatmapData(
        h.categories.map(c => ({
          subject: c.category,
          value: parseFloat(c.averageProficiency.toFixed(1)),
          fullMark: 10,
          insight: c.insight,
        }))
      );
    }).catch(() => {});
  }, [latestEvent, startupId, clearEvent]);

  useEffect(() => {
    if (!startupId) {
      setLoading(false);
      return;
    }

    // Demo mode — load from localStorage instead of API
    const isDemo = localStorage.getItem('demo_mode') === 'true';
    if (isDemo) {
      try {
        const s = localStorage.getItem('demo_startup');
        if (s) setStartup(JSON.parse(s));
        const m = localStorage.getItem('demo_members');
        if (m) setMembers(JSON.parse(m));
        const h = localStorage.getItem('demo_heatmap');
        if (h) {
          const heatmap = JSON.parse(h) as import('../../types').TeamSkillHeatmap;
          setAiHeatmap(heatmap.aiGenerated ?? false);
          setHeatmapData(
            heatmap.categories.map(c => ({
              subject: c.category,
              value: parseFloat(c.averageProficiency.toFixed(1)),
              fullMark: 10,
              insight: c.insight,
            }))
          );
        }
        const a = localStorage.getItem('demo_analysis');
        if (a) setAnalysis(JSON.parse(a));
        const t = localStorage.getItem('demo_techstack');
        if (t) setTechStack(JSON.parse(t));
      } catch { /* ignore parse errors */ }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    Promise.allSettled([
      getTeam(startupId),
      getMembers(startupId),
      getTeamHeatmap(startupId),
      getAnalysisResults(startupId),
      getTechStackResults(startupId),
    ]).then(([teamResult, membersResult, heatmapResult, analysisResult, techStackResult]) => {
      if (teamResult.status === 'fulfilled') {
        setStartup(teamResult.value);
      } else {
        setError('Failed to load team data. Please refresh.');
      }

      if (membersResult.status === 'fulfilled') {
        setMembers(membersResult.value);
      }

      if (heatmapResult.status === 'fulfilled') {
        setAiHeatmap(heatmapResult.value.aiGenerated ?? false);
        setHeatmapData(
          heatmapResult.value.categories.map(c => ({
            subject: c.category,
            value: parseFloat(c.averageProficiency.toFixed(1)),
            fullMark: 10,
            insight: c.insight,
          }))
        );
      }

      if (analysisResult.status === 'fulfilled') {
        setAnalysis(analysisResult.value);
      }

      if (techStackResult.status === 'fulfilled') {
        setTechStack(techStackResult.value);
      }
    }).catch(() => {
      setError('An unexpected error occurred. Please refresh.');
    }).finally(() => {
      setLoading(false);
    });
  }, [startupId]);

  const handleRunAnalysis = async () => {
    if (!startupId) return;
    setAnalyzing(true);
    setError('');
    try {
      const result = await runAnalysis(startupId);
      setAnalysis(result);
      setActiveSection('analysis');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } catch {
      setToastMessage('Analysis failed. Make sure the team has members with skills.');
      setToastVisible(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRunTechStack = async () => {
    if (!startupId) return;
    setGeneratingTechStack(true);
    setError('');
    try {
      const result = await runTechStackAnalysis(startupId);
      setTechStack(result);
    } catch {
      setToastMessage('Tech stack generation failed. Run a team analysis first.');
      setToastVisible(true);
    } finally {
      setGeneratingTechStack(false);
    }
  };

  const handleDownloadReport = useCallback(async () => {
    if (!analysis || !startup) return;
    setGeneratingReport(true);
    try {
      const { generateReport } = await import('../../utils/generateReport');
      await generateReport({
        startup,
        members,
        analysis,
        techStack,
        heatmapElement: heatmapRef.current,
      });
    } catch {
      setToastMessage('Failed to generate report.');
      setToastVisible(true);
    } finally {
      setGeneratingReport(false);
    }
  }, [analysis, startup, members, techStack]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isOwner = currentUser && startup && currentUser.userId === startup.owner.userId;

  const handleGenerateInvite = async () => {
    if (!startupId) return;
    try {
      const link = await generateInviteLink(startupId);
      setInviteLink(link);
      setInviteCopied(false);
    } catch {
      setToastMessage('Failed to generate invite link.');
      setToastVisible(true);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  // Group tech stack by category
  const techStackByCategory = techStack.reduce<Record<string, TechStackRecommendation[]>>((acc, rec) => {
    (acc[rec.category] ??= []).push(rec);
    return acc;
  }, {});

  return (
    <div className="dashboard-shell">
      {/* Mobile hamburger */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
        {sidebarOpen ? '\u2715' : '\u2630'}
      </button>
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Link to="/" className="sidebar-logo">
          <span className="brand-gradient">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 1024 337" width="128" height="42">
              <path id="JumpStart" fill="#ffffff" aria-label="JumpStart" d="m48.3 210.7c29.4 0 47.1-18.8 47.1-48.4v-88.8h-46.1v23h35.7l-12.6 4.3v60.9c0 16.7-9.6 25.9-24.1 25.9-14.6 0-24-9.2-24-26.3v-3.1h-23v4.5c0 28.4 18.2 48 47 48zm100.7-46.7v-53h-23v57.4c0 27.1 14.4 39.6 38.2 39.6 13.5 0 31.7-12.5 31.7-28.1v28.1h23.1v-97h-23.1v47.6c0 19.2-10.9 31.1-24.9 31.1-13.7 0-22-7.1-22-25.7zm100 44h23v-50.3c0-17.3 10.4-26.2 22.7-26.2 11.7 0 18.7 6 18.7 22.3v54.2h23v-50.3c0-17.1 10-26.2 22.1-26.2 12.3 0 19.2 6 19.2 22.3v54.2h23.1v-59.8c0-25.3-14.4-37-36.3-37-13.7 0-26 3.2-33.5 13.8-5.9-10.8-16.7-13.8-30.1-13.8-12.3 0-28.9 12.3-28.9 25.5v-25.7h-23zm235.9 0c28.8 0 50.2-18.7 50.2-48.5 0-29.9-21.4-48.4-50.2-48.4-22.1 0-32.9 9.6-32.9 29.4v-29.6h-23v113.8l-7.7 2.9 7.9 109.7 15.2-92.4 7.6-2.9v-42.9c8.7 7.3 20 8.9 32.9 8.9zm-23.6-48.5c0-15.3 8.2-25.3 23.6-25.3 15.4 0 27.1 10 27.1 25.3 0 15.4-9.8 25.4-27.1 25.4-15.4 0-23.6-10-23.6-25.4zm145.2 51.2c31.5 0 49.5-18.1 49.5-41.9 0-29.1-24.8-35.8-45.5-41-15.4-3.6-28.3-7.3-28.3-18.6 0-8.7 7-15.6 22.1-15.6 15.4 0 23.7 8.1 23.7 19.6 8.6 1.6 16.1 4.1 24.4 9.6v-9.6c0-25.7-16.5-42.4-47.3-42.4-30.9 0-47.6 16.7-47.6 39.2 0 27.4 23.6 34.4 44 39.4 15.9 4 29.7 7.6 29.7 20.5 0 10-7.8 17.9-24.7 17.9-17.7 0-26.8-9-26.8-22.5-10.3-1.2-15.5-2.7-24.7-9.6v9.6c0 26.7 18.8 45.4 51.5 45.4zm120.6-2.7h17.1l-9.8-21h-4.4c-12.1 0-18.3-6.3-18.3-18.4v-37.3h32.1v-20.4h-44.7l12.6-4.2v-20.4h-22.6l0.2 24.6h-20.4v20.4h19.8v37.8c0 25.2 13.6 38.9 38.4 38.9zm37.7-26.7c0 18.2 10.2 26.7 32.3 26.7 17.3 0 30.4-7.7 30.4-26.7v26.7h23v-59.8c0-24.8-15.9-37.3-42.4-37.3-24.6 0-39.8 10-43.3 30h23.1c1.9-8.1 12.3-9.6 19.8-9.6 8.6 0 19.8 3.3 19.8 16.5v3.5h-28.8c-23.9 0-33.9 11.5-33.9 30zm22.5-1c0-7.3 2.9-12.5 13.5-12.5h26.7v1.3c0 12.7-9.8 22-26.5 22-10.8 0-13.7-3.5-13.7-10.8zm91.7 27.7h23v-47.5c0-17.9 8.3-29.2 25-29.2h12.7v-20.4h-9.8c-17.1 0-27.9 9.2-27.9 24.4v-24.2l-23-0.2zm127.1 0h17.1l-9.8-20.9h-4.4c-12.1 0-18.3-6.4-18.3-18.5v-37.2h32.1v-20.4h-44.7l12.6-4.2v-20.4h-22.6l0.2 24.6h-20.4v20.4h19.8v37.8c0 25.2 13.6 38.8 38.4 38.8z" />
            </svg>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              className={`sidebar-link ${activeSection === link.id ? 'active' : ''}`}
              onClick={() => { setActiveSection(link.id); setSidebarOpen(false); }}
              data-id={link.id}
              aria-label={`Go to ${link.label}`}
              aria-current={activeSection === link.id ? 'page' : undefined}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flex: 1, minWidth: 0 }}>
              <Avatar
                name={currentUser?.name ?? currentUser?.username ?? 'User'}
                src={currentUser?.userId != null ? (localStorage.getItem(`avatar_${currentUser.userId}`) ?? undefined) : undefined}
                size="sm"
              />
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{currentUser?.name ?? currentUser?.username ?? 'My Account'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>View profile</span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Sign out of your account"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem', flexShrink: 0 }}
              title="Sign out"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main panel */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            Welcome back{currentUser?.username ? `, ${currentUser.username}` : ''}
          </h1>
          <p className="dashboard-subtitle">
            {startup?.name ?? 'Loading your startup\u2026'}
          </p>
        </div>

        {loading && (
          <div className="dashboard-grid">
            {[1, 2].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-text lg" />
                <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                <div className="skeleton skeleton-text sm" />
              </div>
            ))}
            <div className="skeleton-card" style={{ gridColumn: '1 / -1' }}>
              <div className="skeleton skeleton-text lg" />
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-row" style={{ marginBottom: '0.5rem' }}>
                  <div className="skeleton skeleton-avatar" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                    <div className="skeleton skeleton-text sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <p role="alert" style={{ color: 'var(--accent-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
        )}

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {!loading && activeSection === 'overview' && (
          <>
            <div className="dashboard-grid">
              {/* Startup overview */}
              <div className="dash-section-card card-stagger">
                <p className="dash-section-title">Team Overview</p>
                {startup ? (
                  <>
                    <h2 className="team-overview-name">{startup.name}</h2>
                    <p className="team-overview-meta">{members.length} members</p>
                    {startup.productDescription && (
                      <p className="team-overview-desc">{startup.productDescription}</p>
                    )}
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>
                    {error ? 'Unable to load team data.' : 'Loading\u2026'}
                  </p>
                )}
              </div>

              {/* Readiness score or Analysis CTA */}
              <div className="dash-section-card card-stagger" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                {analysis?.teamReadinessScore != null ? (
                  <ReadinessGauge score={analysis.teamReadinessScore} />
                ) : (
                  <>
                    <p className="dash-section-title">AI Role Analysis</p>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
                      {analysis ? `Last run: ${new Date(analysis.createdAt).toLocaleDateString()}` : 'No analysis run yet.'}
                    </p>
                  </>
                )}
                <Button variant="primary" size="md" onClick={handleRunAnalysis} disabled={analyzing || !startupId}>
                  {analyzing ? 'Analyzing\u2026' : analysis ? 'Re-run Analysis' : 'Run Analysis'}
                </Button>
              </div>
            </div>

            {/* Skill radar */}
            {heatmapData.length === 0 && (
              <div className="dash-section-card card-stagger" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <p className="dash-section-title">Team Skill Heatmap</p>
                <div className="empty-state">
                  <span className="empty-state-icon">\uD83D\uDCCA</span>
                  <span className="empty-state-title">No skill data yet</span>
                  <span className="empty-state-desc">Team members need to add their skills before the heatmap can be generated.</span>
                </div>
              </div>
            )}
            {heatmapData.length > 0 && (
              <div className="dash-section-card card-stagger" style={{ marginBottom: 'var(--spacing-xl)' }} ref={heatmapRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <p className="dash-section-title" style={{ margin: 0 }}>Team Skill Heatmap</p>
                  {aiHeatmap && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      background: 'var(--accent-focus)',
                      color: 'var(--accent-primary)',
                      border: '1px solid var(--accent-glow)',
                    }}>AI-Enhanced</span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={heatmapData}>
                    <PolarGrid stroke="var(--chart-grid)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Radar name="Team" dataKey="value" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.25} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '8px' }}
                      formatter={(v, _name, props) => {
                        const insight = (props as { payload?: SkillData }).payload?.insight;
                        return [
                          insight ? `${v} / 10 — ${insight}` : `${v} / 10`,
                          aiHeatmap ? 'AI Score' : 'Avg Proficiency',
                        ];
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Members list */}
            <div className="dash-section-card card-stagger">
              <p className="dash-section-title">Team Members</p>
              <div className="members-list">
                {members.map(member => (
                  <div key={member.userId} className="member-row">
                    <Avatar name={member.name ?? member.username} size="md" />
                    <div className="member-info">
                      <span className="member-name">{member.name ?? member.username}</span>
                      {member.preferredRole && <Badge variant="tertiary">{member.preferredRole}</Badge>}
                      <div className="member-skills">
                        {(member.skills ?? []).map(skill => (
                          <Badge key={skill.id ?? skill.name} variant="neutral">{skill.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-state-icon"></span>
                    <span className="empty-state-title">No team members yet</span>
                    <span className="empty-state-desc">Invite people to your startup or have them join with an invite link.</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Team ─────────────────────────────────────────────────────────── */}
        {!loading && activeSection === 'team' && (
          <>
            {isOwner && (
              <div className="dash-section-card card-stagger" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <p className="dash-section-title">Invite Members</p>
                {!inviteLink ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      Generate a shareable link to invite people to your team.
                    </p>
                    <Button variant="primary" size="md" onClick={handleGenerateInvite}>
                      Generate Invite Link
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      Share this link with people you want to invite:
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <code style={{
                        flex: 1,
                        padding: '0.6rem 1rem',
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--bg-glass-border)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        wordBreak: 'break-all',
                      }}>
                        {inviteLink}
                      </code>
                      <Button variant="outline" size="sm" onClick={handleCopyInvite}>
                        {inviteCopied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

          <div className="dash-section-card card-stagger">
            <p className="dash-section-title">Team Members</p>
            <div className="members-list">
              {members.map(member => (
                <div key={member.userId} className="member-row">
                  <Avatar name={member.name ?? member.username} size="md" />
                  <div className="member-info">
                    <span className="member-name">{member.name ?? member.username}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{member.email}</span>
                    {member.preferredRole && <Badge variant="tertiary">{member.preferredRole}</Badge>}
                    <div className="member-skills">
                      {(member.skills ?? []).map(skill => (
                        <Badge key={skill.id ?? skill.name} variant="neutral">{skill.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="empty-state">
                  <span className="empty-state-icon"></span>
                  <span className="empty-state-title">No team members yet</span>
                  <span className="empty-state-desc">Invite people to your startup or have them join with an invite link.</span>
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {/* ── Analysis ─────────────────────────────────────────────────────── */}
        {!loading && activeSection === 'analysis' && (
          <>
            {!analysis ? (
              <div className="dash-section-card card-stagger">
                <div className="empty-state">
                  <span className="empty-state-icon">\u26A1</span>
                  <span className="empty-state-title">No analysis results yet</span>
                  <span className="empty-state-desc">Run an AI analysis to get role assignments and identify skill gaps on your team.</span>
                  <Button variant="primary" size="md" onClick={handleRunAnalysis} disabled={analyzing || !startupId} style={{ marginTop: '0.5rem' }}>
                    {analyzing ? 'Analyzing\u2026' : 'Run Analysis'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Download report button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <Button variant="outline" size="md" onClick={handleDownloadReport} disabled={generatingReport}>
                    {generatingReport ? 'Generating\u2026' : '\uD83D\uDCC4 Download Report'}
                  </Button>
                </div>

                {/* Role assignments */}
                <div className="dash-section-card card-stagger" style={{ marginBottom: 'var(--spacing-xl)' }}>
                  <p className="dash-section-title">Role Assignments</p>
                  <div className="members-list">
                    {analysis.roleAssignments.map(ra => (
                      <div key={ra.id} className="member-row" style={{ alignItems: 'flex-start' }}>
                        <Avatar name={ra.user.name ?? ra.user.username} size="md" />
                        <div className="member-info">
                          <span className="member-name">{ra.user.name ?? ra.user.username}</span>
                          <Badge variant="brand">{ra.assignedRole}</Badge>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {ra.confidence}% confidence
                          </span>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {ra.reasoning}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role gaps */}
                <div className="dash-section-card card-stagger">
                  <p className="dash-section-title">Role Gaps</p>
                  <div className="members-list">
                    {analysis.roleGaps.map(gap => (
                      <div key={gap.id} className="member-row" style={{ alignItems: 'flex-start' }}>
                        <div className="member-info">
                          <span className="member-name">{gap.roleName}</span>
                          <Badge
                            variant={gap.importance === 'CRITICAL' ? 'brand' : gap.importance === 'RECOMMENDED' ? 'tertiary' : 'neutral'}
                          >
                            {gap.importance.replace('_', ' ')}
                          </Badge>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {gap.whyNeeded}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Tech Stack ───────────────────────────────────────────────────── */}
        {!loading && activeSection === 'techstack' && (
          <>
            {techStack.length === 0 ? (
              <div className="dash-section-card card-stagger">
                <div className="empty-state">
                  <span className="empty-state-icon"></span>
                  <span className="empty-state-title">No tech stack recommendations yet</span>
                  <span className="empty-state-desc">Generate AI-powered technology recommendations based on your team's skills and startup goals.</span>
                  <Button variant="primary" size="md" onClick={handleRunTechStack} disabled={generatingTechStack || !startupId} style={{ marginTop: '0.5rem' }}>
                    {generatingTechStack ? 'Generating\u2026' : 'Generate Tech Stack'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                    Recommended Tech Stack
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleRunTechStack} disabled={generatingTechStack}>
                    {generatingTechStack ? 'Regenerating\u2026' : 'Regenerate'}
                  </Button>
                </div>
                {Object.entries(techStackByCategory).map(([category, recs]) => (
                  <div key={category} style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                      {CATEGORY_ICONS[category] || '\uD83D\uDCE6'} {category}
                    </p>
                    <div className="tech-card-grid">
                      {recs.map(rec => (
                        <div key={rec.id} className="tech-card">
                          <div className="tech-card-header">
                            <span className="tech-card-name">{rec.name}</span>
                            <Badge variant={rec.priority === 1 ? 'brand' : rec.priority === 2 ? 'tertiary' : 'neutral'}>
                              {PRIORITY_LABELS[rec.priority] || 'Recommended'}
                            </Badge>
                          </div>
                          <p className="tech-card-reasoning">{rec.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ── Settings ─────────────────────────────────────────────────────── */}
        {!loading && activeSection === 'settings' && (
          <div className="dash-section-card card-stagger">
            <p className="dash-section-title">Settings</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Startup ID: <code>{startupId ?? '\u2014'}</code>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Theme</span>
              <ThemeToggle />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="outline" size="md" onClick={handleLogout}>Sign Out</Button>
            </div>
          </div>
        )}
      </main>

      {/* Toast notification */}
      <Toast message={toastMessage} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
      {showConfetti && <Confetti />}
    </div>
  );
}
