const API_URL = 'http://localhost:5000'

export async function registerUser(userData) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
    }

    return data
}

export async function loginUser(userData) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Login failed')
    }

    return data
}

export async function addProduct(productData) {
    const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Product creation failed')
    }

    return data
}

export async function getManufacturerProducts(manufacturerId) {
    const response = await fetch(
        `${API_URL}/api/products/manufacturer/${manufacturerId}`
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Failed to load products')
    }

    return data
}

export async function transferProduct(transferData) {
    const response = await fetch(
        `${API_URL}/api/products/transfer`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transferData),
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Product transfer failed')
    }

    return data
}

export async function getUserInventory(userId) {
    const response = await fetch(
        `${API_URL}/api/inventory/${userId}`
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Failed to load inventory')
    }

    return data
}

export async function getUserTransfers(userId) {
    const response = await fetch(
        `${API_URL}/api/transfers/user/${userId}`
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Failed to load transfers')
    }

    return data
}