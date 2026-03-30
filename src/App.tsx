import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Client/Home';
import VideoPlayer from './pages/Client/VideoPlayer';
import AdminList from './pages/Admin/List';
import AdminAdd from './pages/Admin/Add';
import AdminLogin from './pages/Admin/Login';
import './App.css'; // Mặc định từ Vite, nếu không cần có thể xóa import

function App() {
  return (
    <Router>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoPlayer />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminList />} />
        <Route path="/admin/add" element={<AdminAdd />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
