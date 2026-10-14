
export function resolveRedirect(from, user) {
  const home = user.role === 'organizer' ? '/organizer' : '/student';
  const path = from?.pathname;

  if (!path || path === '/login' || path === '/register') return home;
  if (path.startsWith('/student') && user.role !== 'student') return home;

  return `${path}${from.search || ''}`;
}
