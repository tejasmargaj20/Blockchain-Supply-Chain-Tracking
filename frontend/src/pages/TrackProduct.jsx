import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

function TrackProduct() {

    const [searchParams] = useSearchParams()

    const [productId, setProductId] = useState('')
    const [searchedProduct, setSearchedProduct] = useState(null)
    const [searchError, setSearchError] = useState('')

    const productData = {
        productId: searchedProduct,
        productName: 'Test Product',
        category: 'Food',
        currentLocation: 'Retailer',
        currentStatus: 'In Supply Chain',
        journey: [
            {
                stage: 'Manufacturer',
                participant: 'Manufacturer',
                status: 'Completed',
                date: '-',
                icon: 'bi-building'
            },
            {
                stage: 'Distributor',
                participant: 'Distributor',
                status: 'Completed',
                date: '-',
                icon: 'bi-truck'
            },
            {
                stage: 'Retailer',
                participant: 'Retailer',
                status: 'Current',
                date: '-',
                icon: 'bi-shop'
            }
        ]
    }

    function handleSearch(event) {

        event.preventDefault()

        setSearchError('')

        const enteredProductId = productId.trim()

        if (!enteredProductId) {
            setSearchError('Please enter a product ID.')
            setSearchedProduct(null)
            return
        }

        setSearchedProduct(enteredProductId)
    }

    useEffect(() => {

        const product = searchParams.get('product')

        if (product) {
            setProductId(product)
            setSearchedProduct(product)
            setSearchError('')
        }

    }, [searchParams])

    return (
        <section className="py-5">

            <div className="container">

                <div className="text-center mb-5">

                    <h2 className="fw-bold">
                        Track Product
                    </h2>

                    <p className="text-secondary">
                        Enter a product ID to view its complete supply-chain journey.
                    </p>

                </div>

                {/* Search Product */}

                <div className="card border-0 shadow-sm p-4">

                    <form onSubmit={handleSearch}>

                        <div className="row justify-content-center">

                            <div className="col-md-8">

                                <label
                                    htmlFor="productId"
                                    className="form-label fw-semibold"
                                >
                                    Product ID
                                </label>

                                <div className="input-group">

                                    <input
                                        type="text"
                                        id="productId"
                                        className="form-control"
                                        placeholder="Enter product ID e.g. P001"
                                        value={productId}
                                        onChange={(event) => {
                                            setProductId(event.target.value)
                                            setSearchError('')
                                        }}
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        <i className="bi bi-search me-2"></i>
                                        Track
                                    </button>

                                </div>

                            </div>

                        </div>

                    </form>

                </div>

                {/* Search Error */}

                {searchError && (

                    <div className="alert alert-danger mt-4">

                        <i className="bi bi-exclamation-circle me-2"></i>

                        {searchError}

                    </div>

                )}

                {searchedProduct && (

                    <>

                        {/* Product Information */}

                        <div className="card border-0 shadow-sm p-4 mt-4">

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <h4 className="fw-bold mb-0">
                                    Product Information
                                </h4>

                                <span className="badge bg-success">
                                    Trackable
                                </span>

                            </div>

                            <div className="row">

                                <div className="col-md-6 mb-3">

                                    <p className="text-secondary mb-1">
                                        Product ID
                                    </p>

                                    <h6 className="fw-bold">
                                        {productData.productId}
                                    </h6>

                                </div>

                                <div className="col-md-6 mb-3">

                                    <p className="text-secondary mb-1">
                                        Product Name
                                    </p>

                                    <h6 className="fw-bold">
                                        {productData.productName}
                                    </h6>

                                </div>

                                <div className="col-md-6 mb-3">

                                    <p className="text-secondary mb-1">
                                        Category
                                    </p>

                                    <h6 className="fw-bold">
                                        {productData.category}
                                    </h6>

                                </div>

                                <div className="col-md-6 mb-3">

                                    <p className="text-secondary mb-1">
                                        Current Location
                                    </p>

                                    <h6 className="fw-bold">
                                        {productData.currentLocation}
                                    </h6>

                                </div>

                                <div className="col-md-6">

                                    <p className="text-secondary mb-1">
                                        Current Status
                                    </p>

                                    <span className="badge bg-success">
                                        {productData.currentStatus}
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* Supply Chain Journey */}

                        <div className="card border-0 shadow-sm p-4 mt-4">

                            <h4 className="fw-bold mb-4">
                                Supply Chain Journey
                            </h4>

                            <div className="table-responsive">

                                <table className="table table-hover align-middle">

                                    <thead>

                                        <tr>
                                            <th>Stage</th>
                                            <th>Participant</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {productData.journey.map((item, index) => (

                                            <tr key={index}>

                                                <td>
                                                    <i
                                                        className={`bi ${item.icon} text-primary me-2`}
                                                    ></i>

                                                    {item.stage}
                                                </td>

                                                <td>
                                                    {item.participant}
                                                </td>

                                                <td>

                                                    {item.status === 'Current' ? (

                                                        <span className="badge bg-warning text-dark">
                                                            Current
                                                        </span>

                                                    ) : (

                                                        <span className="badge bg-success">
                                                            Completed
                                                        </span>

                                                    )}

                                                </td>

                                                <td>
                                                    {item.date}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                        {/* Product Journey */}

                        <div className="card border-0 shadow-sm p-4 mt-4">

                            <h4 className="fw-bold mb-4">
                                Product Journey
                            </h4>

                            <div className="row g-4">

                                {productData.journey.map((item, index) => (

                                    <div
                                        className="col-md-4"
                                        key={index}
                                    >

                                        <div className="card border p-4 h-100 text-center">

                                            <i
                                                className={`bi ${item.icon} fs-1 text-primary`}
                                            ></i>

                                            <h5 className="fw-bold mt-3">
                                                {item.stage}
                                            </h5>

                                            <p className="text-secondary mb-0">

                                                {item.stage === 'Manufacturer' &&
                                                    'Product created and registered in the supply-chain system.'
                                                }

                                                {item.stage === 'Distributor' &&
                                                    'Product transferred and received by the distributor.'
                                                }

                                                {item.stage === 'Retailer' &&
                                                    'Product reaches the retailer for final distribution.'
                                                }

                                            </p>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                        {/* QR Verification */}

                        <div className="card border-0 shadow-sm p-4 mt-4 text-center">

                            <h4 className="fw-bold">
                                QR Product Verification
                            </h4>

                            <p className="text-secondary">
                                Scan the product QR code to verify its journey.
                            </p>

                            <div className="mt-3">

                                <i className="bi bi-qr-code fs-1 text-primary"></i>

                            </div>

                            <p className="text-secondary mt-3 mb-0">
                                QR verification will be connected later.
                            </p>

                        </div>

                    </>

                )}

            </div>

        </section>
    )
}

export default TrackProduct