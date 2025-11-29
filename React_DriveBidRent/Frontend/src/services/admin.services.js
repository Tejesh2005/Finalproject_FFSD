import axiosInstance from "../utils/axiosInstance.util";

const adminServices = {
  // Dashboard
  getDashboard: async () => {
    const response = await axiosInstance.get("admin/admin");
    return response.data;
  },

  // Manage Users
  getManageUsers: async () => {
    const response = await axiosInstance.get("admin/manage-user");
    return response.data;
  },
  approveMechanic: async (id) => {
    const response = await axiosInstance.post(`admin/approve-user/${id}`);
    return response.data;
  },
  declineUser: async (id) => {
    const response = await axiosInstance.post(`admin/decline-user/${id}`);
    return response.data;
  },
  deleteBuyer: async (id) => {
    const response = await axiosInstance.post(`admin/delete-buyer/${id}`);
    return response.data;
  },
  deleteSeller: async (id) => {
    const response = await axiosInstance.post(`admin/delete-seller/${id}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await axiosInstance.get("admin/analytics");
    return response.data;
  },

  // Manage Earnings
  getManageEarnings: async () => {
    const response = await axiosInstance.get("admin/manage-earnings");
    return response.data;
  },

  // Admin Profile
  getAdminProfile: async () => {
    const response = await axiosInstance.get("admin/admin-profile");
    return response.data;
  },
  updateAdminPassword: async (data) => {
    const response = await axiosInstance.post("admin/update-admin-password", data);
    return response.data;
  },
};

export default adminServices;