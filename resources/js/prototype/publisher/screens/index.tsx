import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BookOpenCheck,
    FileClock,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, PublisherLayout } from '@/prototype/publisher/components';

export default function PublisherIndex() {
    return (
        <>
            <Head title="Ruang penerbit" />
            <PublisherLayout>
                <PageHeading
                    title="Ruang penerbit"
                    description="Kelola katalog, penjualan, dan hubungan dengan pembaca dari satu tempat."
                />
                <section className="ikapi-panel ikapi-panel-pad ikapi-index-panel">
                    <div className="ikapi-index-intro">
                        <span className="ikapi-index-mark" aria-hidden="true">
                            <BookOpenCheck size={24} />
                        </span>
                        <div>
                            <p className="ikapi-eyebrow">
                                Penerbit Aksara Priangan
                            </p>
                            <h2>Selamat datang kembali</h2>
                            <p>
                                Mulai dari ringkasan, atau langsung buka
                                pekerjaan yang ingin Anda lanjutkan.
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        className="ikapi-button ikapi-button-primary"
                    >
                        <Link href="/prototype/penerbit/dashboard">
                            Buka ringkasan{' '}
                            <ArrowRight size={17} aria-hidden="true" />
                        </Link>
                    </Button>
                </section>
                <div className="ikapi-index-links">
                    <Link
                        href="/prototype/penerbit/buku"
                        className="ikapi-index-link"
                    >
                        <span className="ikapi-index-link-icon">
                            <BookOpenCheck size={19} />
                        </span>
                        <span>
                            <strong>Kelola buku</strong>
                            <small>Atur katalog dan pengajuan terbaru</small>
                        </span>
                        <ArrowUpRight size={17} />
                    </Link>
                    <Link
                        href="/prototype/penerbit/pesanan"
                        className="ikapi-index-link"
                    >
                        <span className="ikapi-index-link-icon">
                            <FileClock size={19} />
                        </span>
                        <span>
                            <strong>Pesanan masuk</strong>
                            <small>Lihat penjualan dan invoice</small>
                        </span>
                        <ArrowUpRight size={17} />
                    </Link>
                    <Link
                        href="/prototype/penerbit/pencairan"
                        className="ikapi-index-link"
                    >
                        <span className="ikapi-index-link-icon">
                            <Wallet size={19} />
                        </span>
                        <span>
                            <strong>Pendapatan & pencairan</strong>
                            <small>Kelola saldo dan rekening tujuan</small>
                        </span>
                        <ArrowUpRight size={17} />
                    </Link>
                </div>
                <p className="ikapi-footer-note">
                    Prototype ini menggunakan data tersimpan di browser untuk
                    memperagakan alur penerbit.
                </p>
            </PublisherLayout>
        </>
    );
}
