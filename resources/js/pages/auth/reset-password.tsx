import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { request, update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Atur Ulang Kata Sandi">
                <meta name="referrer" content="no-referrer" />
            </Head>

            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <Link
                    href={login()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" /> Kembali ke Login
                </Link>
            </div>

            <div className="mb-6 space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    Keamanan Akun
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#151923] sm:text-4xl">
                    Atur ulang kata sandi.
                </h1>
                <p className="text-sm text-muted-foreground">
                    Buat kata sandi baru yang kuat untuk melindungi akun dan
                    riwayat bacaan Anda.
                </p>
            </div>

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-slate-800">
                                Email Akun
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="bg-slate-50 text-slate-700"
                                readOnly
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={
                                    errors.email
                                        ? 'reset-email-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="reset-email-error"
                                message={errors.email}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="text-slate-800"
                            >
                                Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                placeholder="Minimal 8 karakter"
                                passwordrules={passwordRules}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={
                                    errors.password
                                        ? 'reset-password-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="reset-password-error"
                                message={errors.password}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-slate-800"
                            >
                                Konfirmasi Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Ulangi kata sandi baru"
                                passwordrules={passwordRules}
                                aria-invalid={Boolean(
                                    errors.password_confirmation,
                                )}
                                aria-describedby={
                                    errors.password_confirmation
                                        ? 'reset-password-confirmation-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="reset-password-confirmation-error"
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full bg-[#0075de] py-6 text-base text-white shadow-sm hover:bg-[#0067c5]"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Simpan Kata Sandi Baru
                        </Button>

                        <p className="border-t border-slate-100 pt-4 text-center text-sm text-muted-foreground">
                            Tautan tidak berlaku atau kedaluwarsa?{' '}
                            <TextLink
                                href={request()}
                                className="font-medium text-[#0075de]"
                            >
                                Minta tautan baru
                            </TextLink>
                        </p>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: '',
    description: '',
};
