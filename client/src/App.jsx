import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { NotificationProvider } from './context/NotificationContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Notification from './components/Notification'
import AIChat from './components/AIChat'
import Home from './pages/Home'
import Questions from './pages/Questions'
import AskQuestion from './pages/AskQuestion'
import QuestionDetail from './pages/QuestionDetail'
import Consultations from './pages/Consultations'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Notification />
        <Header />
        <main className="page-shell">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/ask" element={<AskQuestion />} />
              <Route path="/question/:id" element={<QuestionDetail />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <Footer />
        <AIChat />
      </Router>
    </NotificationProvider>
  )
}

export default App
