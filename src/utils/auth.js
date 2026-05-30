export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const getCurrentAccount = () => {
  const accountStr = localStorage.getItem("currentAccount");
  if (!accountStr) return null;
  try {
    return JSON.parse(accountStr);
  } catch (error) {
    return null;
  }
};

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const setCurrentAccount = (account) => {
  if (account) {
    localStorage.setItem("currentAccount", JSON.stringify(account));
  } else {
    localStorage.removeItem("currentAccount");
  }
};

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentAccount");
};

export const isLoggedIn = () => {
  return !!getAccessToken();
};

export const isAdmin = () => {
  const account = getCurrentAccount();
  return account && account.role === "ADMIN";
};
