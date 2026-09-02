/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/member/Dashboard';
import { Request } from './pages/member/Request';
import { PastorDashboard } from './pages/pastor/Dashboard';
import { LeaderDashboard } from './pages/leader/Dashboard';
import { PastorAvailability } from './pages/pastor/Availability';
import { MemberRequestDetail } from './pages/member/RequestDetail';
import { PastorRequestDetail } from './pages/pastor/RequestDetail';
import { PastorArchives } from './pages/pastor/Archives';
import { Ministry } from './pages/Ministry';
import { Leadership } from './pages/Leadership';
import { Process } from './pages/Process';
import { Resources } from './pages/Resources';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { MinistryGuidelines } from './pages/MinistryGuidelines';
import { TermsOfService } from './pages/TermsOfService';
import { ContactSupport } from './pages/ContactSupport';
import { MemberSanctuary } from './pages/member/Sanctuary';
import { PastorSanctuary } from './pages/pastor/Sanctuary';
import { Roles } from './pages/admin/Roles';
import { AuthProvider } from './lib/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/terms" element={<TermsOfService />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="ministry" element={<Ministry />} />
            <Route path="ministry-guidelines" element={<MinistryGuidelines />} />
            <Route path="leadership" element={<Leadership />} />
            <Route path="process" element={<Process />} />
            <Route path="resources" element={<Resources />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="support" element={<ContactSupport />} />
            <Route path="auth/login" element={<Login />} />
            <Route path="auth/register" element={<Register />} />
            <Route path="member/dashboard" element={<Dashboard />} />
            <Route path="member/request" element={<Request />} />
            <Route path="member/request/:id" element={<MemberRequestDetail />} />
            <Route path="member/sanctuary" element={<MemberSanctuary />} />
            <Route path="leader/dashboard" element={<LeaderDashboard />} />
            <Route path="pastor/dashboard" element={<PastorDashboard />} />
            <Route path="pastor/availability" element={<PastorAvailability />} />
            <Route path="pastor/request/:id" element={<PastorRequestDetail />} />
            <Route path="pastor/archives" element={<PastorArchives />} />
            <Route path="pastor/sanctuary" element={<PastorSanctuary />} />
            <Route path="admin/roles" element={<Roles />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
