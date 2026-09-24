import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'

function Register() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
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
        setSuccess('')
        setLoading(true)

        try {

            const data = await registerUser(formData)

            setSuccess(data.message || 'Registration successful')

            setFormData({
                name: '',
                email: '',
                role: '',
                password: ''
            })

            setTimeout(() => {
                navigate('/login', { replace: true })
            }, 1500)

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

                    <div className="col-md-7 col-lg-6">

                        <div className="card border-0 shadow-sm p-4">

                            <div className="text-center mb-4">

                                <i className="bi bi-person-plus-fill fs-1 text-primary"></i>

                                <h2 className="fw-bold mt-3">
                                    Create Account
                                </h2>

                                <p className="text-secondary">
                                    Register as a supply-chain participant.
                                </p>

                            </div>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label
                                        htmlFor="name"
                                        className="form-label"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        id="name"
                                        className="form-control"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

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
                                        htmlFor="role"
                                        className="form-label"
                                    >
                                        Role
                                    </label>

                                    <select
                                        id="role"
                                        className="form-select"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select your role
                                        </option>

                                        <option value="manufacturer">
                                            Manufacturer
                                        </option>

                                        <option value="distributor">
                                            Distributor
                                        </option>

                                        <option value="retailer">
                                            Retailer
                                        </option>

                                    </select>

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
                                        placeholder="Create a password"
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
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-person-plus me-2"></i>
                                            Create Account
                                        </>
                                    )}

                                </button>

                            </form>

                            <div className="text-center mt-4">

                                <p className="text-secondary mb-0">
                                    Already have an account?
                                </p>

                                <Link
                                    to="/login"
                                    className="text-decoration-none"
                                >
                                    Login here
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    )
}

export default Register