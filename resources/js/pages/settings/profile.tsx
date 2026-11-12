import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Camera,
    CheckCircle2,
    KeyRound,
    UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import {
    avatarPresetEmoji,
    avatarPresets,
    type AvatarPresetKey,
} from '@/lib/avatar-presets';
import { edit } from '@/routes/profile';
import { logout } from '@/routes';
import type { AuthenticatedAuth } from '@/types';
import { send } from '@/routes/verification';

type PageProps = {
    auth: AuthenticatedAuth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const [isEditing, setIsEditing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        auth.user.avatar_url,
    );
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const [selectedPreset, setSelectedPreset] =
        useState<AvatarPresetKey | null>(auth.user.avatar_preset);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initials = useInitials();
    const nameParts = auth.user.name.trim().split(/\s+/);
    const activePreset = isEditing ? selectedPreset : auth.user.avatar_preset;

    useEffect(() => {
        if (!selectedAvatar) {
            setPreviewUrl(auth.user.avatar_url);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedAvatar);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedAvatar, auth.user.avatar_url]);

    const userInitials = initials(auth.user.name || 'U');

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedAvatar(null);
        setSelectedPreset(auth.user.avatar_preset);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setPreviewUrl(auth.user.avatar_url);
    };

    return (
        <>
            <Head title="Profil Saya" />

            <div className="space-y-6 rounded-2xl border border-[#dce8f7] bg-white p-5 text-[#17233b] shadow-[0_18px_60px_-44px_rgba(17,72,133,0.45)] [--background:#ffffff] [--border:#dbe5f2] [--card-foreground:#17233b] [--card:#ffffff] [--foreground:#17233b] [--input:#dbe5f2] [--muted-foreground:#64748b] [--muted:#f1f6fc] [--primary-foreground:#ffffff] [--primary:#0878df] [--ring:#0878df] sm:p-8">
                <header className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                            Akun pembaca
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Profil saya.
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola informasi dan preferensi akun Anda.
                        </p>
                    </div>
                    <Link
                        href={logout()}
                        as="button"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#d6e4f4] bg-white px-3 py-2 text-sm font-medium text-[#35506f] hover:bg-[#f3f8ff] focus-visible:ring-2 focus-visible:ring-[#0878df]"
                    >
                        Keluar <ArrowRight className="size-4" />
                    </Link>
                </header>

                <nav
                    aria-label="Pengaturan akun"
                    className="flex gap-2 border-b border-[#dce8f7]"
                >
                    <Link
                        href={edit()}
                        aria-current="page"
                        className="inline-flex items-center gap-2 border-b-2 border-[#0075de] px-3 py-3 text-sm font-medium text-[#0075de]"
                    >
                        <UserRound className="size-4" /> Informasi diri
                    </Link>
                    <Link
                        href="/settings/security"
                        className="inline-flex items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <KeyRound className="size-4" /> Keamanan
                    </Link>
                </nav>

                {status && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                    >
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                        <span>
                            {status === 'verification-link-sent'
                                ? 'Tautan verifikasi baru telah dikirim ke alamat email Anda.'
                                : status}
                        </span>
                    </div>
                )}

                {!isEditing ? (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:px-5">
                            <div className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-full bg-[#e6f2ff] sm:w-[42%] sm:flex-none">
                                <Avatar className="size-14 shrink-0 rounded-full border-0 bg-transparent">
                                    {previewUrl ? (
                                        <AvatarImage
                                            src={previewUrl}
                                            alt={auth.user.name}
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-[#d8eaff] text-xl font-medium text-[#0878df]">
                                        {avatarPresetEmoji(
                                            auth.user.avatar_preset,
                                        ) ?? userInitials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-semibold text-foreground">
                                    {auth.user.name}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {auth.user.email}
                                </p>
                            </div>
                            <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium tracking-wide text-emerald-700">
                                {auth.user.email_verified_at
                                    ? 'EMAIL TERVERIFIKASI'
                                    : 'EMAIL BELUM TERVERIFIKASI'}
                            </span>
                        </div>

                        <section className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold text-foreground">
                                        Informasi pribadi
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Detail ini membantu kami mengenal Anda.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="shrink-0 text-[#0075de]"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit profil
                                </Button>
                            </div>

                            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Nama depan
                                    </dt>
                                    <dd className="rounded-lg border border-[#dce8f7] bg-[#f7faff] px-3 py-2.5 text-sm text-[#26364d]">
                                        {nameParts[0]}
                                    </dd>
                                </div>
                                <div className="space-y-1">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Nama belakang
                                    </dt>
                                    <dd className="rounded-lg border border-[#dce8f7] bg-[#f7faff] px-3 py-2.5 text-sm text-[#26364d]">
                                        {nameParts.slice(1).join(' ') || '—'}
                                    </dd>
                                </div>
                                <div className="space-y-1">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Alamat email
                                    </dt>
                                    <dd className="rounded-lg border border-[#dce8f7] bg-[#f7faff] px-3 py-2.5 text-sm break-all text-[#26364d]">
                                        {auth.user.email}
                                    </dd>
                                    <p className="text-xs text-muted-foreground">
                                        Email adalah identitas akun dan dapat
                                        diubah dengan verifikasi ulang.
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Nomor telepon
                                    </dt>
                                    <dd className="rounded-lg border border-[#dce8f7] bg-[#f7faff] px-3 py-2.5 text-sm text-[#26364d]">
                                        {auth.user.phone || 'Belum diisi'}
                                    </dd>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Alamat lengkap
                                    </dt>
                                    <dd className="min-h-14 rounded-lg border border-[#dce8f7] bg-[#f7faff] px-3 py-2.5 text-sm whitespace-pre-wrap text-[#26364d]">
                                        {auth.user.address || 'Belum diisi'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <div className="border-t pt-4 text-xs text-muted-foreground">
                            Informasi profil hanya digunakan untuk pengalaman
                            membaca IKAPI Jawa Barat.
                        </div>
                    </div>
                ) : (
                    <Form
                        {...ProfileController.update.form()}
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
                        options={{
                            preserveScroll: true,
                        }}
                        onSuccess={() => {
                            setIsEditing(false);
                            setSelectedAvatar(null);
                        }}
                        className="space-y-6"
                        encType="multipart/form-data"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="avatar_preset"
                                    value={selectedPreset ?? ''}
                                    readOnly
                                />

                                <div className="flex flex-col gap-5 rounded-lg border p-5 sm:flex-row sm:items-start">
                                    <Avatar className="size-16 shrink-0 rounded-full border">
                                        {!activePreset && previewUrl ? (
                                            <AvatarImage
                                                src={previewUrl}
                                                alt={auth.user.name}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-neutral-200 text-xl font-medium text-black dark:bg-neutral-700 dark:text-white">
                                            {avatarPresetEmoji(activePreset) ??
                                                userInitials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1 space-y-4">
                                        <div>
                                            <h2 className="font-semibold text-foreground">
                                                Foto profil
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Pilih karakter yang mewakili
                                                Anda.
                                            </p>
                                        </div>

                                        <div
                                            aria-label="Pilih avatar"
                                            className="grid grid-cols-4 gap-2 sm:grid-cols-8"
                                        >
                                            {avatarPresets.map((preset) => (
                                                <button
                                                    key={preset.key}
                                                    type="button"
                                                    aria-label={`Pilih avatar ${preset.label}`}
                                                    aria-pressed={
                                                        selectedPreset ===
                                                        preset.key
                                                    }
                                                    title={preset.label}
                                                    onClick={() => {
                                                        setSelectedPreset(
                                                            preset.key,
                                                        );
                                                        setSelectedAvatar(null);
                                                        if (
                                                            fileInputRef.current
                                                        ) {
                                                            fileInputRef.current.value =
                                                                '';
                                                        }
                                                    }}
                                                    className={`flex aspect-[4/3] min-w-0 items-center justify-center rounded-xl border text-2xl transition-colors focus-visible:ring-2 focus-visible:ring-[#0878df] ${selectedPreset === preset.key ? 'border-[#0878df] bg-[#e6f3fe]' : 'border-transparent bg-[#f3f7fc] hover:border-[#c9d9ee]'}`}
                                                >
                                                    <span aria-hidden="true">
                                                        {preset.emoji}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0075de] hover:underline">
                                                <input
                                                    ref={fileInputRef}
                                                    id="avatar"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    name="avatar"
                                                    className="sr-only"
                                                    onChange={(event) => {
                                                        const file =
                                                            event.target
                                                                .files?.[0] ??
                                                            null;
                                                        setSelectedAvatar(file);
                                                        if (file) {
                                                            setSelectedPreset(
                                                                null,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Camera className="size-4" />
                                                Unggah foto sendiri
                                            </label>
                                            <span className="text-xs text-muted-foreground">
                                                PNG, JPG, WebP · Maks. 2 MB
                                            </span>
                                        </div>
                                        <InputError message={errors.avatar} />
                                        <InputError
                                            message={errors.avatar_preset}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2 md:col-span-1">
                                        <Label htmlFor="first_name">
                                            Nama depan
                                        </Label>
                                        <Input
                                            id="first_name"
                                            defaultValue={nameParts[0]}
                                            name="first_name"
                                            required
                                            autoComplete="given-name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2 md:col-span-1">
                                        <Label htmlFor="last_name">
                                            Nama belakang
                                        </Label>
                                        <Input
                                            id="last_name"
                                            defaultValue={nameParts
                                                .slice(1)
                                                .join(' ')}
                                            name="last_name"
                                            autoComplete="family-name"
                                        />
                                    </div>

                                    <div className="grid gap-2 md:col-span-1">
                                        <Label htmlFor="email">
                                            Alamat email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2 md:col-span-1">
                                        <Label htmlFor="phone">
                                            Nomor telepon
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            defaultValue={auth.user.phone ?? ''}
                                            autoComplete="tel"
                                            inputMode="tel"
                                            placeholder="08xx xxxx xxxx"
                                            aria-invalid={Boolean(errors.phone)}
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="address">
                                            Alamat lengkap
                                        </Label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            defaultValue={
                                                auth.user.address ?? ''
                                            }
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Masukkan alamat lengkap Anda"
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Alamat email belum diverifikasi.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Kirim ulang email
                                                    verifikasi.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Tautan verifikasi baru telah
                                                    dikirim ke alamat email
                                                    Anda.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#0878df] text-white hover:bg-[#0668c4]"
                                        data-test="update-profile-button"
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
