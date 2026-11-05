import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { Building2, Check, PencilLine, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    PageHeading,
    PublisherLayout,
    SectionHeading,
} from '@/prototype/publisher/components';
import {
    maskAccountNumber,
    usePublisherData,
    type BankAccount,
    type PublisherProfile,
} from '@/prototype/publisher/store';

type ProfileDraft = PublisherProfile & BankAccount;
type FieldErrors = Partial<Record<keyof ProfileDraft, string>>;

function draftFrom(profile: PublisherProfile, bank: BankAccount): ProfileDraft {
    return { ...profile, ...bank };
}

export default function PublisherProfileScreen() {
    const [data, update] = usePublisherData();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(() =>
        draftFrom(data.profile, data.bankAccount),
    );
    const [errors, setErrors] = useState<FieldErrors>({});

    useEffect(
        () => setDraft(draftFrom(data.profile, data.bankAccount)),
        [data.profile, data.bankAccount],
    );

    function cancelEditing() {
        setDraft(draftFrom(data.profile, data.bankAccount));
        setErrors({});
        setEditing(false);
    }

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors: FieldErrors = {};
        const required: (keyof ProfileDraft)[] = [
            'publisherName',
            'contactName',
            'email',
            'phone',
            'address',
            'bankName',
            'accountNumber',
            'accountHolder',
        ];
        required.forEach((key) => {
            if (!draft[key].trim()) nextErrors[key] = 'Bagian ini wajib diisi.';
        });
        if (
            draft.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
        )
            nextErrors.email = 'Masukkan alamat email yang valid.';
        if (
            draft.accountNumber.trim() &&
            !/^\d+$/.test(draft.accountNumber.trim())
        )
            nextErrors.accountNumber =
                'Nomor rekening hanya boleh berisi angka.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const profile: PublisherProfile = {
            publisherName: draft.publisherName.trim(),
            contactName: draft.contactName.trim(),
            email: draft.email.trim(),
            phone: draft.phone.trim(),
            address: draft.address.trim(),
            memberId: draft.memberId.trim(),
        };
        const bankAccount: BankAccount = {
            bankName: draft.bankName.trim(),
            accountNumber: draft.accountNumber.trim(),
            accountHolder: draft.accountHolder.trim(),
        };
        update((current) => ({ ...current, profile, bankAccount }));
        setEditing(false);
        toast.success('Profil dan rekening berhasil diperbarui.');
    }

    const bankComplete = Boolean(
        data.bankAccount.bankName &&
        data.bankAccount.accountNumber &&
        data.bankAccount.accountHolder,
    );

    return (
        <>
            <Head title="Profil & rekening penerbit" />
            <PublisherLayout active="profile">
                <PageHeading
                    title="Profil & rekening"
                    description="Pastikan informasi penerbit dan rekening tujuan selalu sesuai."
                    action={
                        !editing ? (
                            <Button
                                className="ikapi-button ikapi-button-secondary"
                                onClick={() => setEditing(true)}
                            >
                                <PencilLine size={16} aria-hidden="true" />
                                Ubah informasi
                            </Button>
                        ) : undefined
                    }
                />
                {!bankComplete ? (
                    <div className="ikapi-alert" role="status">
                        <ShieldCheck size={18} aria-hidden="true" />
                        <p>
                            Rekening bank belum lengkap. Lengkapi informasi
                            sebelum mengajukan pencairan.
                        </p>
                    </div>
                ) : null}

                {editing ? (
                    <form className="ikapi-stack" onSubmit={save} noValidate>
                        <section className="ikapi-panel ikapi-panel-pad">
                            <SectionHeading
                                title="Informasi penerbit"
                                detail="Identitas dan kontak yang tercatat untuk penerbit."
                            />
                            <div className="ikapi-form-grid">
                                <Field
                                    label="Nama penerbit"
                                    id="publisherName"
                                    value={draft.publisherName}
                                    error={errors.publisherName}
                                    onChange={(value) =>
                                        setDraft({
                                            ...draft,
                                            publisherName: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Penanggung jawab"
                                    id="contactName"
                                    value={draft.contactName}
                                    error={errors.contactName}
                                    onChange={(value) =>
                                        setDraft({
                                            ...draft,
                                            contactName: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Email kontak"
                                    id="email"
                                    type="email"
                                    value={draft.email}
                                    error={errors.email}
                                    onChange={(value) =>
                                        setDraft({ ...draft, email: value })
                                    }
                                />
                                <Field
                                    label="Nomor telepon"
                                    id="phone"
                                    type="tel"
                                    value={draft.phone}
                                    error={errors.phone}
                                    onChange={(value) =>
                                        setDraft({ ...draft, phone: value })
                                    }
                                />
                                <div className="ikapi-field ikapi-field-full">
                                    <label htmlFor="address">Alamat</label>
                                    <textarea
                                        id="address"
                                        value={draft.address}
                                        aria-invalid={Boolean(errors.address)}
                                        aria-describedby={
                                            errors.address
                                                ? 'address-error'
                                                : undefined
                                        }
                                        onChange={(event) =>
                                            setDraft({
                                                ...draft,
                                                address: event.target.value,
                                            })
                                        }
                                    />
                                    {errors.address ? (
                                        <span
                                            className="ikapi-field-error"
                                            id="address-error"
                                        >
                                            {errors.address}
                                        </span>
                                    ) : null}
                                </div>
                                <Field
                                    label="Nomor anggota IKAPI"
                                    id="memberId"
                                    value={draft.memberId}
                                    error={errors.memberId}
                                    onChange={(value) =>
                                        setDraft({ ...draft, memberId: value })
                                    }
                                    help="Isi bila nomor anggota tersedia."
                                    required={false}
                                />
                            </div>
                        </section>
                        <section className="ikapi-panel ikapi-panel-pad">
                            <SectionHeading
                                title="Rekening bank"
                                detail="Informasi ini menjadi tujuan saat Anda mengajukan pencairan."
                            />
                            <div className="ikapi-form-grid">
                                <Field
                                    label="Nama bank"
                                    id="bankName"
                                    value={draft.bankName}
                                    error={errors.bankName}
                                    onChange={(value) =>
                                        setDraft({ ...draft, bankName: value })
                                    }
                                />
                                <Field
                                    label="Nama pemilik rekening"
                                    id="accountHolder"
                                    value={draft.accountHolder}
                                    error={errors.accountHolder}
                                    onChange={(value) =>
                                        setDraft({
                                            ...draft,
                                            accountHolder: value,
                                        })
                                    }
                                />
                                <Field
                                    label="Nomor rekening"
                                    id="accountNumber"
                                    value={draft.accountNumber}
                                    error={errors.accountNumber}
                                    onChange={(value) =>
                                        setDraft({
                                            ...draft,
                                            accountNumber: value.replace(
                                                /\s/g,
                                                '',
                                            ),
                                        })
                                    }
                                    help="Masukkan nomor rekening tanpa spasi atau tanda baca."
                                />
                            </div>
                            <div className="ikapi-bank-privacy">
                                <ShieldCheck size={17} aria-hidden="true" />
                                <span>
                                    Nomor rekening ditampilkan sebagian saat
                                    informasi ini tidak sedang diubah.
                                </span>
                            </div>
                            <div className="ikapi-form-actions">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="ikapi-button ikapi-button-secondary"
                                    onClick={cancelEditing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="ikapi-button ikapi-button-primary"
                                >
                                    <Check size={16} aria-hidden="true" />
                                    Simpan pengaturan
                                </Button>
                            </div>
                        </section>
                    </form>
                ) : (
                    <div className="ikapi-stack">
                        <section className="ikapi-panel ikapi-panel-pad">
                            <SectionHeading
                                title="Informasi penerbit"
                                detail="Identitas dan kontak penerbit."
                            />
                            <dl className="ikapi-definition-grid">
                                <Info
                                    label="Nama penerbit"
                                    value={data.profile.publisherName}
                                    icon={
                                        <Building2
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    }
                                />
                                <Info
                                    label="Penanggung jawab"
                                    value={data.profile.contactName}
                                />
                                <Info
                                    label="Email kontak"
                                    value={data.profile.email}
                                />
                                <Info
                                    label="Nomor telepon"
                                    value={data.profile.phone}
                                />
                                <Info
                                    label="Alamat"
                                    value={data.profile.address}
                                    wide
                                />
                                {data.profile.memberId ? (
                                    <Info
                                        label="Nomor anggota IKAPI"
                                        value={data.profile.memberId}
                                    />
                                ) : null}
                            </dl>
                        </section>
                        <section className="ikapi-panel ikapi-panel-pad">
                            <SectionHeading
                                title="Rekening bank"
                                detail="Rekening tujuan untuk pengajuan pencairan."
                            />
                            {bankComplete ? (
                                <dl className="ikapi-definition-grid ikapi-bank-summary">
                                    <Info
                                        label="Nama bank"
                                        value={data.bankAccount.bankName}
                                    />
                                    <Info
                                        label="Nama pemilik rekening"
                                        value={data.bankAccount.accountHolder}
                                    />
                                    <Info
                                        label="Nomor rekening"
                                        value={maskAccountNumber(
                                            data.bankAccount.accountNumber,
                                        )}
                                        wide
                                    />
                                </dl>
                            ) : (
                                <div className="ikapi-empty-state">
                                    <span className="ikapi-empty-icon">
                                        <Building2 size={20} />
                                    </span>
                                    <h3>Rekening belum lengkap</h3>
                                    <p>
                                        Lengkapi bank, nomor rekening, dan nama
                                        pemilik agar informasi tujuan pencairan
                                        tersedia.
                                    </p>
                                    <div className="ikapi-empty-action">
                                        <Button
                                            className="ikapi-button ikapi-button-primary"
                                            onClick={() => setEditing(true)}
                                        >
                                            Lengkapi rekening
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </section>
                        <div className="ikapi-inline-note">
                            <ShieldCheck size={17} aria-hidden="true" />
                            <span>
                                Perubahan tersimpan sebagai data profil penerbit
                                pada perangkat ini.
                            </span>
                        </div>
                    </div>
                )}
            </PublisherLayout>
        </>
    );
}

function Field({
    label,
    id,
    value,
    error,
    onChange,
    help,
    type = 'text',
    required = true,
}: {
    label: string;
    id: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    help?: string;
    type?: 'text' | 'email' | 'tel';
    required?: boolean;
}) {
    return (
        <div className="ikapi-field">
            <label htmlFor={id}>
                {label}
                {required ? <span aria-hidden="true"> *</span> : null}
            </label>
            <Input
                id={id}
                type={type}
                value={value}
                aria-invalid={Boolean(error)}
                aria-describedby={
                    error ? id + '-error' : help ? id + '-help' : undefined
                }
                onChange={(event) => onChange(event.target.value)}
            />
            {error ? (
                <span className="ikapi-field-error" id={id + '-error'}>
                    {error}
                </span>
            ) : help ? (
                <span className="ikapi-field-help" id={id + '-help'}>
                    {help}
                </span>
            ) : null}
        </div>
    );
}

function Info({
    label,
    value,
    icon,
    wide = false,
}: {
    label: string;
    value: string;
    icon?: ReactNode;
    wide?: boolean;
}) {
    return (
        <div
            className={
                wide ? 'ikapi-definition ikapi-field-full' : 'ikapi-definition'
            }
        >
            <dt>
                {icon}
                {label}
            </dt>
            <dd>{value}</dd>
        </div>
    );
}
