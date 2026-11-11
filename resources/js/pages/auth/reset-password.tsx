import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
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

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-[#151923]">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="mt-1 block w-full text-[#151923] placeholder:text-[#7b8190]"
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
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="text-[#151923]"
                            >
                                Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block w-full text-[#151923] placeholder:text-[#7b8190]"
                                autoFocus
                                placeholder="Masukkan kata sandi baru"
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
                                className="text-[#151923]"
                            >
                                Konfirmasi Kata Sandi
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="mt-1 block w-full text-[#151923] placeholder:text-[#7b8190]"
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
                                className="mt-2"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full bg-[#0075de] text-white hover:bg-[#0067c5]"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Atur Ulang Kata Sandi
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Tautan tidak berlaku?{' '}
                            <TextLink
                                href={request()}
                                className="font-medium text-[#0075de] decoration-[#0075de]"
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
    title: 'Atur Ulang Kata Sandi',
    description: 'Buat kata sandi baru untuk akun Anda.',
};
