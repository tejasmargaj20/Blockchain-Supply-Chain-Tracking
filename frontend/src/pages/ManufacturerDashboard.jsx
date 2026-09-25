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

    async function loadProducts() {

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

    function handleChange(event) {

        setFormData({
            ...formData,
            [event.target.id]: event.target.value
        })
    }

    function handleTransferChange(event) {

        setTransferData({
            ...transferData,
            [event.target.id]: event.target.value
        })
    }

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
            setError('Transfer quantity cannot exceed available quantity')
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
                        product_id: Number(transferData.product_id),
                        from_user_id: user.id,
                        to_user_id: Number(transferData.to_user_id),
                        quantity: Number(transferData.quantity)
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Product transfer failed'
                )
            }

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

    const selectedProduct = products.find(
        (product) =>
            product.id === Number(transferData.product_id)
    )

    return (
        <section className="py-5">

            <div className="container">

                <h2 className="fw-bold">
                    Manufacturer Dashboard
                </h2>

                <p className="text-secondary">
                    Manage products and track their movement through the supply chain.
                </p>

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

                <div className="card border-0 shadow-sm p-4 mt-4">

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

                <div className="card border-0 shadow-sm p-4 mt-4">

                    <h4 className="fw-bold mb-4">
                        My Products
                    </h4>

                    {loading ? (

                        <p className="text-secondary">
                            Loading products...
                        </p>

                    ) : products.length === 0 ? (

                        <p className="text-secondary">
                            No products found.
                        </p>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead>

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
                                                {product.product_id}
                                            </td>

                                            <td>
                                                {product.product_name}
                                            </td>

                                            <td>
                                                {product.category}
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

                <div className="card border-0 shadow-sm p-4 mt-4">

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
                                    Select Distributor
                                </label>

                                <select
                                    id="to_user_id"
                                    className="form-select"
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

                                        distributors.map((distributor) => (

                                            <option
                                                key={distributor.id}
                                                value={distributor.id}
                                            >
                                                {distributor.name} - {distributor.email}
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

            </div>

        </section>
    )
}

export default ManufacturerDashboard