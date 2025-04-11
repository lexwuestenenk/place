import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { login } from '../redux/slices/accountSlice';
import axios from 'axios';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = useSelector((state: RootState) => state.account.token);
    const dispatch = useDispatch();
    const path = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const localToken = localStorage.getItem('token');
        const getUser = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${localToken}`
                    }
                })
                return response.data.user
            } catch(error) {
                console.error(error)
                navigate(`/login?next=${path.pathname}&message=Something went wrong while retrieving your session. Please log in again.&messageType=error`)
            }
        }

        if (!token && localToken) {
            const user = getUser()
            dispatch(login({
                user: user, 
                token: localToken
            }));
        }

        if (!token && !localToken) {
            navigate(`/login?next=${path.pathname}`);
        }
    }, [token, navigate, path, dispatch]);

    return token ? children : null;
};

export default ProtectedRoute;
