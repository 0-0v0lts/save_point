export function getStoredUser() {
  return {
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('user_role') || '',
  };
}

export const isAdmin = (role) => role === 'admin';

export const isStaff = (role) => role === 'admin' || role === 'curator';
