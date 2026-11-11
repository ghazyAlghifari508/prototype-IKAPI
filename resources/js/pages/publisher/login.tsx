import { Form, Head, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { request } from '@/routes/password';

type PageProps = {
    errors?: Record<string, string>;
    status?: string;
};

export default function PublisherLoginPage() {
    const { errors, status } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Masuk Portal Penerbit" />

            <div className="mx-auto w-full max-w-xl">
                {status && (
                    <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {status}
                    </div>
                )}

                <Form
                    method="post"
                    action="/publisher/login"
                    className="space-y-5"
                    disableWhileProcessing
                >
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="nama@penerbit.com"
                            required
                            aria-invalid={Boolean(errors.email)}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Kata Sandi</Label>
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

                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="remember"
                            className="flex items-center gap-2 text-sm text-slate-600"
                        >
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                className="size-4 accent-[#0878df]"
                            />
                            Ingat saya
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#0878df] py-6 text-white shadow-sm hover:bg-[#0668c4]"
                    >
                        Masuk Portal Penerbit
                    </Button>
                </Form>

                <p className="mt-6 border-t border-blue-100 pt-5 text-center text-sm text-slate-600">
                    Belum punya akun?{' '}
                    <TextLink
                        href="/publisher/register"
                        className="font-medium text-[#0075de]"
                    >
                        Daftar sebagai Penerbit
                    </TextLink>
                </p>
            </div>
        </>
    );
}

PublisherLoginPage.layout = {
    title: 'Masuk Portal Penerbit',
    description: 'Masuk ke portal penerbit dengan akun yang telah disetujui.',
};
