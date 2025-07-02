import { API_ENDPOINTS } from "./config";
import axiosClient from "./axiosClient";
import { Transaction } from "@/types/transaction";

//! Should be changed after making first API call
const createTransaction = async (params: Transaction): Promise<any> => {
  const response = await axiosClient.post(API_ENDPOINTS.TRANSACTIONS.CREATE, params);
  return response.data;
};

const getAllTransactions = async (): Promise<any> => {
  const response = await axiosClient.get(API_ENDPOINTS.TRANSACTIONS.ALL);
  return response.data;
};

export const transactionService = {
  createTransaction,
  getAllTransactions,
};
