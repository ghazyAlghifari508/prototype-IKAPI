import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Kata Sandi" />

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
                    Bantuan Akses Akun
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#151923] sm:text-4xl">
                    Lupa kata sandi?
                </h1>
                <p className="text-sm text-muted-foreground">
                    Masukkan alamat email akun Anda. Kami akan mengirimkan
                    tautan untuk mengatur ulang kata sandi.
                </p>
            </div>

            {status && (
                <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <div>
                        <p className="font-semibold text-emerald-900">
                            Tautan Berhasil Dikirim
                        </p>
                        <p className="mt-0.5 text-emerald-800">{status}</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <Form
                    {...email.form()}
                    disableWhileProcessing
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-slate-800"
                                >
                                    Alamat Email Terdaftar
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    placeholder="nama@email.com"
                                    required
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

                            <Button
                                type="submit"
                                className="w-full bg-[#0075de] py-6 text-base text-white shadow-sm hover:bg-[#0067c5]"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && <Spinner />}
                                Kirim Tautan Reset Kata Sandi
                            </Button>
                        </>
                    )}
                </Form>

                <div className="border-t border-slate-100 pt-4 text-center text-sm text-muted-foreground">
                    Ingat kata sandi Anda?{' '}
                    <TextLink
                        href={login()}
                        className="font-medium text-[#0075de]"
                    >
                        Masuk ke akun
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: '',
    description: '',
};
