import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from './pages/Home';
import ZHSVoiceButton from './components/voice/ZHSVoiceButton';
import Dashboard from './pages/Dashboard';
import InitialSetup from './pages/InitialSetup';
import DashboardAgents from './pages/DashboardAgents';
import DashboardTools from './pages/DashboardTools';
import Audit from './pages/Audit';
import Monetization from './pages/Monetization';
import AgentDocs from './pages/AgentDocs';
import OpenSourceTools from './pages/OpenSourceTools';
import CryptoArchitecture from './pages/CryptoArchitecture';
import WorkflowBuilder from './pages/WorkflowBuilder';
import PreLaunchAudit from './pages/PreLaunchAudit';
import Deployment from './pages/Deployment';
import WebhookDebuggerPage from './pages/WebhookDebuggerPage';
import CostOptimization from './pages/CostOptimization';
import DeploymentAudit from './pages/DeploymentAudit';
import FunctionalityAudit from './pages/FunctionalityAudit';
import SecurityAudit from './pages/SecurityAudit';

const AuthLoading = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <AuthLoading />;
  }

  return (
    <>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* All app routes gated by ProtectedRoute */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<InitialSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/agents" element={<DashboardAgents />} />
          <Route path="/dashboard/tools" element={<DashboardTools />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/monetization" element={<Monetization />} />
          <Route path="/docs" element={<AgentDocs />} />
          <Route path="/tools/opensource" element={<OpenSourceTools />} />
          <Route path="/crypto-architecture" element={<CryptoArchitecture />} />
          <Route path="/workflow" element={<WorkflowBuilder />} />
          <Route path="/audit/pre-launch" element={<PreLaunchAudit />} />
          <Route path="/deployments" element={<Deployment />} />
          <Route path="/audit/pre-launch-full" element={<PreLaunchAudit />} />
          <Route path="/webhooks/debug" element={<WebhookDebuggerPage />} />
          <Route path="/cost-optimization" element={<CostOptimization />} />
          <Route path="/audit/deployment" element={<DeploymentAudit />} />
          <Route path="/audit/functionality" element={<FunctionalityAudit />} />
          <Route path="/audit/security" element={<SecurityAudit />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ZHSVoiceButton />
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App