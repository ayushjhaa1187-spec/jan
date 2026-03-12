export const getAccessToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('accessToken'))
