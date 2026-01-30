import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './features/auth/components/loginForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Add more routes here as needed */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
