export const getAccessToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('accessToken'));
export const getRefreshToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('refreshToken'));
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};
