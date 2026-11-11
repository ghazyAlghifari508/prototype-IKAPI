import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, UserRound } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home, register, login } from '@/routes';
import { store } from '@/routes/register';

type Props = { passwordRules: string };

export default function Register({ passwordRules }: Props) {
    const [password, setPassword] = useState('');
    const minimumLength = Number(
        passwordRules.match(/minlength:(\d+)/i)?.[1] ?? 8,
    );
    const checks = [
        password.length >= minimumLength,
        /[A-Z]/.test(password) && /[a-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const strength = !password
        ? 'Belum diisi'
        : score === 4
          ? 'Kuat'
          : score >= 2
            ? 'Sedang'
            : 'Perlu diperkuat';

    return (
        <>
            <Head title="Daftar sebagai Pembeli" />
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" /> Kembali
                </Link>
                <div aria-label="Pilih tipe pendaftaran" className="flex gap-2">
                    <Link
                        href={register()}
                        aria-current="page"
                        className="inline-flex items-center gap-2 rounded-md border border-[#0075de] bg-[#e6f3fe] px-3 py-2 text-sm font-medium text-[#0075de]"
                    >
                        <UserRound className="size-4" /> Pembeli
                    </Link>
                    <Link
                        href="/publisher/register"
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                    >
                        <BookOpen className="size-4" /> Penerbit
                    </Link>
                </div>
            </div>
            <div className="mb-6 space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Mulai perjalanan membaca
                </p>
                <h2 className="text-4xl leading-tight font-semibold tracking-tight text-[#151923]">
                    Akun baru,
                    <br />
                    cerita baru.
                </h2>
                <p className="text-sm text-muted-foreground">
                    Isi detail singkat untuk menjadi bagian dari komunitas
                    pembaca.
                </p>
            </div>
            <Form
                {...store.form()}
                transform={(data) => {
                    const { first_name, last_name, ...rest } = data;
                    return {
                        ...rest,
                        name: [first_name, last_name]
                            .map((part) => String(part ?? '').trim())
                            .filter(Boolean)
                            .join(' '),
                    };
                }}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex w-full min-w-0 flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid min-w-0 gap-x-4 gap-y-5 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">Nama depan</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    required
                                    autoComplete="given-name"
                                    placeholder="Nama depan"
                                    aria-invalid={Boolean(errors.name)}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Nama belakang</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    autoComplete="family-name"
                                    placeholder="Nama belakang"
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="email">Alamat email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    aria-invalid={Boolean(errors.email)}
                                />
                                <InputError message={errors.email} />
                                <p className="text-xs text-muted-foreground">
                                    Gunakan email aktif yang bisa Anda akses.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Nomor telepon</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    required
                                    autoComplete="tel"
                                    inputMode="tel"
                                    placeholder="08xx xxxx xxxx"
                                    aria-invalid={Boolean(errors.phone)}
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Kata sandi</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Min. 8 karakter"
                                    passwordrules={passwordRules}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.password)}
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="rounded-md border border-[#cfe6fb] bg-[#f7faff] p-3 sm:col-span-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium">
                                        Kekuatan kata sandi
                                    </span>
                                    <span className="font-medium text-[#0075de]">
                                        {strength}
                                    </span>
                                </div>
                                <div
                                    className="mt-3 grid grid-cols-4 gap-1"
                                    aria-hidden="true"
                                >
                                    {checks.map((passed, index) => (
                                        <span
                                            key={index}
                                            className={`h-1 rounded-full ${passed ? 'bg-[#0075de]' : 'bg-slate-200'}`}
                                        />
                                    ))}
                                </div>
                                <ul className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                                    <li>
                                        ◉ &nbsp;Minimal {minimumLength} karakter
                                    </li>
                                    <li>◉ &nbsp;Huruf besar dan kecil</li>
                                    <li>◉ &nbsp;Angka</li>
                                    <li>◉ &nbsp;Simbol</li>
                                </ul>
                                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                                    Jangan gunakan kata sandi yang sama dengan
                                    akun lain.
                                </p>
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi kata sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Ulangi kata sandi"
                                    passwordrules={passwordRules}
                                    aria-invalid={Boolean(
                                        errors.password_confirmation,
                                    )}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>
                        </div>
                        <div className="rounded-md bg-emerald-50 px-3 py-3 text-xs text-emerald-800">
                            Data akun dan kata sandi Anda dilindungi selama sesi
                            demo ini.
                        </div>
                        <label className="flex items-start gap-3 text-sm text-muted-foreground">
                            <input
                                required
                                type="checkbox"
                                name="terms_accepted"
                                value="1"
                                className="mt-1 size-4 accent-[#0075de]"
                            />
                            Saya setuju dengan syarat penggunaan dan kebijakan
                            privasi.
                        </label>
                        <InputError message={errors.terms_accepted} />
                        <Button
                            type="submit"
                            className="w-full bg-[#0075de] py-6 text-base text-white hover:bg-[#0067c5]"
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />} Buat akun pembeli
                        </Button>
                        <Link
                            href={login()}
                            className="rounded-md border border-[#cfe6fb] bg-[#f2f8fe] px-4 py-3 text-center text-sm font-medium text-[#0075de] hover:bg-[#e6f3fe]"
                        >
                            Sudah memiliki akun? Login{' '}
                            <ArrowRight className="ml-1 inline size-4" />
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = { title: '', description: '' };
