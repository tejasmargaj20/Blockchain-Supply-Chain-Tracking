import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
    const navigate = useNavigate()
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user'))
    )

    function handleLogout() {
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    }

    function getDashboardPath() {
        if (!user) return '/login'

        if (user.role === 'manufacturer') {
            return '/manufacturer'
        }

        if (user.role === 'distributor') {
            return '/distributor'
        }

        if (user.role === 'retailer') {
            return '/retailer'
        }

        return '/'
    }

    return (
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    <i className="bi bi-box-seam me-2"></i>
                    SupplyChain
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNavbar"
                    aria-controls="mainNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="mainNavbar">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Home
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/track">
                                Track Product
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/about">
                                About
                            </Link>
                        </li>

                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to={getDashboardPath()}
                                    >
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <span className="nav-link text-light">
                                        <i className="bi bi-person-circle me-1"></i>
                                        {user.name}
                                    </span>
                                </li>
                            </>
                        )}

                        {!user ? (
                            <li className="nav-item ms-lg-2">
                                <Link
                                    className="btn btn-primary px-4"
                                    to="/login"
                                >
                                    <i className="bi bi-person me-1"></i>
                                    Login
                                </Link>
                            </li>
                        ) : (
                            <li className="nav-item ms-lg-2">
                                <button
                                    className="btn btn-outline-light px-4"
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right me-1"></i>
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar