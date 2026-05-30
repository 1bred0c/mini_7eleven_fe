import axiosClient from "./axiosClient";

export const walletApi = {
  openWallet: () => axiosClient.post("/wallets/me/open"),
  getMyWallet: () => axiosClient.get("/wallets/me"),
  topUp: (data) => axiosClient.post("/wallets/me/top-up", data),
  getTransactions: (params) => axiosClient.get("/wallets/me/transactions", { params }),
};
