import { useEffect, useState } from 'react'
import {
    getUserInventory,
    getUserTransfers,
    transferProduct
} from '../services/api'

function DistributorDashboard() {

    const user = JSON.parse(localStorage.getItem('user'))

    const [inventory, setInventory] = useState([])
    const [transfers, setTransfers] = useState([])
    const [retailers, setRetailers] = useState([])

    const [loadingInventory, setLoadingInventory] = useState(true)
    const [loadingTransfers, setLoadingTransfers] = useState(true)
    const [loadingRetailers, setLoadingRetailers] = useState(true)

    const [transferData, setTransferData] = useState({
        product_id: '',
        to_user_id: '',
        quantity: ''
    })

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

    async function loadRetailers() {

        try {

            const response = await fetch(
                'http://localhost:5000/api/users/retailers'
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to load retailers'
                )
            }

            setRetailers(data)

        } catch (error) {

            setError(error.message)

        } finally {

            setLoadingRetailers(false)

        }
    }

    useEffect(() => {

        loadInventory()
        loadTransfers()
        loadRetailers()

    }, [])

    function handleTransferChange(event) {

        setTransferData({
            ...transferData,
            [event.target.id]: event.target.value
        })

    }

    async function handleTransferSubmit(event) {

        event.preventDefault()

        setMessage('')
        setError('')

        if (!transferData.product_id) {
            setError('Please select a product')
            return
        }

        if (!transferData.to_user_id) {
            setError('Please select a retailer')
            return
        }

        if (!transferData.quantity) {
            setError('Please enter quantity')
            return
        }

        const selectedProduct = inventory.find(
            (product) =>
                product.id === Number(transferData.product_id)
        )

        if (!selectedProduct) {
            setError('Selected product not found')
            return
        }

        if (
            Number(transferData.quantity) >
            Number(selectedProduct.quantity)
        ) {
            setError(
                'Transfer quantity cannot exceed available quantity'
            )
            return
        }

        try {

            const data = await transferProduct({
                product_id: Number(transferData.product_id),
                from_user_id: user.id,
                to_user_id: Number(transferData.to_user_id),
                quantity: Number(transferData.quantity)
            })

            setMessage(data.message)

            setTransferData({
                product_id: '',
                to_user_id: '',
                quantity: ''
            })

            loadInventory()
            loadTransfers()

        } catch (error) {

            setError(error.message)

        }
    }

    function scrollToSection(sectionId) {

        document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth'
        })

    }

    const selectedProduct = inventory.find(
        (product) =>
            product.id === Number(transferData.product_id)
    )

    return (
        <section className="py-5">

            <div className="container">

                {/* Dashboard Header */}

                <div className="mb-4">

                    <h2>
                        Distributor Dashboard
                    </h2>

                    <p className="text-muted mb-1">
                        Welcome, <strong>{user?.name}</strong>
                    </p>

                    <p className="text-muted mb-2">
                        Role: <strong>Distributor</strong>
                    </p>

                    <p className="text-secondary mb-0">
                        Manage received products, inventory and product transfers.
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
                                View products received from manufacturers.
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
                            onClick={() => scrollToSection('transfer-product')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-truck fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                Transfer Product
                            </h5>

                            <p className="text-secondary mb-0">
                                Transfer products to retailers.
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
                                View the movement history of your products.
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
                                                    {product.product_code}
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

                {/* Transfer Product */}

                <div
                    id="transfer-product"
                    className="card border-0 shadow-sm p-4 mt-4"
                >

                    <h4 className="fw-bold mb-2">
                        Transfer Product
                    </h4>

                    <p className="text-secondary">
                        Transfer products from your inventory to a retailer.
                    </p>

                    <form onSubmit={handleTransferSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="product_id"
                                    className="form-label"
                                >
                                    Select Product
                                </label>

                                <select
                                    id="product_id"
                                    className="form-select"
                                    value={transferData.product_id}
                                    onChange={handleTransferChange}
                                    required
                                >

                                    <option value="">
                                        Select Product
                                    </option>

                                    {inventory.map((product) => (

                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.product_code} - {product.product_name}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="to_user_id"
                                    className="form-label"
                                >
                                    Select Retailer
                                </label>

                                <select
                                    id="to_user_id"
                                    className="form-select"
                                    value={transferData.to_user_id}
                                    onChange={handleTransferChange}
                                    required
                                >

                                    <option value="">
                                        Select Retailer
                                    </option>

                                    {loadingRetailers ? (

                                        <option disabled>
                                            Loading retailers...
                                        </option>

                                    ) : retailers.length === 0 ? (

                                        <option disabled>
                                            No retailers available
                                        </option>

                                    ) : (

                                        retailers.map((retailer) => (

                                            <option
                                                key={retailer.id}
                                                value={retailer.id}
                                            >
                                                {retailer.name} - {retailer.email}
                                            </option>

                                        ))

                                    )}

                                </select>

                            </div>

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="quantity"
                                    className="form-label"
                                >
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    id="quantity"
                                    className="form-control"
                                    placeholder="Enter quantity"
                                    min="1"
                                    max={selectedProduct?.quantity || 1}
                                    value={transferData.quantity}
                                    onChange={handleTransferChange}
                                    required
                                />

                                <p className="text-secondary mt-1 mb-0">
                                    Available quantity:{' '}
                                    {selectedProduct?.quantity || 0}
                                </p>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary mt-2"
                        >
                            <i className="bi bi-arrow-right-circle me-2"></i>
                            Transfer Product
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
                                                    {transfer.product_code}
                                                </strong>
                                            </td>

                                            <td>
                                                {transfer.from_user_name}
                                            </td>

                                            <td>
                                                {transfer.to_user_name}
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

export default DistributorDashboard