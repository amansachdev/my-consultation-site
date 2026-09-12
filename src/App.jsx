import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { AssessmentPage } from './pages/AssessmentPage';
import { AccountPage } from './pages/AccountPage';
import { BookPage } from './pages/BookPage';
import { Analytics } from './components/Analytics';
import { HomePage } from './pages/HomePage';
import { TeamPage } from './pages/TeamPage';
import { SymptomsPage } from './pages/SymptomsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PreparePage } from './pages/PreparePage';
import { Seo } from './components/Seo';
import { LoadingState } from './components/LoadingState';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

const ClinicianPage = lazy(() => import('./pages/ClinicianPage').then((module) => ({ default: module.ClinicianPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Analytics />
      <Seo />
      <Layout>
        <Suspense fallback={<LoadingState text="Loading workspace..." />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/symptoms" element={<SymptomsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/prepare" element={<PreparePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/clinician/prescriptions" element={<ClinicianPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
