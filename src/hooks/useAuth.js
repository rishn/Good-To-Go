import { useSelector } from 'react-redux'
import { selectCurrentToken } from "../features/auth/authSlice"
import jwtDecode from 'jwt-decode'

const useAuth = () => {
    const token = useSelector(selectCurrentToken)
    let isAdmin = false
    let isDriver = false
    let status = 'Customer'

    if (token) {
        const decoded = jwtDecode(token)
        const { username, role, id } = decoded.UserInfo

        isAdmin = role === 'Admin'
        isDriver = role === 'Driver'
        
        if (isAdmin) 
            status = 'Admin'
        
        if (isDriver) 
            status = 'Driver'

        return { id, username, role, status, isAdmin, isDriver }
    }

    return { id: '', username: '', role: '', isAdmin, isDriver, status }
}
export default useAuth