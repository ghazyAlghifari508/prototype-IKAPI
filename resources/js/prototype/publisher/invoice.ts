import type { PublisherOrder } from './store';
import { formatRupiah, formatDateTime } from './store';

function pdfText(value: string) {
    return value
        .normalize('NFKD')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

export function downloadInvoicePdf(order: PublisherOrder) {
    const lines = [
        'INVOICE PENJUALAN',
        'IKAPI JAWA BARAT',
        'Nomor: ' + order.id,
        'Tanggal: ' + formatDateTime(order.date),
        'Pembeli: ' + order.buyerLabel,
        'Rincian buku:',
        ...order.items.map(
            (item) =>
                item.title +
                ' x' +
                item.quantity +
                '  ' +
                formatRupiah(item.price * item.quantity),
        ),
        'Total harga buku: ' + formatRupiah(order.bookTotal),
        'Pendapatan penerbit: ' + formatRupiah(order.publisherNet),
        'Status pembayaran: Lunas',
    ];
    const fontSize = 18;
    let stream =
        'BT\n/F1 ' +
        fontSize +
        ' Tf\n50 770 Td\n(' +
        pdfText(lines[0]) +
        ') Tj\n/F1 10 Tf\n';
    for (const line of lines.slice(1)) {
        stream += '0 -24 Td\n(' + pdfText(line) + ') Tj\n';
    }
    stream += 'ET\n';

    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream',
    ];
    let document = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(new TextEncoder().encode(document).length);
        document += index + 1 + ' 0 obj\n' + object + '\nendobj\n';
    });
    const xrefOffset = new TextEncoder().encode(document).length;
    document += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    offsets.slice(1).forEach((offset) => {
        document += String(offset).padStart(10, '0') + ' 00000 n \n';
    });
    document +=
        'trailer\n<< /Size ' +
        (objects.length + 1) +
        ' /Root 1 0 R >>\nstartxref\n' +
        xrefOffset +
        '\n%%EOF';

    const url = URL.createObjectURL(
        new Blob([document], { type: 'application/pdf' }),
    );
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = 'invoice-' + order.id.toLowerCase() + '.pdf';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
