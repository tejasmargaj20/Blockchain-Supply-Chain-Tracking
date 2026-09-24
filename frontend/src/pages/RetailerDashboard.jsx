import { useEffect, useState } from 'react'
import {
    getUserInventory,
    getUserTransfers
} from '../services/api'
import { useNavigate } from 'react-router-dom'

function RetailerDashboard() {

    const user = JSON.parse(localStorage.getItem('user'))
    const navigate = useNavigate()

    const [inventory, setInventory] = useState([])
    const [transfers, setTransfers] = useState([])

    const [loadingInventory, setLoadingInventory] = useState(true)
    const [loadingTransfers, setLoadingTransfers] = useState(true)

    const [productId, setProductId] = useState('')

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    async function loadInventory() {

        try {

            const data = await getUserInventory(user.id)

            setInventory(data)

        } catch (error) {

            setError(error.message)

        } finally {

            setLoadingInventory(false)

        }
    }

    async function loadTransfers() {

        try {

            const data = await getUserTransfers(user.id)

            setTransfers(data)

        } catch (error) {

            setError(error.message)

        } finally {

            setLoadingTransfers(false)

        }
    }

    useEffect(() => {

        loadInventory()
        loadTransfers()

    }, [])

    function handleTrackProduct(event) {

        event.preventDefault()

        setMessage('')
        setError('')

        const enteredProductId = productId.trim()

        if (!enteredProductId) {
            setError('Please enter a product ID.')
            return
        }

        navigate(`/track?product=${encodeURIComponent(enteredProductId)}`)

    }

    function scrollToSection(sectionId) {

        document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth'
        })

    }

    return (
        <section className="py-5">

            <div className="container">

                {/* Dashboard Header */}

                <div className="mb-4">

                    <h2>
                        Retailer Dashboard
                    </h2>

                    <p className="text-muted mb-1">
                        Welcome, <strong>{user?.name}</strong>
                    </p>

                    <p className="text-muted mb-2">
                        Role: <strong>Retailer</strong>
                    </p>

                    <p className="text-secondary mb-0">
                        Manage received products, inventory and product tracking.
                    </p>

                </div>

                {/* Messages */}

                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Quick Actions */}

                <div className="row g-4 mb-4">

                    <div className="col-md-6 col-lg-3">

                        <div
                            className="card border-0 shadow-sm p-4 h-100"
                            role="button"
                            onClick={() => scrollToSection('inventory')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-box-arrow-in-down fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                Received Products
                            </h5>

                            <p className="text-secondary mb-0">
                                View products received from distributors.
                            </p>

                        </div>

                    </div>

                    <div className="col-md-6 col-lg-3">

                        <div
                            className="card border-0 shadow-sm p-4 h-100"
                            role="button"
                            onClick={() => scrollToSection('inventory')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-box-seam fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                My Inventory
                            </h5>

                            <p className="text-secondary mb-0">
                                View products currently available in your inventory.
                            </p>

                        </div>

                    </div>

                    <div className="col-md-6 col-lg-3">

                        <div
                            className="card border-0 shadow-sm p-4 h-100"
                            role="button"
                            onClick={() => scrollToSection('track-product')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-search fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                Track Product
                            </h5>

                            <p className="text-secondary mb-0">
                                Search for a product and view its journey.
                            </p>

                        </div>

                    </div>

                    <div className="col-md-6 col-lg-3">

                        <div
                            className="card border-0 shadow-sm p-4 h-100"
                            role="button"
                            onClick={() => scrollToSection('product-history')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-clock-history fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                Product History
                            </h5>

                            <p className="text-secondary mb-0">
                                View product transfer history.
                            </p>

                        </div>

                    </div>

                </div>

                {/* My Inventory */}

                <div
                    id="inventory"
                    className="card border-0 shadow-sm p-4 mt-4"
                >

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h4 className="fw-bold mb-1">
                                My Inventory
                            </h4>

                            <p className="text-secondary mb-0">
                                Products currently available with you.
                            </p>

                        </div>

                        <span className="badge bg-primary">
                            {inventory.length} Products
                        </span>

                    </div>

                    {loadingInventory ? (

                        <div className="text-center py-4">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="text-secondary mt-2 mb-0">
                                Loading inventory...
                            </p>

                        </div>

                    ) : inventory.length === 0 ? (

                        <div className="text-center py-4">

                            <i className="bi bi-box-seam fs-1 text-secondary"></i>

                            <p className="text-secondary mt-2 mb-0">
                                No products in inventory yet.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>
                                        <th>Product ID</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {inventory.map((product) => (

                                        <tr key={product.id}>

                                            <td>
                                                <strong>
                                                    {product.product_id}
                                                </strong>
                                            </td>

                                            <td>
                                                {product.product_name}
                                            </td>

                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {product.category}
                                                </span>
                                            </td>

                                            <td>
                                                {product.quantity}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* Track Product */}

                <div
                    id="track-product"
                    className="card border-0 shadow-sm p-4 mt-4"
                >

                    <h4 className="fw-bold mb-2">
                        Track Product
                    </h4>

                    <p className="text-secondary">
                        Enter a product ID to view its supply-chain journey.
                    </p>

                    <form onSubmit={handleTrackProduct}>

                        <div className="row">

                            <div className="col-md-8 mb-3">

                                <label
                                    htmlFor="productId"
                                    className="form-label"
                                >
                                    Product ID
                                </label>

                                <input
                                    type="text"
                                    id="productId"
                                    className="form-control"
                                    placeholder="Enter product ID"
                                    value={productId}
                                    onChange={(event) => {
                                        setProductId(event.target.value)
                                        setError('')
                                    }}
                                    required
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            <i className="bi bi-search me-2"></i>
                            Track Product
                        </button>

                    </form>

                </div>

                {/* Product History */}

                <div
                    id="product-history"
                    className="card border-0 shadow-sm p-4 mt-4"
                >

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h4 className="fw-bold mb-1">
                                Product History
                            </h4>

                            <p className="text-secondary mb-0">
                                View product transfers related to your account.
                            </p>

                        </div>

                        <span className="badge bg-primary">
                            {transfers.length} Records
                        </span>

                    </div>

                    {loadingTransfers ? (

                        <div className="text-center py-4">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="text-secondary mt-2 mb-0">
                                Loading product history...
                            </p>

                        </div>

                    ) : transfers.length === 0 ? (

                        <div className="text-center py-4">

                            <i className="bi bi-clock-history fs-1 text-secondary"></i>

                            <p className="text-secondary mt-2 mb-0">
                                No product history available.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>
                                        <th>Product ID</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {transfers.map((transfer) => (

                                        <tr key={transfer.id}>

                                            <td>
                                                <strong>
                                                    {transfer.product_id}
                                                </strong>
                                            </td>

                                            <td>
                                                {transfer.from_user_id}
                                            </td>

                                            <td>
                                                {transfer.to_user_id}
                                            </td>

                                            <td>
                                                {transfer.quantity}
                                            </td>

                                            <td>

                                                <span className="badge bg-success">
                                                    {transfer.status}
                                                </span>

                                            </td>

                                            <td>
                                                {new Date(
                                                    transfer.transferred_at
                                                ).toLocaleDateString()}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </section>
    )
}

export default RetailerDashboard