export const isLoggedIn = () => (
    !!localStorage.getItem('adminKey')
);
