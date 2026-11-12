import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    Eye,
    EyeOff,
    Landmark,
    Pencil,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

type Profile = {
    publisher_name: string;
    responsible_person: string;
    email: string;
    phone: string;
    address: string;
    ikapi_member_number: string;
};

type BankAccount = {
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_number_masked: string;
    account_holder: string;
};

type FormData = Profile & {
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_holder: string;
};

type PageProps = {
    profile: Profile;
    bankAccount: BankAccount | null;
    flash?: { status?: string | null };
};

const banks = [
    ['BCA', 'Bank Central Asia'],
    ['BRI', 'Bank Rakyat Indonesia'],
    ['BNI', 'Bank Negara Indonesia'],
    ['MANDIRI', 'Bank Mandiri'],
    ['BSI', 'Bank Syariah Indonesia'],
];

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-xs text-[#b42318]">{message}</p> : null;
}

export default function PublisherSettings() {
    const { profile, bankAccount, flash } = usePage<PageProps>().props;
    const [editing, setEditing] = useState(false);
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const form = useForm<FormData>({
        ...profile,
        bank_code: bankAccount?.bank_code ?? '',
        bank_name: bankAccount?.bank_name ?? '',
        account_number: bankAccount?.account_number ?? '',
        account_holder: bankAccount?.account_holder ?? '',
    });

    const updateField = <K extends keyof FormData>(
        field: K,
        value: FormData[K],
    ) => {
        form.setData((data) => ({ ...data, [field]: value }));
    };

    const cancel = () => {
        form.reset();
        form.clearErrors();
        setShowAccountNumber(false);
        setEditing(false);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put('/publisher/settings', {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(false);
                setShowAccountNumber(false);
            },
        });
    };

    return (
        <>
            <Head title="Profil & Rekening Penerbit" />

            <div className="space-y-8">
                <header className="flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-[#0075de] uppercase">
                            Akun penerbit
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
                            Profil & rekening
                        </h1>
                        <p className="mt-2 max-w-2xl text-base leading-7 text-[#615d59]">
                            Pastikan informasi penerbit dan rekening tujuan
                            pencairan selalu sesuai.
                        </p>
                    </div>
                    {!editing ? (
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0075de] px-4 text-sm font-medium text-white transition hover:bg-[#0066c2] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                            <Pencil className="size-4" aria-hidden="true" />
                            Edit informasi
                        </button>
                    ) : null}
                </header>

                {flash?.status ? (
                    <div
                        role="status"
                        className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                    >
                        <Check className="size-4" aria-hidden="true" />
                        {flash.status}
                    </div>
                ) : null}

                {editing ? (
                    <form onSubmit={submit} className="space-y-8" noValidate>
                        <ProfileFields form={form} updateField={updateField} />
                        <BankFields
                            form={form}
                            updateField={updateField}
                            showAccountNumber={showAccountNumber}
                            setShowAccountNumber={setShowAccountNumber}
                        />
                        <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={cancel}
                                className="min-h-11 rounded-lg border border-black/15 px-4 text-sm font-medium text-[#615d59] transition hover:border-black/30 hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="min-h-11 rounded-lg bg-[#0075de] px-4 text-sm font-medium text-white transition hover:bg-[#0066c2] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {form.processing
                                    ? 'Menyimpan…'
                                    : 'Simpan perubahan'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <section
                            className="border border-black/10 bg-white p-5 sm:p-6"
                            aria-labelledby="profile-heading"
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-[#e6f3fe] text-[#0075de]">
                                    <ShieldCheck
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <h2
                                        id="profile-heading"
                                        className="text-lg font-semibold"
                                    >
                                        Informasi instansi
                                    </h2>
                                    <p className="mt-1 text-sm text-[#757575]">
                                        Data yang berasal dari pendaftaran
                                        penerbit.
                                    </p>
                                </div>
                            </div>
                            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                                <ReadOnlyField
                                    label="Nama penerbit"
                                    value={profile.publisher_name}
                                />
                                <ReadOnlyField
                                    label="Penanggung jawab"
                                    value={profile.responsible_person}
                                />
                                <ReadOnlyField
                                    label="Email kontak"
                                    value={profile.email}
                                />
                                <ReadOnlyField
                                    label="Nomor telepon"
                                    value={profile.phone}
                                />
                                <ReadOnlyField
                                    label="Nomor anggota IKAPI"
                                    value={profile.ikapi_member_number}
                                />
                                <ReadOnlyField
                                    label="Alamat"
                                    value={profile.address}
                                    wide
                                />
                            </dl>
                        </section>

                        <section
                            className="border border-black/10 bg-white p-5 sm:p-6"
                            aria-labelledby="bank-heading"
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-[#ffb110] text-[#111111]">
                                    <Landmark
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <h2
                                        id="bank-heading"
                                        className="text-lg font-semibold"
                                    >
                                        Rekening pencairan
                                    </h2>
                                    <p className="mt-1 text-sm text-[#757575]">
                                        Digunakan saat proses pencairan dana.
                                    </p>
                                </div>
                            </div>
                            {bankAccount ? (
                                <dl className="mt-6 space-y-5">
                                    <ReadOnlyField
                                        label="Bank"
                                        value={`${bankAccount.bank_name} (${bankAccount.bank_code})`}
                                    />
                                    <div className="space-y-1">
                                        <dt className="text-xs font-medium text-[#757575]">
                                            Nomor rekening
                                        </dt>
                                        <dd className="flex items-center gap-2 text-sm font-medium tracking-wide text-[#111111]">
                                            <span>
                                                {showAccountNumber
                                                    ? bankAccount.account_number
                                                    : bankAccount.account_number_masked}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowAccountNumber(
                                                        (value) => !value,
                                                    )
                                                }
                                                aria-label={
                                                    showAccountNumber
                                                        ? 'Sembunyikan nomor rekening'
                                                        : 'Tampilkan nomor rekening'
                                                }
                                                className="inline-flex size-11 items-center justify-center rounded-lg text-[#0075de] hover:bg-[#e6f3fe] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                                            >
                                                {showAccountNumber ? (
                                                    <EyeOff
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <Eye
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </button>
                                        </dd>
                                    </div>
                                    <ReadOnlyField
                                        label="Nama pemilik rekening"
                                        value={bankAccount.account_holder}
                                    />
                                </dl>
                            ) : (
                                <div className="mt-6 border border-dashed border-black/15 bg-[#f6f5f4] px-5 py-7">
                                    <p className="font-medium text-[#111111]">
                                        Belum ada rekening tersimpan
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#615d59]">
                                        Tambahkan rekening saat Anda siap
                                        menerima pencairan dana.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setEditing(true)}
                                        className="mt-4 text-sm font-medium text-[#0075de] hover:underline focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                                    >
                                        Tambah rekening
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}

function ReadOnlyField({
    label,
    value,
    wide = false,
}: {
    label: string;
    value: string | null;
    wide?: boolean;
}) {
    return (
        <div className={wide ? 'space-y-1 sm:col-span-2' : 'space-y-1'}>
            <dt className="text-xs font-medium text-[#757575]">{label}</dt>
            <dd className="min-h-11 rounded-lg border border-black/10 bg-[#f6f5f4] px-3 py-2.5 text-sm leading-6 whitespace-pre-wrap text-[#111111]">
                {value || 'Belum diisi'}
            </dd>
        </div>
    );
}

function ProfileFields({
    form,
    updateField,
}: {
    form: ReturnType<typeof useForm<FormData>>;
    updateField: <K extends keyof FormData>(
        field: K,
        value: FormData[K],
    ) => void;
}) {
    return (
        <section
            className="border border-black/10 bg-white p-5 sm:p-6"
            aria-labelledby="edit-profile-heading"
        >
            <h2 id="edit-profile-heading" className="text-lg font-semibold">
                Informasi instansi
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <LabeledInput
                    label="Nama penerbit"
                    name="publisher_name"
                    value={form.data.publisher_name}
                    onChange={(value) => updateField('publisher_name', value)}
                    error={form.errors.publisher_name}
                />
                <LabeledInput
                    label="Penanggung jawab"
                    name="responsible_person"
                    value={form.data.responsible_person}
                    onChange={(value) =>
                        updateField('responsible_person', value)
                    }
                    error={form.errors.responsible_person}
                />
                <LabeledInput
                    label="Email kontak"
                    name="email"
                    value={form.data.email}
                    disabled
                    hint="Email akun tidak diubah dari halaman ini."
                />
                <LabeledInput
                    label="Nomor telepon"
                    name="phone"
                    value={form.data.phone}
                    onChange={(value) => updateField('phone', value)}
                    error={form.errors.phone}
                />
                <LabeledInput
                    label="Nomor anggota IKAPI"
                    name="ikapi_member_number"
                    value={form.data.ikapi_member_number}
                    onChange={(value) =>
                        updateField('ikapi_member_number', value)
                    }
                    error={form.errors.ikapi_member_number}
                />
                <LabeledInput
                    label="Alamat"
                    name="address"
                    value={form.data.address}
                    onChange={(value) => updateField('address', value)}
                    error={form.errors.address}
                    textarea
                />
            </div>
        </section>
    );
}

function BankFields({
    form,
    updateField,
    showAccountNumber,
    setShowAccountNumber,
}: {
    form: ReturnType<typeof useForm<FormData>>;
    updateField: <K extends keyof FormData>(
        field: K,
        value: FormData[K],
    ) => void;
    showAccountNumber: boolean;
    setShowAccountNumber: (value: boolean) => void;
}) {
    return (
        <section
            className="border border-black/10 bg-white p-5 sm:p-6"
            aria-labelledby="edit-bank-heading"
        >
            <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-[#ffb110] text-[#111111]">
                    <Landmark className="size-5" aria-hidden="true" />
                </span>
                <div>
                    <h2
                        id="edit-bank-heading"
                        className="text-lg font-semibold"
                    >
                        Rekening pencairan
                    </h2>
                    <p className="mt-1 text-sm text-[#757575]">
                        Nomor rekening disimpan secara aman dan tidak
                        diverifikasi oleh bank dari halaman ini.
                    </p>
                </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="bank_code" className="text-sm font-medium">
                        Bank
                    </label>
                    <select
                        id="bank_code"
                        value={form.data.bank_code}
                        onChange={(event) => {
                            const selected = banks.find(
                                ([code]) => code === event.target.value,
                            );
                            updateField('bank_code', event.target.value);
                            updateField('bank_name', selected?.[1] ?? '');
                        }}
                        className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                    >
                        <option value="">Pilih bank</option>
                        {banks.map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <FieldError message={form.errors.bank_code} />
                </div>
                <LabeledInput
                    label="Nama pemilik rekening"
                    name="account_holder"
                    value={form.data.account_holder}
                    onChange={(value) => updateField('account_holder', value)}
                    error={form.errors.account_holder}
                />
                <div className="space-y-2 sm:col-span-2">
                    <label
                        htmlFor="account_number"
                        className="text-sm font-medium"
                    >
                        Nomor rekening
                    </label>
                    <div className="relative">
                        <input
                            id="account_number"
                            type={showAccountNumber ? 'text' : 'password'}
                            inputMode="numeric"
                            autoComplete="off"
                            value={form.data.account_number}
                            onChange={(event) =>
                                updateField(
                                    'account_number',
                                    event.target.value,
                                )
                            }
                            className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 pr-12 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe]"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowAccountNumber(!showAccountNumber)
                            }
                            aria-label={
                                showAccountNumber
                                    ? 'Sembunyikan nomor rekening'
                                    : 'Tampilkan nomor rekening'
                            }
                            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[#0075de] focus-visible:ring-2 focus-visible:ring-[#0075de] focus-visible:outline-none"
                        >
                            {showAccountNumber ? (
                                <EyeOff className="size-4" aria-hidden="true" />
                            ) : (
                                <Eye className="size-4" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    <FieldError message={form.errors.account_number} />
                </div>
            </div>
        </section>
    );
}

function LabeledInput({
    label,
    name,
    value,
    onChange,
    error,
    disabled = false,
    hint,
    textarea = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange?: (value: string) => void;
    error?: string;
    disabled?: boolean;
    hint?: string;
    textarea?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
            {textarea ? (
                <textarea
                    id={name}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                    disabled={disabled}
                    rows={4}
                    className="w-full resize-y rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe] disabled:bg-[#f6f5f4]"
                />
            ) : (
                <input
                    id={name}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                    disabled={disabled}
                    className="min-h-11 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#0075de] focus:ring-2 focus:ring-[#e6f3fe] disabled:bg-[#f6f5f4]"
                />
            )}
            {hint ? <p className="text-xs text-[#757575]">{hint}</p> : null}
            <FieldError message={error} />
        </div>
    );
}
