import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AssessmentPage } from './pages/AssessmentPage';
import { BookPage } from './pages/BookPage';
import { HomePage } from './pages/HomePage';
import { TeamPage } from './pages/TeamPage';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
