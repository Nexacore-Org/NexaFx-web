import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/api/transactionService";
import { Transaction } from "@/types/transaction";

// Hook to get all transactions
export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: transactionService.getAllTransactions,
  });
};

// Hook to create a new transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Transaction) =>
      transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
