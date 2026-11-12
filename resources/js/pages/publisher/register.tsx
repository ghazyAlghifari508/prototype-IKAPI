import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, UserRound, Upload } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type PageProps = {
    errors?: Record<string, string>;
};

export default function RegisterPublisherPage() {
    const { errors } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Daftar sebagai Penerbit" />

            <div className="mx-auto w-full px-1 py-2 sm:px-2">
                <div className="w-full">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                        >
                            <ArrowLeft className="size-4" /> Kembali
                        </Link>
                        <div className="flex gap-2">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground"
                            >
                                <UserRound className="size-4" /> Pembeli
                            </Link>
                            <Link
                                href="/publisher/register"
                                aria-current="page"
                                className="inline-flex items-center gap-2 rounded-md border border-[#0075de] bg-[#e6f3fe] px-3 py-2 text-sm font-medium text-[#0075de]"
                            >
                                <BookOpen className="size-4" /> Penerbit
                            </Link>
                        </div>
                    </div>
                    <div className="mb-6 max-w-2xl space-y-2">
                        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                            Mitra penerbit IKAPI
                        </p>
                        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-[#17233b]">
                            Terbitkan lebih
                            <br />
                            luas bersama.
                        </h1>
                        <p className="text-sm text-slate-600">
                            Lengkapi informasi usaha. Tim IKAPI Jabar akan
                            meninjau pendaftaran Anda.
                        </p>
                    </div>

                    <Form
                        method="post"
                        action="/publisher/register"
                        className="space-y-5"
                        encType="multipart/form-data"
                    >
                        {({ processing }) => (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="publisher_name">
                                            Nama Penerbit
                                        </Label>
                                        <Input
                                            id="publisher_name"
                                            name="publisher_name"
                                            type="text"
                                            autoComplete="organization"
                                            placeholder="Nama penerbit"
                                            aria-invalid={Boolean(
                                                errors.publisher_name,
                                            )}
                                        />
                                        <InputError
                                            message={errors.publisher_name}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="responsible_person">
                                            Nama Penanggung Jawab
                                        </Label>
                                        <Input
                                            id="responsible_person"
                                            name="responsible_person"
                                            type="text"
                                            autoComplete="name"
                                            placeholder="Nama PIC"
                                            aria-invalid={Boolean(
                                                errors.responsible_person,
                                            )}
                                        />
                                        <InputError
                                            message={errors.responsible_person}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="legal_number">
                                            Nomor SK / legalitas
                                        </Label>
                                        <Input
                                            id="legal_number"
                                            name="legal_number"
                                            placeholder="Contoh: AHU-001..."
                                            aria-invalid={Boolean(
                                                errors.legal_number,
                                            )}
                                        />
                                        <InputError
                                            message={errors.legal_number}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="penerbit@ikapi.org"
                                            aria-invalid={Boolean(errors.email)}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            Nomor Telepon
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="08xxxxxxxxxx"
                                            aria-invalid={Boolean(errors.phone)}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ikapi_member_number">
                                            Nomor Anggota IKAPI
                                        </Label>
                                        <Input
                                            id="ikapi_member_number"
                                            name="ikapi_member_number"
                                            type="text"
                                            placeholder="No. keanggotaan"
                                            aria-invalid={Boolean(
                                                errors.ikapi_member_number,
                                            )}
                                        />
                                        <InputError
                                            message={errors.ikapi_member_number}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">
                                            Alamat Kantor
                                        </Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            type="text"
                                            autoComplete="street-address"
                                            placeholder="Kota, provinsi"
                                            aria-invalid={Boolean(
                                                errors.address,
                                            )}
                                        />
                                        <InputError message={errors.address} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Kata Sandi
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Minimal 8 karakter"
                                            aria-invalid={Boolean(
                                                errors.password,
                                            )}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Konfirmasi Kata Sandi
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Ulangi kata sandi"
                                            aria-invalid={Boolean(
                                                errors.password_confirmation,
                                            )}
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-sm md:col-span-2">
                                        <Upload className="size-5 text-[#0075de]" />
                                        <span className="flex-1">
                                            <span className="block font-medium">
                                                Dokumen legalitas &amp; bukti
                                                keanggotaan
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                PDF, JPG atau PNG · Maks. 5 MB
                                            </span>
                                        </span>
                                        <input
                                            className="max-w-[180px] text-xs"
                                            type="file"
                                            name="verification_document"
                                            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                            required
                                            aria-invalid={Boolean(
                                                errors.verification_document,
                                            )}
                                        />
                                    </label>
                                    <div className="md:col-span-2">
                                        <InputError
                                            message={
                                                errors.verification_document
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rounded-md bg-emerald-50 px-3 py-3 text-xs text-emerald-800">
                                    Dokumen hanya digunakan untuk verifikasi
                                    akun penerbit.
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#0075de] text-white hover:bg-[#0067c5]"
                                >
                                    {processing && <Spinner />}
                                    Daftar sebagai Penerbit
                                </Button>

                                <p className="text-center text-sm text-slate-600">
                                    Sudah memiliki akun?{' '}
                                    <TextLink
                                        href="/publisher/login"
                                        className="font-medium text-[#0075de]"
                                    >
                                        Masuk portal penerbit
                                    </TextLink>
                                </p>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

RegisterPublisherPage.layout = {
    title: '',
    description: '',
};
