import { useState, type FormEvent } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Banknote, CircleAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Currency,
    EmptyState,
    PageHeading,
    PublisherLayout,
    SectionHeading,
    StatusBadge,
} from '@/prototype/publisher/components';
import {
    formatDateTime,
    maskAccountNumber,
    usePublisherData,
    type PayoutRecord,
} from '@/prototype/publisher/store';

export default function PublisherPayouts() {
    const [data, update] = usePublisherData();
    const [amount, setAmount] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        const value = Number(amount);
        if (
            !data.bankAccount.bankName ||
            !data.bankAccount.accountNumber ||
            !data.bankAccount.accountHolder
        ) {
            setError(
                'Rekening bank belum terdaftar lengkap. Lengkapi informasi di profil penerbit.',
            );
            return;
        }
        if (!Number.isFinite(value) || value <= 0) {
            setError('Masukkan nominal pencairan lebih dari Rp0.');
            return;
        }
        if (value > data.metrics.availableBalance) {
            setError('Nominal melebihi saldo tersedia.');
            return;
        }
        if (!confirmed) {
            setError(
                'Konfirmasikan kembali rekening tujuan sebelum mengajukan.',
            );
            return;
        }
        setSubmitting(true);
        const now = new Date();
        const record: PayoutRecord = {
            id:
                'PY-' +
                now.getFullYear() +
                '-' +
                String(now.getTime()).slice(-4),
            date: now.toISOString(),
            amount: value,
            status: 'Dalam Proses',
            account: { ...data.bankAccount },
        };
        update((current) => ({
            ...current,
            metrics: {
                ...current.metrics,
                availableBalance: current.metrics.availableBalance - value,
                processingBalance: current.metrics.processingBalance + value,
            },
            payouts: [record, ...current.payouts],
        }));
        setAmount('');
        setConfirmed(false);
        setError('');
        setSubmitting(false);
        toast.success('Pengajuan pencairan berhasil dikirim.');
    }

    const sortedPayouts = [...data.payouts].sort((a, b) =>
        b.date.localeCompare(a.date),
    );
    const accountComplete = Boolean(
        data.bankAccount.bankName &&
        data.bankAccount.accountNumber &&
        data.bankAccount.accountHolder,
    );

    return (
        <>
            <Head title="Pendapatan & pencairan" />
            <PublisherLayout active="payouts">
                <PageHeading
                    title="Pendapatan & pencairan"
                    description="Tinjau saldo penerbit dan ajukan transfer ke rekening yang terdaftar."
                />
                <section
                    className="ikapi-summary-strip ikapi-payout-summary"
                    aria-label="Ringkasan pendapatan"
                >
                    <div className="ikapi-summary-item">
                        <span>Pendapatan bersih</span>
                        <strong>
                            <Currency value={data.metrics.netEarnings} />
                        </strong>
                        <small>Dari penjualan buku</small>
                    </div>
                    <div className="ikapi-summary-item">
                        <span>Saldo tersedia</span>
                        <strong>
                            <Currency value={data.metrics.availableBalance} />
                        </strong>
                        <small>Dapat diajukan</small>
                    </div>
                    <div className="ikapi-summary-item">
                        <span>Dalam proses</span>
                        <strong>
                            <Currency value={data.metrics.processingBalance} />
                        </strong>
                        <small>Menunggu penyelesaian</small>
                    </div>
                </section>
                <div className="ikapi-grid ikapi-grid-2 ikapi-payout-main">
                    <section className="ikapi-panel ikapi-panel-pad">
                        <SectionHeading
                            title="Ajukan pencairan"
                            detail="Saldo akan dicadangkan setelah pengajuan berhasil."
                        />
                        <div className="ikapi-payout-bank">
                            <span className="ikapi-payout-bank-icon">
                                <Banknote size={19} aria-hidden="true" />
                            </span>
                            <div>
                                <small>Rekening tujuan</small>
                                <strong>
                                    {accountComplete
                                        ? data.bankAccount.bankName +
                                          ' · ' +
                                          maskAccountNumber(
                                              data.bankAccount.accountNumber,
                                          )
                                        : 'Belum lengkap'}
                                </strong>
                                <span>
                                    {accountComplete
                                        ? data.bankAccount.accountHolder
                                        : 'Lengkapi informasi rekening terlebih dahulu'}
                                </span>
                            </div>
                            <Link
                                href="/prototype/penerbit/profil"
                                className="ikapi-inline-link"
                            >
                                Ubah
                            </Link>
                        </div>
                        {!accountComplete ? (
                            <div className="ikapi-alert" role="status">
                                <CircleAlert size={17} aria-hidden="true" />
                                <p>
                                    Rekening bank belum terdaftar lengkap.{' '}
                                    <Link href="/prototype/penerbit/profil">
                                        Lengkapi di profil penerbit.
                                    </Link>
                                </p>
                            </div>
                        ) : null}
                        <form
                            className="ikapi-payout-form"
                            onSubmit={submit}
                            noValidate
                        >
                            <div className="ikapi-field">
                                <label htmlFor="payout-amount">
                                    Nominal pencairan
                                </label>
                                <div className="ikapi-money-input">
                                    <span>Rp</span>
                                    <Input
                                        id="payout-amount"
                                        type="number"
                                        min="1"
                                        max={data.metrics.availableBalance}
                                        inputMode="numeric"
                                        value={amount}
                                        aria-invalid={Boolean(error)}
                                        aria-describedby={
                                            error
                                                ? 'payout-error'
                                                : 'payout-help'
                                        }
                                        onChange={(event) => {
                                            setAmount(event.target.value);
                                            setError('');
                                        }}
                                        placeholder="0"
                                    />
                                </div>
                                <span
                                    className="ikapi-field-help"
                                    id="payout-help"
                                >
                                    Saldo tersedia{' '}
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        maximumFractionDigits: 0,
                                    }).format(data.metrics.availableBalance)}
                                    .
                                </span>
                            </div>
                            <label className="ikapi-confirm-account">
                                <input
                                    type="checkbox"
                                    checked={confirmed}
                                    onChange={(event) => {
                                        setConfirmed(event.target.checked);
                                        setError('');
                                    }}
                                />
                                <span>Data rekening tujuan sudah benar.</span>
                            </label>
                            {error ? (
                                <p
                                    className="ikapi-field-error"
                                    id="payout-error"
                                    role="alert"
                                >
                                    {error}
                                </p>
                            ) : null}
                            <Button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !accountComplete ||
                                    data.metrics.availableBalance <= 0
                                }
                                className="ikapi-button ikapi-button-primary"
                            >
                                {submitting
                                    ? 'Mengirim pengajuan…'
                                    : 'Ajukan pencairan'}{' '}
                                <ArrowRight size={16} aria-hidden="true" />
                            </Button>
                        </form>
                        <div className="ikapi-inline-note ikapi-payout-note">
                            <ShieldCheck size={17} aria-hidden="true" />
                            <span>
                                Pengajuan masuk ke proses transfer manual. Lama
                                proses belum ditetapkan.
                            </span>
                        </div>
                    </section>
                    <section className="ikapi-panel ikapi-panel-pad">
                        <SectionHeading
                            title="Riwayat pencairan"
                            detail="Status dan rincian setiap pengajuan."
                        />
                        {sortedPayouts.length ? (
                            <div className="ikapi-record-list">
                                {sortedPayouts.map((payout) => (
                                    <Link
                                        key={payout.id}
                                        href={
                                            '/prototype/penerbit/pencairan/' +
                                            payout.id
                                        }
                                        className="ikapi-record ikapi-payout-record"
                                    >
                                        <span className="ikapi-record-title">
                                            <strong>
                                                <Currency
                                                    value={payout.amount}
                                                />
                                            </strong>
                                            <span>
                                                {payout.id} ·{' '}
                                                {formatDateTime(payout.date)}
                                            </span>
                                        </span>
                                        <span className="ikapi-record-side">
                                            <StatusBadge
                                                status={payout.status}
                                            />
                                            <ArrowRight
                                                size={16}
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="Belum ada pencairan"
                                description="Pengajuan pencairan yang Anda buat akan tercatat di sini."
                            />
                        )}
                    </section>
                </div>
            </PublisherLayout>
        </>
    );
}
