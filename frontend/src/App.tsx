import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { KnowledgeHub } from './pages/KnowledgeHub';
import { Documents } from './pages/Documents';
import { DocumentDetails } from './pages/DocumentDetails';
import { RagSearch } from './pages/RagSearch';
import { Chat } from './pages/Chat';
import { Agents } from './pages/Agents';
import { AgentDetail } from './pages/AgentDetail';
import { AgentRun } from './pages/AgentRun';
import { Decisions } from './pages/Decisions';
import { Approvals } from './pages/Approvals';
import { Tasks } from './pages/Tasks';
import { Requests } from './pages/Requests';
import { Evaluation } from './pages/Evaluation';
import { Analytics } from './pages/Analytics';
import { AskData } from './pages/AskData';
import { Users } from './pages/Users';
import { Roles } from './pages/Roles';
import { Departments } from './pages/Departments';
import { AuditLogs } from './pages/AuditLogs';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading SmartCorp AI…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
            <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />
            <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/knowledge" element={<KnowledgeHub />} />
              <Route path="/knowledge/documents" element={<Documents />} />
              <Route path="/knowledge/documents/:id" element={<DocumentDetails />} />
              <Route path="/rag-search" element={<RagSearch />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/agents/:id/run" element={<AgentRun />} />
              <Route path="/decisions" element={<Decisions />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ask-data" element={<AskData />} />
              <Route path="/dashboards" element={<Navigate to="/analytics" replace />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<RequireAuth><div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950"><NotFound /></div></RequireAuth>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
