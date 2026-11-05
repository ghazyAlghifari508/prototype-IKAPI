import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Building2, KeyRound, LogOut, ShieldCheck, Users } from 'lucide-react';
import './admin-portal.css';

type AdminScreen = 'login' | 'dashboard';
const loginUrl = '/prototype/ikapi-internal/login';
const dashboardUrl = '/prototype/ikapi-internal/dashboard';
const authKey = 'ikapi-admin-demo-auth';

export default function AdminPortal({ screen }: { screen: AdminScreen }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authenticated, setAuthenticated] = useState(() => localStorage.getItem(authKey) === 'active');

    useEffect(() => {
        document.title = screen === 'login' ? 'Portal Internal IKAPI Jabar' : 'Dashboard Administrator IKAPI Jabar';
        if (screen === 'dashboard' && !authenticated) window.location.replace(loginUrl);
    }, [screen, authenticated]);

    const signIn = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (email.trim().toLowerCase() !== 'admin@ikapi.id' || password !== 'IKAPIAdmin#2026') {
            setError('Email atau kata sandi administrator tidak sesuai.');
            setPassword('');
            return;
        }

        localStorage.setItem(authKey, 'active');
        setAuthenticated(true);
        window.location.href = dashboardUrl;
    };

    if (screen === 'dashboard' && !authenticated) return null;

    if (screen === 'dashboard') {
        return <main className="admin-shell">
            <header className="admin-header"><a className="admin-brand" href="/prototype"><span><BookOpen size={19}/></span>IKAPI <i>Jawa Barat</i></a><div><span className="admin-secure"><ShieldCheck size={15}/> AREA INTERNAL</span><button className="admin-logout" onClick={()=>{localStorage.removeItem(authKey);setAuthenticated(false);window.location.href=loginUrl;}}><LogOut size={15}/> Keluar</button></div></header>
            <section className="admin-dashboard"><div className="admin-welcome"><div><span className="admin-eyebrow">PORTAL ADMINISTRATOR</span><h1>Selamat datang,<br/>Administrator.</h1><p>Ringkasan ruang kerja internal IKAPI Jawa Barat.</p></div><div className="admin-welcome-mark"><ShieldCheck size={38}/><span>IKAPI<br/>JABAR</span></div></div>
                <div className="admin-demo-banner"><ShieldCheck size={17}/><span><b>Dashboard simulasi</b> — angka berikut hanya data contoh untuk preview F01.</span></div>
                <div className="admin-stat-grid"><article><span><Users size={17}/> PENERBIT</span><b>24</b><small>Terdaftar di platform</small></article><article><span><Building2 size={17}/> MENUNGGU VERIFIKASI</span><b>3</b><small>Perlu ditinjau administrator</small></article><article><span><BookOpen size={17}/> BUKU DIGITAL</span><b>128</b><small>Terdaftar di katalog</small></article></div>
                <button className="admin-back" onClick={()=>window.location.href='/prototype'}><ArrowLeft size={15}/> Kembali ke halaman utama demo</button>
            </section>
            <footer className="admin-footer"><span>IKAPI JAWA BARAT · AKSES INTERNAL</span><span>DEMO FRONTEND · TIDAK TERHUBUNG KE DATA PRODUKSI</span></footer>
        </main>;
    }

    return <main className="admin-shell admin-login-shell">
        <header className="admin-header"><a className="admin-brand" href="/prototype"><span><BookOpen size={19}/></span>IKAPI <i>Jawa Barat</i></a><span className="admin-secure"><ShieldCheck size={15}/> PORTAL INTERNAL</span></header>
        <section className="admin-login-layout"><aside className="admin-login-aside"><div className="admin-seal"><ShieldCheck size={35}/></div><span className="admin-eyebrow">RUANG KERJA ORGANISASI</span><h1>Portal internal<br/>IKAPI Jawa Barat.</h1><p>Akses khusus administrator untuk mengelola operasional marketplace.</p><div className="admin-aside-foot">INTERNAL · TERBATAS · TERLINDUNGI</div></aside>
            <article className="admin-login-card"><button className="admin-back-link" onClick={()=>window.location.href='/prototype'}><ArrowLeft size={14}/> Kembali</button><span className="admin-eyebrow">ADMINISTRATOR IKAPI</span><h2>Masuk portal.</h2><p>Gunakan akun administrator IKAPI Jawa Barat.</p><form onSubmit={signIn}><label><span>Email administrator</span><div className="admin-input"><span><Users size={16}/></span><input type="email" autoComplete="username" required value={email} onChange={e=>{setEmail(e.target.value);setError('');}} placeholder="admin@ikapi.id"/></div></label><label><span>Kata sandi</span><div className="admin-input"><span><KeyRound size={16}/></span><input type="password" autoComplete="current-password" required value={password} onChange={e=>{setPassword(e.target.value);setError('');}} placeholder="Masukkan kata sandi"/></div></label>{error&&<p className="admin-error">{error}</p>}<button className="admin-signin" type="submit">Masuk sebagai administrator <ArrowRight size={16}/></button></form><div className="admin-only-note"><ShieldCheck size={16}/><span>Halaman ini khusus administrator. Tidak tersedia dari login pembeli atau penerbit.</span></div></article>
        </section>
        <footer className="admin-footer"><span>IKAPI JAWA BARAT · AKSES INTERNAL</span><span>DEMO FRONTEND · TIDAK TERHUBUNG KE DATA PRODUKSI</span></footer>
    </main>;
}
