import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = useSelector((state: RootState) => state.account.token);
    const path = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if(!path || !path.pathname) return
        if(!token) {
            navigate(`/login?next=${path.pathname}`)
        }
    }, [token, navigate, path])

    return children;
};

export default ProtectedRoute;
