import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors (but allow /setup for new users)
  const isSetupRoute = window.location.pathname === '/setup';
  
  if (authError && !isSetupRoute) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <>
      <Routes>
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
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App