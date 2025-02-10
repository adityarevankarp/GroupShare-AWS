import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from './pages/register';
import LandingPage from './pages/LandingPage';
import UploadDump from './pages/UploadDump';
import FaceUpload from './pages/FaceUpload';
import FaceMatchResults from './pages/FaceMatchResults';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
            <Routes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/upload-dump" element={<UploadDump/>} />
                
                <Route path="/face-upload" element={<FaceUpload/>} />
                <Route path="/match-face" element={<FaceMatchResults/>}/>
            </Routes>
    </Router>
  </StrictMode>,
)
