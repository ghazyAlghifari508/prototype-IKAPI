import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    UserRound,
} from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home, login } from '@/routes';
import { request } from '@/routes/password';

type PageProps = {
    errors?: Record<string, string>;
    status?: string;
};

export default function PublisherLoginPage() {
    const { errors, status } = usePage<PageProps>().props;

    const isApprovalMessage =
        Boolean(errors?.email) &&
        (errors.email.includes('menunggu') ||
            errors.email.includes('ditolak') ||
            errors.email.includes('dinonaktifkan') ||
            errors.email.includes('administrator'));

    return (
        <>
            <Head title="Masuk Portal Penerbit" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" /> Kembali
                </Link>
                <div aria-label="Pilih tipe login" className="flex gap-2">
                    <Link
                        href={login()}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-muted-foreground transition hover:bg-slate-50 hover:text-foreground"
                    >
                        <UserRound className="size-4" /> Pembeli
                    </Link>
                    <span
                        aria-current="page"
                        className="inline-flex items-center gap-2 rounded-md border border-[#0075de] bg-[#e6f3fe] px-3 py-2 text-sm font-medium text-[#0075de]"
                    >
                        <BookOpen className="size-4" /> Penerbit
                    </span>
                </div>
            </div>

            <div className="mb-6 space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] text-[#0075de] uppercase">
                    Portal Mitra Penerbit
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#151923] sm:text-4xl">
                    Masuk portal penerbit.
                </h1>
                <p className="text-sm text-muted-foreground">
                    Akses khusus penerbit resmi IKAPI Jawa Barat yang telah
                    diverifikasi dan disetujui.
                </p>
            </div>

            {status && (
                <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
                >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <div>
                        <p className="font-semibold text-emerald-900">
                            Informasi Pendaftaran
                        </p>
                        <p className="mt-0.5 text-emerald-800">{status}</p>
                    </div>
                </div>
            )}

            {isApprovalMessage && (
                <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                >
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                    <div>
                        <p className="font-semibold text-amber-950">
                            Status Akun Penerbit
                        </p>
                        <p className="mt-0.5 text-amber-800">{errors.email}</p>
                    </div>
                </div>
            )}

            <div className="w-full">
                <Form
                    method="post"
                    action="/publisher/login"
                    className="flex w-full min-w-0 flex-col gap-5"
                    disableWhileProcessing
                >
                    {({ processing }) => (
                        <>
                            <div className="grid min-w-0 gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email Penerbit
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="nama@penerbit.com"
                                        required
                                        autoFocus
                                        aria-invalid={Boolean(errors.email)}
                                    />
                                    {!isApprovalMessage && (
                                        <InputError message={errors.email} />
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">
                                            Kata Sandi
                                        </Label>
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-medium text-[#0075de]"
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        aria-invalid={Boolean(errors.password)}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox id="remember" name="remember" />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm text-slate-700"
                                    >
                                        Ingat saya di perangkat ini
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#0075de] py-6 text-base text-white shadow-sm hover:bg-[#0067c5]"
                                >
                                    {processing && <Spinner />}
                                    Masuk Portal Penerbit
                                </Button>
                            </div>

                            <div className="space-y-3 pt-2 text-center text-sm text-slate-600">
                                <p>
                                    Belum terdaftar sebagai mitra penerbit?{' '}
                                    <TextLink
                                        href="/publisher/register"
                                        className="font-medium text-[#0075de]"
                                    >
                                        Daftar sekarang
                                    </TextLink>
                                </p>
                                <p className="border-t border-slate-100 pt-3 text-xs text-muted-foreground">
                                    Ingin belanja buku sebagai pembeli?{' '}
                                    <Link
                                        href={login()}
                                        className="font-medium text-[#0075de] hover:underline"
                                    >
                                        Login Pembeli
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

PublisherLoginPage.layout = {
    title: '',
    description: '',
};
