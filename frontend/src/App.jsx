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

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                <Route path="/track" element={<TrackProduct />} />
                <Route path="/about" element={<About />} />

                <Route
                    path="/manufacturer"
                    element={
                        <ProtectedRoute role="manufacturer">
                            <ManufacturerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/distributor"
                    element={
                        <ProtectedRoute role="distributor">
                            <DistributorDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/retailer"
                    element={
                        <ProtectedRoute role="retailer">
                            <RetailerDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>

            <Footer />
        </BrowserRouter>
    )
}

export default App