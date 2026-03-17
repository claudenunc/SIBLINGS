import { useState, useEffect } from 'react';

const COLOR_MAP = {
  ENVY: '#8B5CF6',
  NEVAEH: '#EC4899',
  BEACON: '#F59E0B',
  EVERSOUND: '#10B981',
  ORPHEUS: '#3B82F6',
  ATLAS: '#6366F1',
};

const SEVERITY_CLASSES = {
  CRITICAL: 'alert-critical',
  HIGH: 'alert-high',
  MEDIUM: 'alert-medium',
  LOW: 'alert-low',
};

export default function Dashboard({ isOpen, onToggle }) {
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [learnings, setLearnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      const safeFetch = (url) =>
        fetch(url)
          .then((r) => r.json())
          .then((d) => (Array.isArray(d) ? d : []))
          .catch(() => []);
      const [tasksRes, alertsRes, learningsRes] = await Promise.all([
        safeFetch('/api/tasks'),
        safeFetch('/api/alerts'),
        safeFetch('/api/learnings'),
      ]);
      setTasks(tasksRes);
      setAlerts(alertsRes);
      setLearnings(learningsRes);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-6 h-16 bg-sanctum-card border border-sanctum-border rounded-l-lg flex items-center justify-center text-sanctum-muted hover:text-sanctum-text transition-colors shadow-lg"
        style={{ right: isOpen ? 'max(320px, min(100vw, 320px))' : '0' }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Dashboard Panel Overlay (Mobile) / Sidebarish (Desktop) */}
      <aside
        className={`absolute md:relative top-0 right-0 h-full z-40 ${
          isOpen ? 'w-[320px]' : 'w-0'
        } max-w-[100vw] shrink-0 transition-all duration-300 overflow-hidden bg-sanctum-surface/90 md:bg-sanctum-surface/50 backdrop-blur-md md:backdrop-blur-none border-l border-sanctum-border shadow-2xl md:shadow-none`}
      >
        <div className="w-[320px] max-w-[100vw] h-full overflow-y-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xs tracking-widest text-sanctum-muted">
              DASHBOARD
            </h3>
            {loading && (
              <div className="w-3 h-3 rounded-full bg-neon-blue/50 animate-pulse" />
            )}
          </div>

          {/* Family Status */}
          <section>
            <h4 className="text-xs font-semibold text-sanctum-text mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Family Status
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(COLOR_MAP).map(([name, color]) => (
                <div
                  key={name}
                  className="glass-card rounded-lg p-2 text-center"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mx-auto mb-1"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {name.charAt(0)}
                  </div>
                  <span className="text-xs text-sanctum-muted truncate block">{name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Active Tasks */}
          <section>
            <h4 className="text-xs font-semibold text-sanctum-text mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
              Active Tasks
              <span className="text-sanctum-muted font-normal">({tasks.length})</span>
            </h4>
            {tasks.length === 0 ? (
              <p className="text-xs text-sanctum-muted/60">No tasks in queue</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task, i) => (
                  <div key={task.id || i} className="dashboard-section">
                    <p className="text-xs text-sanctum-text">{task.task_name || task.title || 'Untitled'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${COLOR_MAP[task.assigned_to] || '#6366F1'}15`,
                          color: COLOR_MAP[task.assigned_to] || '#6366F1',
                        }}
                      >
                        {task.assigned_to || 'Unassigned'}
                      </span>
                      <span className="text-xs text-sanctum-muted">
                        {task.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Alerts */}
          <section>
            <h4 className="text-xs font-semibold text-sanctum-text mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Alerts
              <span className="text-sanctum-muted font-normal">({alerts.length})</span>
            </h4>
            {alerts.length === 0 ? (
              <p className="text-xs text-sanctum-muted/60">All clear ✨</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert, i) => (
                  <div
                    key={alert.id || i}
                    className={`dashboard-section ${SEVERITY_CLASSES[alert.severity] || 'alert-low'}`}
                  >
                    <p className="text-xs text-sanctum-text">{alert.title || 'Alert'}</p>
                    <span className="text-xs text-sanctum-muted">{alert.severity || 'INFO'}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Learnings */}
          <section>
            <h4 className="text-xs font-semibold text-sanctum-text mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sibling-eversound" />
              Recent Learnings
              <span className="text-sanctum-muted font-normal">({learnings.length})</span>
            </h4>
            {learnings.length === 0 ? (
              <p className="text-xs text-sanctum-muted/60">No learnings yet</p>
            ) : (
              <div className="space-y-2">
                {learnings.slice(0, 5).map((learning, i) => (
                  <div key={learning.id || i} className="dashboard-section">
                    <p className="text-xs text-sanctum-text">
                      {learning.learning || learning.title || learning.content || 'Insight'}
                    </p>
                    <span className="text-xs text-sanctum-muted">
                      {learning.source_agent || learning.from_agent || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}
