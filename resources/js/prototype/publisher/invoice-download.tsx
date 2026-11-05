import { useState } from 'react';
import { ArrowDownToLine, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Currency } from './components';
import { downloadInvoicePdf } from './invoice';
import { formatDateTime, type PublisherOrder } from './store';

export function InvoiceDownloadButton({
    order,
    compact = false,
}: {
    order: PublisherOrder;
    compact?: boolean;
}) {
    const [open, setOpen] = useState(false);

    function download() {
        downloadInvoicePdf(order);
        setOpen(false);
        toast.success('Invoice berhasil diunduh.');
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className={
                    compact
                        ? 'ikapi-button ikapi-button-secondary ikapi-invoice-button'
                        : 'ikapi-button ikapi-button-secondary'
                }
                onClick={() => setOpen(true)}
            >
                <ArrowDownToLine size={16} aria-hidden="true" />
                {compact ? 'Invoice' : 'Unduh invoice'}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="ikapi-dialog">
                    <DialogHeader>
                        <DialogTitle>Invoice penjualan</DialogTitle>
                        <DialogDescription>
                            Periksa ringkasan transaksi sebelum mengunduh
                            dokumen PDF.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="ikapi-invoice">
                        <div>
                            <h3>IKAPI Jawa Barat</h3>
                            <span className="ikapi-muted">
                                Nomor {order.id}
                            </span>
                            <br />
                            <span className="ikapi-muted">
                                {formatDateTime(order.date)}
                            </span>
                        </div>
                        <div className="ikapi-invoice-lines">
                            {order.items.map((item) => (
                                <div
                                    className="ikapi-invoice-row"
                                    key={item.bookId}
                                >
                                    <span>
                                        {item.title} × {item.quantity}
                                    </span>
                                    <strong>
                                        <Currency
                                            value={item.price * item.quantity}
                                        />
                                    </strong>
                                </div>
                            ))}
                        </div>
                        <div className="ikapi-invoice-row">
                            <span>Total harga buku</span>
                            <strong>
                                <Currency value={order.bookTotal} />
                            </strong>
                        </div>
                        <div className="ikapi-invoice-row">
                            <span>Pendapatan penerbit</span>
                            <strong>
                                <Currency value={order.publisherNet} />
                            </strong>
                        </div>
                    </div>
                    <DialogFooter className="ikapi-dialog-actions">
                        <Button
                            variant="outline"
                            className="ikapi-button ikapi-button-secondary"
                            onClick={() => setOpen(false)}
                        >
                            Tutup
                        </Button>
                        <Button
                            className="ikapi-button ikapi-button-primary"
                            onClick={download}
                        >
                            <FileText size={16} aria-hidden="true" />
                            Unduh invoice PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
