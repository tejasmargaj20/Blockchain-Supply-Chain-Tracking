import { useEffect, useState } from 'react'
import {
    addProduct,
    getManufacturerProducts,
    transferProduct
} from '../services/api'

function ManufacturerDashboard() {

    const user = JSON.parse(localStorage.getItem('user'))

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

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

    async function loadProducts() {

        try {

            const data = await getManufacturerProducts(user.id)

            setProducts(data)

        } catch (error) {

            setError(error.message)

        } finally {

            setLoading(false)

        }
    }

    useEffect(() => {
        loadProducts()
    }, [])

    function handleChange(event) {

        setFormData({
            ...formData,
            [event.target.id]: event.target.value
        })

    }

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

    async function handleSubmit(event) {

        event.preventDefault()

        setMessage('')
        setError('')

        try {

            const data = await addProduct({
                ...formData,
                quantity: Number(formData.quantity),
                manufacturer_id: user.id
            })

            setMessage(data.message)

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

    async function handleTransferSubmit(event) {

        event.preventDefault()

        setMessage('')
        setError('')

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

            loadProducts()

        } catch (error) {

            setError(error.message)

        }
    }

    function scrollToSection(sectionId) {

        document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth'
        })

    }

    const selectedProduct = products.find(
        (product) =>
            product.id === Number(transferData.product_id)
    )

    return (
        <section className="py-5">

            <div className="container">

                {/* Dashboard Header */}

                <div className="mb-4">

                    <h2>
                        Manufacturer Dashboard
                    </h2>

                    <p className="text-muted mb-1">
                        Welcome, <strong>{user?.name}</strong>
                    </p>

                    <p className="text-muted mb-2">
                        Role: <strong>Manufacturer</strong>
                    </p>

                    <p className="text-secondary mb-0">
                        Manage products and track their movement through the
                        supply chain.
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

                    <div className="col-md-4">

                        <div
                            className="card border-0 shadow-sm p-4 h-100"
                            role="button"
                            onClick={() => scrollToSection('add-product')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-plus-circle fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                Add Product
                            </h5>

                            <p className="text-secondary mb-0">
                                Add a new product to your supply chain.
                            </p>

                        </div>

                    </div>

                    <div className="col-md-4">

                        <div
                            className="card border-0 shadow-sm p-4 h-100"
                            role="button"
                            onClick={() => scrollToSection('my-products')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-box-seam fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                My Products
                            </h5>

                            <p className="text-secondary mb-0">
                                View products created by you.
                            </p>

                        </div>

                    </div>

                    <div className="col-md-4">

                        <div
                            className="card border-0 shadow-sm p-4 h-100"
                            role="button"
                            onClick={() => scrollToSection('transfer-product')}
                        >

                            <div className="text-primary mb-3">
                                <i className="bi bi-arrow-right-circle fs-1"></i>
                            </div>

                            <h5 className="fw-bold">
                                Transfer Product
                            </h5>

                            <p className="text-secondary mb-0">
                                Transfer products to a distributor.
                            </p>

                        </div>

                    </div>

                </div>

                {/* Add Product */}

                <div
                    id="add-product"
                    className="card border-0 shadow-sm p-4 mt-4"
                >

                    <h4 className="fw-bold mb-4">
                        Add Product
                    </h4>

                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="product_id"
                                    className="form-label"
                                >
                                    Product ID
                                </label>

                                <input
                                    type="text"
                                    id="product_id"
                                    className="form-control"
                                    placeholder="Enter product ID"
                                    value={formData.product_id}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="product_name"
                                    className="form-label"
                                >
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    id="product_name"
                                    className="form-control"
                                    placeholder="Enter product name"
                                    value={formData.product_name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="category"
                                    className="form-label"
                                >
                                    Category
                                </label>

                                <select
                                    id="category"
                                    className="form-select"
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
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary mt-2"
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add Product
                        </button>

                    </form>

                </div>

                {/* My Products */}

                <div
                    id="my-products"
                    className="card border-0 shadow-sm p-4 mt-4"
                >

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h4 className="fw-bold mb-1">
                                My Products
                            </h4>

                            <p className="text-secondary mb-0">
                                Products created by you.
                            </p>

                        </div>

                        <span className="badge bg-primary">
                            {products.length} Products
                        </span>

                    </div>

                    {loading ? (

                        <div className="text-center py-4">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="text-secondary mt-2 mb-0">
                                Loading products...
                            </p>

                        </div>

                    ) : products.length === 0 ? (

                        <div className="text-center py-4">

                            <i className="bi bi-box-seam fs-1 text-secondary"></i>

                            <p className="text-secondary mt-2 mb-0">
                                No products found.
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
                                                <span className="badge bg-light text-dark border">
                                                    {product.category}
                                                </span>
                                            </td>

                                            <td>
                                                {product.quantity}
                                            </td>

                                            <td>

                                                <span className="badge bg-success">
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

                {/* Transfer Product */}

                <div
                    id="transfer-product"
                    className="card border-0 shadow-sm p-4 mt-4"
                >

                    <h4 className="fw-bold mb-2">
                        Transfer Product
                    </h4>

                    <p className="text-secondary">
                        Transfer products from your inventory to a distributor.
                    </p>

                    <form onSubmit={handleTransferSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="transferProduct"
                                    className="form-label"
                                >
                                    Select Product
                                </label>

                                <select
                                    id="transferProduct"
                                    className="form-select"
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

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="to_user_id"
                                    className="form-label"
                                >
                                    Distributor ID
                                </label>

                                <input
                                    type="number"
                                    id="to_user_id"
                                    className="form-control"
                                    placeholder="Enter distributor ID"
                                    min="1"
                                    value={transferData.to_user_id}
                                    onChange={handleTransferChange}
                                    required
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label
                                    htmlFor="transferQuantity"
                                    className="form-label"
                                >
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    id="transferQuantity"
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

            </div>

        </section>
    )
}

export default ManufacturerDashboard