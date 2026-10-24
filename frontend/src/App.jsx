import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TrackProduct from './pages/TrackProduct'
import About from './pages/About'
import ManufacturerDashboard from './pages/ManufacturerDashboard'
import DistributorDashboard from './pages/DistributorDashboard'
import RetailerDashboard from './pages/RetailerDashboard'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track" element={<TrackProduct />} />
        <Route path="/about" element={<About />} />

        <Route
          path="/manufacturer"
          element={<ManufacturerDashboard />}
        />

        <Route
          path="/distributor"
          element={<DistributorDashboard />}
        />

        <Route
          path="/retailer"
          element={<RetailerDashboard />}
        />

        {/* Supply Chain Analytics Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

export default App