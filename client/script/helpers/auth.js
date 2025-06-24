export const isLoggedIn = () => (
    new URLSearchParams(window.location.search).has('adminKey')
);
