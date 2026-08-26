import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AssessmentPage } from './pages/AssessmentPage';
import { AccountPage } from './pages/AccountPage';
import { BookPage } from './pages/BookPage';
import { Analytics } from './components/Analytics';
import { ClinicianPage } from './pages/ClinicianPage';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { TeamPage } from './pages/TeamPage';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Analytics />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/clinician/prescriptions" element={<ClinicianPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
