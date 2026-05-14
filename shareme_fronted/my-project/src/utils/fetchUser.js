export const fetchUser = () => {
    const userInfo = localStorage.getItem('user');

    return userInfo && userInfo !== 'undefined' ? JSON.parse(userInfo) : null;
}
