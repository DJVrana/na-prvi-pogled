import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/prijava" element={<FormPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
