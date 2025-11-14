// client/src/services/auth.services.js
import axiosInstance from '../utils/axiosInstance.util';
import { useNavigate } from 'react-router-dom';

export const authServices = {
  signup: async (data) => {
    const res = await axiosInstance.post('/auth/signup', data);
    return res.data;
  },

  login: async (credentials) => {
    const res = await axiosInstance.post('/auth/login', credentials);
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.get('/auth/logout');
    return res.data;
  }
};

/* --------------------------------------------------------------
   Hook – can be used in any component (Navbar, Profile, etc.)
   -------------------------------------------------------------- */
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authServices.logout();
      // clear any leftover local state if you have it
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/', { replace: true });
    }
  };

  return logout;
};