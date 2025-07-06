import { API_ENDPOINTS } from "./config";
import axiosClient from "./axiosClient";
// import { apiClient } from "./client";

interface CreateUserParams {
  email: string;
  phone: string;
  password: string;
}

interface VerifySignupParams {
  email: string;
  otp: string;
}

interface LoginParams {
  identifier: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  address: string;
  email: string | null;
  picture: string | null;
  isVerified: boolean;
  roles: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user?: User;
}

const createUser = async (params: CreateUserParams): Promise<AuthResponse> => {
  const response = await axiosClient.post(API_ENDPOINTS.AUTH.CREATE, params);
  return response.data;
};

const verifySignup = async (
  params: VerifySignupParams
): Promise<AuthResponse> => {
  const response = await axiosClient.post(API_ENDPOINTS.AUTH.VERIFY, params);
  return response.data;
};

const login = async (params: LoginParams): Promise<AuthResponse> => {
  const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, params);
  return response.data;
};

const logout = async (): Promise<{ message: string }> => {
  const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};

const refreshToken = async (token: string): Promise<AuthResponse> => {
  const response = await axiosClient.post(API_ENDPOINTS.AUTH.REFRESH, {
    token,
  });
  return response.data;
};

export const userService = {
  createUser,
  verifySignup,
  login,
  logout,
  refreshToken,
};