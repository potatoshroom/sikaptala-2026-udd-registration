import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Success from './pages/Success'
import QuizBee from './pages/competitions/QuizBee'
import Skills from './pages/competitions/Skills'
import WebDesign from './pages/competitions/WebDesign'
import GameJam from './pages/competitions/GameJam'
import Hackathon from './pages/competitions/Hackathon'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Competition listing */}
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          }
        />

        {/* Individual competition pages */}
        <Route
          path="/register/quiz-bee"
          element={
            <ProtectedRoute>
              <QuizBee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register/skills"
          element={
            <ProtectedRoute>
              <Skills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register/web-design"
          element={
            <ProtectedRoute>
              <WebDesign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register/game-jam"
          element={
            <ProtectedRoute>
              <GameJam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register/hackathon"
          element={
            <ProtectedRoute>
              <Hackathon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
