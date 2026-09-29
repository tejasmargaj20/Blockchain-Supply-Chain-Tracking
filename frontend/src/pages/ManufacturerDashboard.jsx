import { useEffect, useState } from 'react'

function ManufacturerDashboard() {

    const user = JSON.parse(localStorage.getItem('user'))

    const [products, setProducts] = useState([])
    const [distributors, setDistributors] = useState([])

    const [loading, setLoading] = useState(true)
    const [loadingDistributors, setLoadingDistributors] = useState(true)

    const [formData, setFormData] = useState({
        product_id: '',
        product_name: '',
        category: '',
        quantity: ''
    })

    const [transferData, setTransferData] = useState({
        product_id: '',
        to_user_id: '',
        quantity: ''
    })

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // Scroll to dashboard section
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId)

        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    // Load manufacturer's products
    async function loadProducts() {

        if (!user?.id) {
            setError('User information not found. Please login again.')
            setLoading(false)
            return
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/products/manufacturer/${user.id}`
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to load products'
                )
            }

            setProducts(data)

        } catch (error) {

            setError(error.message)

        } finally {

            setLoading(false)

        }
    }

    // Load distributors
    async function loadDistributors() {

        try {

            const response = await fetch(
                'http://localhost:5000/api/users/distributors'
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to load distributors'
                )
            }

            setDistributors(data)

        } catch (error) {

            setError(error.message)

        } finally {

            setLoadingDistributors(false)

        }
    }

    useEffect(() => {

        loadProducts()
        loadDistributors()

    }, [])

    // Add product form
    function handleChange(event) {

        setFormData({
            ...formData,
            [event.target.id]: event.target.value
        })

    }

    // Transfer form
    function handleTransferChange(event) {

        const { id, value } = event.target

        if (id === 'transferProduct') {

            setTransferData({
                ...transferData,
                product_id: value
            })

        } else if (id === 'transferQuantity') {

            setTransferData({
                ...transferData,
                quantity: value
            })

        } else {

            setTransferData({
                ...transferData,
                [id]: value
            })

        }

    }

    // Add product
    async function handleSubmit(event) {

        event.preventDefault()

        setMessage('')
        setError('')

        try {

            const response = await fetch(
                'http://localhost:5000/api/products',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...formData,
                        quantity: Number(formData.quantity),
                        manufacturer_id: user.id
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Product creation failed'
                )
            }

            setMessage(
                data.message || 'Product added successfully'
            )

            setFormData({
                product_id: '',
                product_name: '',
                category: '',
                quantity: ''
            })

            loadProducts()

        } catch (error) {

            setError(error.message)

        }

    }

    // Transfer product
    async function handleTransferSubmit(event) {

        event.preventDefault()

        setMessage('')
        setError('')

        if (!transferData.product_id) {
            setError('Please select a product')
            return
        }

        if (!transferData.to_user_id) {
            setError('Please select a distributor')
            return
        }

        if (!transferData.quantity) {
            setError('Please enter quantity')
            return
        }

        const selectedProduct = products.find(
            product =>
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

            const response = await fetch(
                'http://localhost:5000/api/products/transfer',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        product_id: Number(
                            transferData.product_id
                        ),
                        from_user_id: user.id,
                        to_user_id: Number(
                            transferData.to_user_id
                        ),
                        quantity: Number(
                            transferData.quantity
                        )
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Product transfer failed'
                )
            }

            setMessage(
                data.message || 'Product transferred successfully'
            )

            setTransferData({
                product_id: '',
                to_user_id: '',
                quantity: ''
            })

            loadProducts()

        } catch (error) {

            setError(error.message)

        }

    }

    const selectedProduct = products.find(
        product =>
            product.id === Number(transferData.product_id)
    )

    const totalProducts = products.length

    const createdProducts = products.filter(
        product => product.status === 'Created'
    ).length

    const inTransitProducts = products.filter(
        product => product.status === 'In Transit'
    ).length

    const deliveredProducts = products.filter(
        product => product.status === 'Delivered'
    ).length

    const verifiedProducts = products.filter(
        product =>
            product.status === 'Verified' ||
            product.status === 'Created'
    ).length

    return (

        <div className="dashboard-page">

            {/* Sidebar */}

            <aside className="dashboard-sidebar">

                <div className="sidebar-brand">

                    <i className="bi bi-box-seam"></i>

                    <span>
                        SupplyChain
                    </span>

                </div>

                <div className="sidebar-menu">

                    <button
                        className="sidebar-link active"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            })
                        }
                    >
                        <i className="bi bi-grid"></i>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            scrollToSection('my-products')
                        }
                    >
                        <i className="bi bi-box-seam"></i>
                        <span>Products</span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            scrollToSection('transfer-product')
                        }
                    >
                        <i className="bi bi-arrow-left-right"></i>
                        <span>Transfers</span>
                    </button>

                    <button className="sidebar-link">
                        <i className="bi bi-buildings"></i>
                        <span>Businesses</span>
                    </button>

                    <button className="sidebar-link">
                        <i className="bi bi-qr-code-scan"></i>
                        <span>QR Verify</span>
                    </button>

                    <button className="sidebar-link">
                        <i className="bi bi-bar-chart"></i>
                        <span>Reports</span>
                    </button>

                    <div className="sidebar-divider"></div>

                    <button className="sidebar-link">
                        <i className="bi bi-gear"></i>
                        <span>Settings</span>
                    </button>

                    <button className="sidebar-link">
                        <i className="bi bi-question-circle"></i>
                        <span>Help</span>
                    </button>

                </div>

            </aside>

            {/* Main Dashboard */}

            <main className="dashboard-main">

                {/* Top Header */}

                <header className="dashboard-topbar">

                    <div className="dashboard-search">

                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search products..."
                        />

                    </div>

                    <div className="dashboard-user">

                        <button className="notification-button">
                            <i className="bi bi-bell"></i>
                        </button>

                        <div className="user-avatar">

                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || 'U'}

                        </div>

                        <div className="user-info">

                            <strong>
                                {user?.name || 'User'}
                            </strong>

                            <small>
                                Manufacturer
                            </small>

                        </div>

                        <i className="bi bi-chevron-down"></i>

                    </div>

                </header>

                <div className="dashboard-content">

                    {/* Welcome */}

                    <div className="dashboard-welcome">

                        <div>

                            <h1>
                                Good Morning,{' '}
                                {user?.name || 'User'} 👋
                            </h1>

                            <p>
                                Here's your supply chain overview.
                            </p>

                        </div>

                        <button
                            className="dashboard-primary-button"
                            onClick={() =>
                                scrollToSection('add-product')
                            }
                        >
                            <i className="bi bi-plus-lg"></i>
                            Add Product
                        </button>

                    </div>

                    {/* Messages */}

                    {message && (

                        <div className="alert alert-success dashboard-alert">

                            <i className="bi bi-check-circle me-2"></i>

                            {message}

                        </div>

                    )}

                    {error && (

                        <div className="alert alert-danger dashboard-alert">

                            <i className="bi bi-exclamation-circle me-2"></i>

                            {error}

                        </div>

                    )}

                    {/* Statistics */}

                    <div className="dashboard-stats">

                        <div className="stat-card">

                            <div className="stat-icon blue">
                                <i className="bi bi-box-seam"></i>
                            </div>

                            <div>

                                <p>Products</p>

                                <h3>
                                    {totalProducts}
                                </h3>

                                <span>
                                    Total products
                                </span>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon orange">
                                <i className="bi bi-truck"></i>
                            </div>

                            <div>

                                <p>In Transit</p>

                                <h3>
                                    {inTransitProducts}
                                </h3>

                                <span>
                                    Currently moving
                                </span>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon green">
                                <i className="bi bi-check-circle"></i>
                            </div>

                            <div>

                                <p>Delivered</p>

                                <h3>
                                    {deliveredProducts}
                                </h3>

                                <span>
                                    Successfully delivered
                                </span>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon purple">
                                <i className="bi bi-shield-check"></i>
                            </div>

                            <div>

                                <p>Verified</p>

                                <h3>
                                    {verifiedProducts}
                                </h3>

                                <span>
                                    Blockchain records
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* Overview */}

                    <div className="dashboard-grid">

                        <div className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <h4>
                                        Supply Chain Overview
                                    </h4>

                                    <p>
                                        Current product status
                                    </p>

                                </div>

                                <i className="bi bi-activity"></i>

                            </div>

                            <div className="overview-content">

                                <div className="overview-number">
                                    {totalProducts}
                                </div>

                                <div className="overview-label">
                                    Total products created
                                </div>

                                <div className="progress-container">

                                    <div className="progress-label">

                                        <span>
                                            Product records
                                        </span>

                                        <strong>
                                            {totalProducts}
                                        </strong>

                                    </div>

                                    <div className="progress">

                                        <div
                                            className="progress-bar"
                                            style={{
                                                width:
                                                    totalProducts > 0
                                                        ? '100%'
                                                        : '0%'
                                            }}
                                        ></div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <h4>
                                        Product Status
                                    </h4>

                                    <p>
                                        Distribution overview
                                    </p>

                                </div>

                                <i className="bi bi-pie-chart"></i>

                            </div>

                            <div className="status-list">

                                <div className="status-row">

                                    <span>
                                        <span className="status-dot created"></span>
                                        Created
                                    </span>

                                    <strong>
                                        {createdProducts}
                                    </strong>

                                </div>

                                <div className="status-row">

                                    <span>
                                        <span className="status-dot transit"></span>
                                        In Transit
                                    </span>

                                    <strong>
                                        {inTransitProducts}
                                    </strong>

                                </div>

                                <div className="status-row">

                                    <span>
                                        <span className="status-dot delivered"></span>
                                        Delivered
                                    </span>

                                    <strong>
                                        {deliveredProducts}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Quick Actions */}

                    <div className="section-heading">

                        <div>

                            <h3>
                                Quick Actions
                            </h3>

                            <p>
                                Manage your supply chain operations
                            </p>

                        </div>

                    </div>

                    <div className="quick-actions">

                        <button
                            className="quick-action-card"
                            onClick={() =>
                                scrollToSection('add-product')
                            }
                        >

                            <div className="quick-action-icon blue">
                                <i className="bi bi-plus-circle"></i>
                            </div>

                            <div>

                                <strong>
                                    Add Product
                                </strong>

                                <span>
                                    Create a new product
                                </span>

                            </div>

                            <i className="bi bi-arrow-right"></i>

                        </button>

                        <button
                            className="quick-action-card"
                            onClick={() =>
                                scrollToSection('transfer-product')
                            }
                        >

                            <div className="quick-action-icon orange">
                                <i className="bi bi-arrow-left-right"></i>
                            </div>

                            <div>

                                <strong>
                                    Transfer Product
                                </strong>

                                <span>
                                    Send product to distributor
                                </span>

                            </div>

                            <i className="bi bi-arrow-right"></i>

                        </button>

                        <button
                            className="quick-action-card"
                            onClick={() =>
                                scrollToSection('my-products')
                            }
                        >

                            <div className="quick-action-icon green">
                                <i className="bi bi-box-seam"></i>
                            </div>

                            <div>

                                <strong>
                                    My Products
                                </strong>

                                <span>
                                    View your inventory
                                </span>

                            </div>

                            <i className="bi bi-arrow-right"></i>

                        </button>

                    </div>

                    {/* My Products */}

                    <div
                        id="my-products"
                        className="dashboard-panel products-panel"
                    >

                        <div className="panel-header">

                            <div>

                                <h4>
                                    My Products
                                </h4>

                                <p>
                                    Products created by your business
                                </p>

                            </div>

                            <span className="product-count">
                                {products.length} Products
                            </span>

                        </div>

                        {loading ? (

                            <div className="dashboard-loading">

                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                ></div>

                                <p>
                                    Loading products...
                                </p>

                            </div>

                        ) : products.length === 0 ? (

                            <div className="empty-products">

                                <i className="bi bi-box-seam"></i>

                                <h5>
                                    No products found
                                </h5>

                                <p>
                                    Start by adding your first product.
                                </p>

                                <button
                                    className="dashboard-primary-button"
                                    onClick={() =>
                                        scrollToSection('add-product')
                                    }
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    Add Product
                                </button>

                            </div>

                        ) : (

                            <div className="table-responsive">

                                <table className="dashboard-table">

                                    <thead>

                                        <tr>

                                            <th>Product</th>
                                            <th>Name</th>
                                            <th>Category</th>
                                            <th>Quantity</th>
                                            <th>Status</th>
                                            <th>Created</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {products.map((product) => (

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

                                                    <span className="category-badge">
                                                        {product.category}
                                                    </span>

                                                </td>

                                                <td>
                                                    {product.quantity}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            product.status === 'Delivered'
                                                                ? 'status-badge delivered'
                                                                : product.status === 'In Transit'
                                                                    ? 'status-badge transit'
                                                                    : 'status-badge created'
                                                        }
                                                    >
                                                        {product.status}
                                                    </span>

                                                </td>

                                                <td>
                                                    {new Date(
                                                        product.created_at
                                                    ).toLocaleDateString()}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                    {/* Add Product */}

                    <div
                        id="add-product"
                        className="dashboard-panel form-panel"
                    >

                        <div className="panel-header">

                            <div>

                                <h4>
                                    Add Product
                                </h4>

                                <p>
                                    Register a new product in the supply chain
                                </p>

                            </div>

                            <i className="bi bi-plus-circle panel-icon"></i>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">

                                <div>

                                    <label>
                                        Product ID
                                    </label>

                                    <input
                                        type="text"
                                        id="product_id"
                                        className="dashboard-input"
                                        placeholder="Example: PROD100"
                                        value={formData.product_id}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div>

                                    <label>
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        id="product_name"
                                        className="dashboard-input"
                                        placeholder="Example: Organic Rice"
                                        value={formData.product_name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div>

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        id="category"
                                        className="dashboard-input"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select category
                                        </option>

                                        <option value="Food">
                                            Food
                                        </option>

                                        <option value="Medicine">
                                            Medicine
                                        </option>

                                        <option value="Electronics">
                                            Electronics
                                        </option>

                                        <option value="Clothing">
                                            Clothing
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>

                                <div>

                                    <label>
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        id="quantity"
                                        className="dashboard-input"
                                        placeholder="Enter quantity"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="dashboard-primary-button"
                            >

                                <i className="bi bi-plus-circle"></i>

                                Add Product

                            </button>

                        </form>

                    </div>

                    {/* Transfer Product */}

                    <div
                        id="transfer-product"
                        className="dashboard-panel form-panel"
                    >

                        <div className="panel-header">

                            <div>

                                <h4>
                                    Transfer Product
                                </h4>

                                <p>
                                    Transfer products from your inventory to a distributor
                                </p>

                            </div>

                            <i className="bi bi-arrow-left-right panel-icon"></i>

                        </div>

                        <form onSubmit={handleTransferSubmit}>

                            <div className="form-grid">

                                <div>

                                    <label>
                                        Select Product
                                    </label>

                                    <select
                                        id="transferProduct"
                                        className="dashboard-input"
                                        value={transferData.product_id}
                                        onChange={handleTransferChange}
                                        required
                                    >

                                        <option value="">
                                            Select Product
                                        </option>

                                        {products.map((product) => (

                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.product_id} - {product.product_name}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label>
                                        Select Distributor
                                    </label>

                                    <select
                                        id="to_user_id"
                                        className="dashboard-input"
                                        value={transferData.to_user_id}
                                        onChange={handleTransferChange}
                                        required
                                    >

                                        <option value="">
                                            Select Distributor
                                        </option>

                                        {loadingDistributors ? (

                                            <option disabled>
                                                Loading distributors...
                                            </option>

                                        ) : distributors.length === 0 ? (

                                            <option disabled>
                                                No distributors available
                                            </option>

                                        ) : (

                                            distributors.map(
                                                (distributor) => (

                                                    <option
                                                        key={
                                                            distributor.id ||
                                                            distributor.user_id
                                                        }
                                                        value={
                                                            distributor.id ||
                                                            distributor.user_id
                                                        }
                                                    >
                                                        {
                                                            distributor.name ||
                                                            distributor.full_name
                                                        } - {
                                                            distributor.email
                                                        }
                                                    </option>

                                                )
                                            )

                                        )}

                                    </select>

                                </div>

                                <div>

                                    <label>
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        id="transferQuantity"
                                        className="dashboard-input"
                                        placeholder="Enter quantity"
                                        min="1"
                                        max={
                                            selectedProduct?.quantity || 1
                                        }
                                        value={transferData.quantity}
                                        onChange={handleTransferChange}
                                        required
                                    />

                                    <small>
                                        Available quantity:{' '}
                                        {selectedProduct?.quantity || 0}
                                    </small>

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="dashboard-primary-button"
                            >

                                <i className="bi bi-arrow-right-circle"></i>

                                Transfer Product

                            </button>

                        </form>

                    </div>

                </div>

            </main>

        </div>
    )
}

export default ManufacturerDashboard