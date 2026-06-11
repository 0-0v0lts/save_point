// Helpers centralizados de autenticação e permissão.
// Mantém as chaves do localStorage e as regras de role em um único lugar,
// evitando strings mágicas espalhadas pelos componentes.

export function getStoredUser() {
  return {
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('user_role') || '',
  };
}

// Só admin
export const isAdmin = (role) => role === 'admin';

// Admin OU curador (a "equipe" do Save Point)
export const isStaff = (role) => role === 'admin' || role === 'curator';
