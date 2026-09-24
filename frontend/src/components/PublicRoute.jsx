import { Navigate } from 'react-router-dom'

function PublicRoute({ children }) {

    const user = JSON.parse(localStorage.getItem('user'))

    function getDashboardPath() {

        if (!user) return null

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

    const dashboardPath = getDashboardPath()

    if (user && dashboardPath) {
        return <Navigate to={dashboardPath} replace />
    }

    return children
}

export default PublicRoute