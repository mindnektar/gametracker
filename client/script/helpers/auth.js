export const isLoggedIn = () => (
    !!window.localStorage.getItem('authKey')
);
