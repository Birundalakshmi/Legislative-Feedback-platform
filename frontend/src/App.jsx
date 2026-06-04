import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

import Home from './pages/user/Home'
import LegislationDetail from './pages/user/LegislationDetail'
import MyComments from './pages/user/MyComments'
import ActiveConsultations from './pages/user/ActiveConsultations'
import Notifications from './pages/user/Notifications'
import Profile from './pages/user/Profile'

import AdminDashboard from './pages/admin/AdminDashboard'
import UploadLegislation from './pages/admin/UploadLegislation'
import CommentsDashboard from './pages/admin/CommentsDashboard'
import SentimentAnalysis from './pages/admin/SentimentAnalysis'
import SentimentDetail from './pages/admin/SentimentDetail'
import SummaryReport from './pages/admin/SummaryReport'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/legislation/:id" element={<ProtectedRoute><LegislationDetail /></ProtectedRoute>} />
          <Route path="/my-comments" element={<ProtectedRoute><MyComments /></ProtectedRoute>} />
          <Route path="/active" element={<ProtectedRoute><ActiveConsultations /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/upload" element={<ProtectedRoute adminOnly><UploadLegislation /></ProtectedRoute>} />
          <Route path="/admin/comments" element={<ProtectedRoute adminOnly><CommentsDashboard /></ProtectedRoute>} />
          <Route path="/admin/sentiment" element={<ProtectedRoute adminOnly><SentimentAnalysis /></ProtectedRoute>} />
          <Route path="/admin/sentiment/:id" element={<ProtectedRoute adminOnly><SentimentDetail /></ProtectedRoute>} />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
