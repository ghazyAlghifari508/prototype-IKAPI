import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileCheck2, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Currency,
    PageHeading,
    PublisherLayout,
    SectionHeading,
    StatusBadge,
} from '@/prototype/publisher/components';
import {
    formatDateTime,
    maskAccountNumber,
    usePublisherData,
} from '@/prototype/publisher/store';

export default function PublisherPayoutDetail({
    payoutId,
}: {
    payoutId: string;
}) {
    const [data] = usePublisherData();
    const [proofOpen, setProofOpen] = useState(false);
    const payout = data.payouts.find((item) => item.id === payoutId);

    if (!payout) return <MissingPayout />;

    return (
        <>
            <Head title={'Detail pencairan ' + payout.id} />
            <PublisherLayout active="payouts">
                <PageHeading
                    title="Detail pencairan"
                    description="Periksa status pengajuan dan rekening tujuan."
                    action={
                        <Button
                            asChild
                            variant="ghost"
                            className="ikapi-button-quiet"
                        >
                            <Link href="/prototype/penerbit/pencairan">
                                <ArrowLeft size={16} aria-hidden="true" />
                                Kembali ke pencairan
                            </Link>
                        </Button>
                    }
                />
                <div className="ikapi-grid ikapi-grid-2 ikapi-payout-detail-grid">
                    <section className="ikapi-panel ikapi-panel-pad">
                        <SectionHeading
                            title={payout.id}
                            detail={formatDateTime(payout.date)}
                            action={<StatusBadge status={payout.status} />}
                        />
                        <div className="ikapi-payout-amount">
                            <span>Nominal pengajuan</span>
                            <strong>
                                <Currency value={payout.amount} />
                            </strong>
                        </div>
                        <dl className="ikapi-definition-grid ikapi-payout-account">
                            <Info
                                label="Nama bank"
                                value={payout.account.bankName}
                            />
                            <Info
                                label="Nama pemilik rekening"
                                value={payout.account.accountHolder}
                            />
                            <Info
                                label="Nomor rekening"
                                value={maskAccountNumber(
                                    payout.account.accountNumber,
                                )}
                                wide
                            />
                        </dl>
                        {payout.status === 'Ditolak' && payout.reason ? (
                            <div className="ikapi-revision-note">
                                <strong>Catatan pengajuan</strong>
                                <br />
                                {payout.reason}
                            </div>
                        ) : null}
                    </section>
                    <section className="ikapi-panel ikapi-panel-pad">
                        <SectionHeading
                            title="Bukti transfer"
                            detail="Bukti tersedia setelah pengajuan selesai diproses."
                        />
                        {payout.status === 'Dalam Proses' ? (
                            <div className="ikapi-proof-state">
                                <span className="ikapi-proof-icon">
                                    <FileText size={21} aria-hidden="true" />
                                </span>
                                <h3>Pencairan masih diproses</h3>
                                <p>
                                    Bukti transfer belum tersedia. Status akan
                                    berubah setelah transfer manual
                                    diselesaikan.
                                </p>
                            </div>
                        ) : payout.status === 'Ditolak' ? (
                            <div className="ikapi-proof-state">
                                <span className="ikapi-proof-icon is-muted">
                                    <FileCheck2 size={21} aria-hidden="true" />
                                </span>
                                <h3>Pengajuan ditolak</h3>
                                <p>
                                    Dana pengajuan dikembalikan ke saldo
                                    tersedia. Periksa catatan sebelum membuat
                                    pengajuan baru.
                                </p>
                                <Link
                                    href="/prototype/penerbit/pencairan"
                                    className="ikapi-inline-link"
                                >
                                    Kembali ke saldo{' '}
                                    <ArrowLeft size={15} aria-hidden="true" />
                                </Link>
                            </div>
                        ) : payout.proof ? (
                            <div className="ikapi-proof-state">
                                <span className="ikapi-proof-icon">
                                    <FileCheck2 size={21} aria-hidden="true" />
                                </span>
                                <h3>Bukti transfer tersedia</h3>
                                <p>{payout.proof.fileName}</p>
                                <Button
                                    className="ikapi-button ikapi-button-primary"
                                    onClick={() => setProofOpen(true)}
                                >
                                    Lihat bukti transfer
                                </Button>
                            </div>
                        ) : (
                            <div className="ikapi-alert" role="status">
                                <RefreshCw size={17} aria-hidden="true" />
                                <p>
                                    Bukti transfer belum dapat ditampilkan. Coba
                                    muat ulang halaman.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
                <Dialog open={proofOpen} onOpenChange={setProofOpen}>
                    <DialogContent className="ikapi-dialog ikapi-proof-dialog">
                        <DialogHeader>
                            <DialogTitle>Bukti transfer</DialogTitle>
                            <DialogDescription>
                                {payout.proof?.fileName}
                            </DialogDescription>
                        </DialogHeader>
                        {payout.proof?.mimeType.startsWith('image/') ? (
                            <img
                                className="ikapi-proof-image"
                                src={payout.proof.url}
                                alt="Bukti transfer pencairan"
                            />
                        ) : payout.proof ? (
                            <object
                                className="ikapi-proof-pdf"
                                data={payout.proof.url}
                                type="application/pdf"
                            >
                                <p>
                                    Pratinjau PDF tidak tersedia.{' '}
                                    <a
                                        href={payout.proof.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Buka berkas PDF
                                    </a>
                                    .
                                </p>
                            </object>
                        ) : null}
                    </DialogContent>
                </Dialog>
            </PublisherLayout>
        </>
    );
}

function MissingPayout() {
    return (
        <>
            <Head title="Pencairan tidak tersedia" />
            <PublisherLayout active="payouts">
                <div className="ikapi-panel ikapi-access-denied">
                    <div className="ikapi-empty-state">
                        <span className="ikapi-empty-icon">
                            <FileText size={20} />
                        </span>
                        <h3>Pengajuan tidak tersedia</h3>
                        <p>
                            Pengajuan ini tidak ditemukan pada riwayat pencairan
                            penerbit Anda.
                        </p>
                        <div className="ikapi-empty-action">
                            <Button
                                asChild
                                className="ikapi-button ikapi-button-primary"
                            >
                                <Link href="/prototype/penerbit/pencairan">
                                    Kembali ke pencairan
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </PublisherLayout>
        </>
    );
}

function Info({
    label,
    value,
    wide = false,
}: {
    label: string;
    value: string;
    wide?: boolean;
}) {
    return (
        <div
            className={
                wide ? 'ikapi-definition ikapi-field-full' : 'ikapi-definition'
            }
        >
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}
