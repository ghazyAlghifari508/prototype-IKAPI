import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Kata Sandi" />

            {status && (
                <div
                    role="status"
                    className="mb-4 text-sm font-medium text-green-700"
                >
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form
                    {...email.form()}
                    disableWhileProcessing
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[#151923]"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    placeholder="nama@email.com"
                                    className="text-[#151923] placeholder:text-[#7b8190]"
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

                            <div className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#0075de] text-white hover:bg-[#0067c5]"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Kirim Tautan Reset
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <TextLink
                        href={login()}
                        className="font-medium text-[#0075de] decoration-[#0075de]"
                    >
                        Kembali ke Login
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi',
    description: 'Masukkan email akun Anda untuk mengatur ulang kata sandi.',
};
