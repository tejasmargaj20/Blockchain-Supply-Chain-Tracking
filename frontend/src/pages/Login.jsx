import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'

function Login() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleChange(event) {

        setFormData({
            ...formData,
            [event.target.id]: event.target.value
        })

    }

    async function handleSubmit(event) {

        event.preventDefault()

        setError('')
        setLoading(true)

        try {

            const data = await loginUser(formData)

            localStorage.setItem(
                'user',
                JSON.stringify(data.user)
            )

            if (data.user.role === 'manufacturer') {

                navigate('/manufacturer', { replace: true })

            } else if (data.user.role === 'distributor') {

                navigate('/distributor', { replace: true })

            } else if (data.user.role === 'retailer') {

                navigate('/retailer', { replace: true })

            } else {

                navigate('/', { replace: true })

            }

        } catch (error) {

            setError(error.message)

        } finally {

            setLoading(false)

        }
    }

    return (
        <section className="py-5">

            <div className="container">

                <div className="row justify-content-center">

                    <div className="col-md-6 col-lg-5">

                        <div className="card border-0 shadow-sm p-4">

                            <div className="text-center mb-4">

                                <i className="bi bi-person-circle fs-1 text-primary"></i>

                                <h2 className="fw-bold mt-3">
                                    Login
                                </h2>

                                <p className="text-secondary">
                                    Login to access your dashboard.
                                </p>

                            </div>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label
                                        htmlFor="email"
                                        className="form-label"
                                    >
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >

                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Login
                                        </>
                                    )}

                                </button>

                            </form>

                            <div className="text-center mt-4">

                                <p className="text-secondary mb-0">
                                    Don't have an account?
                                </p>

                                <Link
                                    to="/register"
                                    className="text-decoration-none"
                                >
                                    Create an account
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    )
}

export default Login