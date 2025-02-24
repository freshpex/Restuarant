export const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // You could add additional token validation here
    // For example, checking if it's expired using JWT decode
    return true;
};

export const clearAuthData = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
};
