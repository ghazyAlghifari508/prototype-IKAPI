import { createRoot } from 'react-dom/client';
import F01Prototype from './F01Prototype';
import AdminPortal from './AdminPortal';

const screens: Record<string, Parameters<typeof F01Prototype>[0]['screen']> = {
    '/prototype': 'index',
    '/prototype/auth/login-buyer': 'login-buyer',
    '/prototype/auth/login-publisher': 'login-publisher',
    '/prototype/auth/register-buyer': 'register-buyer',
    '/prototype/auth/register-publisher': 'register-publisher',
    '/prototype/auth/forgot-password': 'forgot-password',
    '/prototype/auth/reset-password': 'reset-password',
    '/prototype/profile/buyer': 'profile-buyer',
};

const adminScreen = window.location.pathname === '/prototype/ikapi-internal/dashboard' ? 'dashboard' : 'login';
if (window.location.pathname.startsWith('/prototype/ikapi-internal/')) {
    createRoot(document.getElementById('app')!).render(<AdminPortal screen={adminScreen} />);
} else {
    const screen = screens[window.location.pathname] ?? 'index';
    createRoot(document.getElementById('app')!).render(<F01Prototype screen={screen} />);
}
