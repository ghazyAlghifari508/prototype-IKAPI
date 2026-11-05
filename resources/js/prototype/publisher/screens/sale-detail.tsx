import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Currency,
    PageHeading,
    PublisherLayout,
    SectionHeading,
    StatusBadge,
} from '@/prototype/publisher/components';
import { InvoiceDownloadButton } from '@/prototype/publisher/invoice-download';
import { formatDateTime, usePublisherData } from '@/prototype/publisher/store';

export default function PublisherSaleDetail({ orderId }: { orderId: string }) {
    const [data] = usePublisherData();
    const { url } = usePage();
    const params = new URL('http://ikapi.local' + url).searchParams;
    const backParams = new URLSearchParams({
        q: params.get('q') ?? '',
        dari: params.get('dari') ?? '',
        sampai: params.get('sampai') ?? '',
    });
    const backUrl = '/prototype/penerbit/pesanan?' + backParams.toString();
    const order = data.orders.find((item) => item.id === orderId);

    if (!order) return <MissingOrder backUrl={backUrl} />;

    return (
        <>
            <Head title={'Detail penjualan ' + order.id} />
            <PublisherLayout active="sales">
                <PageHeading
                    title="Detail penjualan"
                    description="Rincian transaksi lunas untuk buku penerbit Anda."
                    action={
                        <Button
                            asChild
                            variant="ghost"
                            className="ikapi-button-quiet"
                        >
                            <Link href={backUrl}>
                                <ArrowLeft size={16} aria-hidden="true" />
                                Kembali ke pesanan
                            </Link>
                        </Button>
                    }
                />
                <div className="ikapi-grid ikapi-grid-2 ikapi-sale-detail-grid">
                    <section className="ikapi-panel ikapi-panel-pad">
                        <SectionHeading
                            title="Ringkasan transaksi"
                            detail={order.id}
                            action={
                                <StatusBadge status={order.paymentStatus} />
                            }
                        />
                        <dl className="ikapi-definition-grid">
                            <Info
                                label="Tanggal transaksi"
                                value={formatDateTime(order.date)}
                            />
                            <Info label="Pembeli" value={order.buyerLabel} />
                            <Info
                                label="Jumlah buku"
                                value={
                                    order.items.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0,
                                    ) + ' buku'
                                }
                            />
                            <Info label="Nomor pesanan" value={order.id} />
                        </dl>
                        <div className="ikapi-invoice-callout">
                            <FileText size={19} aria-hidden="true" />
                            <div>
                                <strong>Invoice penjualan</strong>
                                <span>Dokumen PDF untuk transaksi ini.</span>
                            </div>
                            <InvoiceDownloadButton order={order} compact />
                        </div>
                    </section>
                    <section className="ikapi-panel ikapi-panel-pad">
                        <SectionHeading
                            title="Buku dalam pesanan"
                            detail="Hanya item yang menjadi bagian penjualan penerbit ini."
                        />
                        <div className="ikapi-sale-items">
                            {order.items.map((item) => (
                                <div
                                    className="ikapi-sale-item"
                                    key={item.bookId}
                                >
                                    <div>
                                        <strong>{item.title}</strong>
                                        <span>
                                            {item.quantity} ×{' '}
                                            <Currency value={item.price} />
                                        </span>
                                    </div>
                                    <strong>
                                        <Currency
                                            value={item.price * item.quantity}
                                        />
                                    </strong>
                                </div>
                            ))}
                        </div>
                        <div className="ikapi-financial-total">
                            <span>Total harga buku</span>
                            <strong>
                                <Currency value={order.bookTotal} />
                            </strong>
                        </div>
                        <div className="ikapi-financial-total is-emphasized">
                            <span>Pendapatan bersih</span>
                            <strong>
                                <Currency value={order.publisherNet} />
                            </strong>
                        </div>
                    </section>
                </div>
                <p className="ikapi-footer-note">
                    Rincian pembeli dibatasi pada informasi yang diperlukan
                    untuk mengenali transaksi.
                </p>
            </PublisherLayout>
        </>
    );
}

function MissingOrder({ backUrl }: { backUrl: string }) {
    return (
        <>
            <Head title="Pesanan tidak tersedia" />
            <PublisherLayout active="sales">
                <div className="ikapi-panel ikapi-access-denied">
                    <div className="ikapi-empty-state">
                        <span className="ikapi-empty-icon">
                            <FileText size={20} />
                        </span>
                        <h3>Pesanan tidak tersedia</h3>
                        <p>
                            Pesanan ini tidak ditemukan pada daftar penjualan
                            penerbit Anda.
                        </p>
                        <div className="ikapi-empty-action">
                            <Button
                                asChild
                                className="ikapi-button ikapi-button-primary"
                            >
                                <Link href={backUrl}>Kembali ke pesanan</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </PublisherLayout>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="ikapi-definition">
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}
