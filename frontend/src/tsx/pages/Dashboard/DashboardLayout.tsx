import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/buttons';
import { useAuth } from '../../context/AuthContext';
import {
  getTeam, getMembers, getTeamHeatmap, getAnalysisResults, runAnalysis,
} from '../../api';
import type { Startup, User, AnalysisResult, SkillData } from '../../types';
import '../../../css/dashboard.css';

const NAV_LINKS = [
  { icon: '⬡', label: 'Overview', id: 'overview' },
  { icon: '👥', label: 'Team', id: 'team' },
  { icon: '⚡', label: 'Analysis', id: 'analysis' },
  { icon: '⚙', label: 'Settings', id: 'settings' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { currentUser, startupId, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const [startup, setStartup] = useState<Startup | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [heatmapData, setHeatmapData] = useState<SkillData[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!startupId) return;
    getTeam(startupId).then(setStartup).catch(() => { });
    getMembers(startupId).then(setMembers).catch(() => { });
    getTeamHeatmap(startupId)
      .then(h => setHeatmapData(
        h.categories.map(c => ({
          subject: c.category,
          value: parseFloat(c.averageProficiency.toFixed(1)),
          fullMark: 10,
        }))
      ))
      .catch(() => { });
    getAnalysisResults(startupId).then(setAnalysis).catch(() => { });
  }, [startupId]);

  const handleRunAnalysis = async () => {
    if (!startupId) return;
    setAnalyzing(true);
    setError('');
    try {
      const result = await runAnalysis(startupId);
      setAnalysis(result);
      setActiveSection('analysis');
    } catch {
      setError('Analysis failed. Make sure the team has members with skills.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">
          <span className="brand-gradient">JumpStart</span>
        </Link>

        <nav className="sidebar-nav">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              className={`sidebar-link ${activeSection === link.id ? 'active' : ''}`}
              onClick={() => setActiveSection(link.id)}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Avatar name={currentUser?.username ?? 'User'} size="sm" />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{currentUser?.username ?? 'My Account'}</span>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main panel */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            Welcome back{currentUser?.username ? `, ${currentUser.username}` : ''} 👋
          </h1>
          <p className="dashboard-subtitle">
            {startup?.name ?? 'Loading your startup…'}
          </p>
        </div>

        {error && (
          <p style={{ color: 'var(--accent-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
        )}

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {activeSection === 'overview' && (
          <>
            <div className="dashboard-grid">
              {/* Startup overview */}
              <div className="dash-section-card">
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
                  <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
                )}
              </div>

              {/* Run analysis CTA */}
              <div className="dash-section-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <p className="dash-section-title">AI Role Analysis</p>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
                  {analysis ? `Last run: ${new Date(analysis.createdAt).toLocaleDateString()}` : 'No analysis run yet.'}
                </p>
                <Button variant="primary" size="md" onClick={handleRunAnalysis} disabled={analyzing || !startupId}>
                  {analyzing ? 'Analyzing…' : analysis ? 'Re-run Analysis' : 'Run Analysis'}
                </Button>
              </div>
            </div>

            {/* Skill radar */}
            {heatmapData.length > 0 && (
              <div className="dash-section-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <p className="dash-section-title">Team Skill Heatmap</p>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={heatmapData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Radar name="Team" dataKey="value" stroke="#ffdd00" fill="#ffdd00" fillOpacity={0.25} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: '8px' }}
                      formatter={(v) => [`${v} / 10`, 'Avg Proficiency']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Members list */}
            <div className="dash-section-card">
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
                  <p style={{ color: 'var(--text-secondary)' }}>No members yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Team ─────────────────────────────────────────────────────────── */}
        {activeSection === 'team' && (
          <div className="dash-section-card">
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
                <p style={{ color: 'var(--text-secondary)' }}>No members yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Analysis ─────────────────────────────────────────────────────── */}
        {activeSection === 'analysis' && (
          <>
            {!analysis ? (
              <div className="dash-section-card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No analysis results yet.</p>
                <Button variant="primary" size="md" onClick={handleRunAnalysis} disabled={analyzing || !startupId}>
                  {analyzing ? 'Analyzing…' : 'Run Analysis'}
                </Button>
              </div>
            ) : (
              <>
                {/* Role assignments */}
                <div className="dash-section-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
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
                <div className="dash-section-card">
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

        {/* ── Settings ─────────────────────────────────────────────────────── */}
        {activeSection === 'settings' && (
          <div className="dash-section-card">
            <p className="dash-section-title">Settings</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Startup ID: <code>{startupId ?? '—'}</code>
            </p>
            <Button variant="outline" size="md" onClick={handleLogout}>Sign Out</Button>
          </div>
        )}
      </main>
    </div>
  );
}
