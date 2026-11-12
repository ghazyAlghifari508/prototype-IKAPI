import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle2, UserRound } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home, register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk sebagai Pembeli" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" /> Kembali
                </Link>
                <div aria-label="Pilih tipe login" className="flex gap-2">
                    <span
                        aria-current="page"
                        className="inline-flex items-center gap-2 rounded-md border border-[#0075de] bg-[#e6f3fe] px-3 py-2 text-sm font-medium text-[#0075de]"
                    >
                        <UserRound className="size-4" /> Pembeli
                    </span>
                    <Link
                        href="/publisher/login"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-muted-foreground transition hover:bg-slate-50 hover:text-foreground"
                    >
                        <BookOpen className="size-4" /> Penerbit
                    </Link>
                </div>
            </div>

            <div className="mb-6 space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Selamat Datang Kembali
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#151923] sm:text-4xl">
                    Masuk akun pembaca.
                </h1>
                <p className="text-sm text-muted-foreground">
                    Masuk untuk mengakses koleksi buku, riwayat pembelian, dan
                    preferensi membaca Anda.
                </p>
            </div>

            {status && (
                <div
                    role="status"
                    className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                >
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    <span>{status}</span>
                </div>
            )}

            <PasskeyVerify
                label="Masuk dengan passkey"
                loadingLabel="Memverifikasi..."
                separator="Atau gunakan email"
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                resetOnError={['password']}
                disableWhileProcessing
                className="mt-2 flex w-full min-w-0 flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid min-w-0 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                />
                                <InputError
                                    id="email-error"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Kata Sandi</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-[#0075de]"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi"
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password
                                            ? 'password-error'
                                            : undefined
                                    }
                                />
                                <InputError
                                    id="password-error"
                                    message={errors.password}
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-slate-700"
                                >
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-[#0075de] py-6 text-base text-white shadow-sm hover:bg-[#0067c5]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk sebagai Pembeli
                            </Button>
                        </div>

                        <div className="space-y-3 pt-2 text-center text-sm text-slate-600">
                            <p>
                                Belum punya akun pembeli?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={6}
                                    className="font-medium text-[#0075de]"
                                >
                                    Daftar sekarang
                                </TextLink>
                            </p>
                            <p className="border-t border-slate-100 pt-3 text-xs text-muted-foreground">
                                Mendaftar atau masuk sebagai mitra penerbit?{' '}
                                <Link
                                    href="/publisher/login"
                                    className="font-medium text-[#0075de] hover:underline"
                                >
                                    Portal Penerbit
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: '',
    description: '',
};
