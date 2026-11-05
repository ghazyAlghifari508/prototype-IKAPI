import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileText, ImagePlus, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    BookCover,
    PageHeading,
    PublisherLayout,
    StatusBadge,
    bookCategories,
    formatBytes,
} from '@/prototype/publisher/components';
import {
    usePublisherData,
    type PublisherBook,
} from '@/prototype/publisher/store';

type Draft = {
    title: string;
    author: string;
    category: string;
    synopsis: string;
    pages: string;
    price: string;
};
type Errors = Partial<Record<keyof Draft | 'pdf', string>>;
const maxPdfBytes = 50 * 1024 * 1024;

function emptyDraft(): Draft {
    return {
        title: '',
        author: '',
        category: '',
        synopsis: '',
        pages: '',
        price: '',
    };
}
function toDraft(book: PublisherBook): Draft {
    return {
        title: book.title,
        author: book.author,
        category: book.category,
        synopsis: book.synopsis,
        pages: String(book.pages),
        price: String(book.price),
    };
}

export default function PublisherBookForm({ bookId }: { bookId?: string }) {
    const [data, update] = usePublisherData();
    const book = useMemo(
        () =>
            bookId ? data.books.find((item) => item.id === bookId) : undefined,
        [bookId, data.books],
    );
    const missing = Boolean(bookId && !book);
    const readOnly = book?.status === 'Aktif';
    const [draft, setDraft] = useState<Draft>(() =>
        book ? toDraft(book) : emptyDraft(),
    );
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        setDraft(book ? toDraft(book) : emptyDraft());
    }, [book]);
    useEffect(() => {
        if (!coverFile || !coverFile.type.startsWith('image/')) {
            setCoverPreview('');
            return;
        }
        const url = URL.createObjectURL(coverFile);
        setCoverPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [coverFile]);

    function onPdfChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files?.[0] ?? null;
        event.currentTarget.value = '';
        if (!file) return;
        if (
            file.type !== 'application/pdf' &&
            !file.name.toLowerCase().endsWith('.pdf')
        ) {
            setPdfFile(null);
            setErrors((current) => ({
                ...current,
                pdf: 'Format berkas harus PDF. Pilih berkas lain.',
            }));
            return;
        }
        if (file.size > maxPdfBytes) {
            setPdfFile(null);
            setErrors((current) => ({
                ...current,
                pdf: 'Ukuran PDF melebihi 50 MB. Pilih berkas lain.',
            }));
            return;
        }
        setPdfFile(file);
        setErrors((current) => ({ ...current, pdf: undefined }));
    }

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors: Errors = {};
        if (!draft.title.trim()) nextErrors.title = 'Judul buku wajib diisi.';
        if (!draft.author.trim())
            nextErrors.author = 'Nama penulis wajib diisi.';
        if (!draft.category) nextErrors.category = 'Pilih kategori buku.';
        if (!draft.synopsis.trim())
            nextErrors.synopsis = 'Sinopsis wajib diisi.';
        const pages = Number(draft.pages);
        if (!Number.isInteger(pages) || pages < 1)
            nextErrors.pages = 'Masukkan jumlah halaman berupa bilangan bulat.';
        const price = Number(draft.price);
        if (!Number.isFinite(price) || price <= 0)
            nextErrors.price = 'Masukkan harga buku lebih dari Rp0.';
        if (!pdfFile && !book?.pdfName)
            nextErrors.pdf = 'Pilih berkas PDF buku sebelum mengajukan.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const updated: PublisherBook = {
            id: book?.id ?? 'bk-' + Date.now().toString(36),
            title: draft.title.trim(),
            author: draft.author.trim(),
            category: draft.category,
            synopsis: draft.synopsis.trim(),
            pages,
            price,
            sales: book?.sales ?? 0,
            status: 'Menunggu Approval',
            revisionNote: undefined,
            coverName: coverFile?.name ?? book?.coverName,
            pdfName: pdfFile?.name ?? book?.pdfName,
            pdfSizeBytes: pdfFile?.size ?? book?.pdfSizeBytes,
            updatedAt: new Date().toISOString().slice(0, 10),
        };
        update((current) => ({
            ...current,
            books: book
                ? current.books.map((item) =>
                      item.id === book.id ? updated : item,
                  )
                : [updated, ...current.books],
        }));
        toast.success(
            book
                ? 'Perbaikan buku berhasil diajukan.'
                : 'Buku berhasil diajukan untuk persetujuan.',
        );
        router.visit('/prototype/penerbit/buku');
    }

    if (missing) return <MissingBook />;

    return (
        <>
            <Head
                title={
                    readOnly
                        ? 'Detail buku'
                        : book
                          ? 'Perbaiki buku'
                          : 'Tambah buku'
                }
            />
            <PublisherLayout active="books">
                <PageHeading
                    title={
                        readOnly
                            ? 'Detail buku'
                            : book
                              ? 'Perbaiki buku'
                              : 'Tambah buku'
                    }
                    description={
                        readOnly
                            ? 'Informasi buku yang sudah aktif di katalog.'
                            : 'Lengkapi informasi buku dan ajukan untuk ditinjau Administrator.'
                    }
                    action={
                        <Button
                            asChild
                            variant="ghost"
                            className="ikapi-button-quiet"
                        >
                            <Link href="/prototype/penerbit/buku">
                                <ArrowLeft size={16} aria-hidden="true" />
                                Kembali ke buku
                            </Link>
                        </Button>
                    }
                />
                {readOnly ? (
                    <div className="ikapi-inline-note ikapi-active-book-note">
                        <FileText size={17} aria-hidden="true" />
                        <span>
                            Buku ini aktif. Alur perubahan untuk buku aktif
                            belum tersedia.
                        </span>
                    </div>
                ) : null}
                {book?.revisionNote && book.status === 'Ditolak/Revisi' ? (
                    <div className="ikapi-revision-note">
                        <strong>Catatan perbaikan</strong>
                        <br />
                        {book.revisionNote}
                    </div>
                ) : null}
                <form
                    className="ikapi-stack ikapi-book-form"
                    onSubmit={save}
                    noValidate
                >
                    <section className="ikapi-panel ikapi-panel-pad">
                        <div className="ikapi-book-form-heading">
                            <div>
                                <h2>Informasi buku</h2>
                                <p>
                                    Judul, penulis, kategori, dan isi ringkas
                                    buku.
                                </p>
                            </div>
                            {book ? <StatusBadge status={book.status} /> : null}
                        </div>
                        <div className="ikapi-form-grid">
                            <TextField
                                label="Judul buku"
                                id="title"
                                value={draft.title}
                                error={errors.title}
                                disabled={readOnly}
                                onChange={(value) =>
                                    setDraft({ ...draft, title: value })
                                }
                            />
                            <TextField
                                label="Nama penulis"
                                id="author"
                                value={draft.author}
                                error={errors.author}
                                disabled={readOnly}
                                onChange={(value) =>
                                    setDraft({ ...draft, author: value })
                                }
                            />
                            <div className="ikapi-field">
                                <label htmlFor="category">Kategori</label>
                                <select
                                    id="category"
                                    value={draft.category}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(errors.category)}
                                    aria-describedby={
                                        errors.category
                                            ? 'category-error'
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            category: event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Pilih kategori</option>
                                    {bookCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category ? (
                                    <span
                                        className="ikapi-field-error"
                                        id="category-error"
                                    >
                                        {errors.category}
                                    </span>
                                ) : null}
                            </div>
                            <TextField
                                label="Jumlah halaman"
                                id="pages"
                                type="number"
                                min="1"
                                value={draft.pages}
                                error={errors.pages}
                                disabled={readOnly}
                                onChange={(value) =>
                                    setDraft({ ...draft, pages: value })
                                }
                            />
                            <div className="ikapi-field ikapi-field-full">
                                <label htmlFor="synopsis">Sinopsis</label>
                                <textarea
                                    id="synopsis"
                                    value={draft.synopsis}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(errors.synopsis)}
                                    aria-describedby={
                                        errors.synopsis
                                            ? 'synopsis-error'
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            synopsis: event.target.value,
                                        })
                                    }
                                />
                                {errors.synopsis ? (
                                    <span
                                        className="ikapi-field-error"
                                        id="synopsis-error"
                                    >
                                        {errors.synopsis}
                                    </span>
                                ) : (
                                    <span className="ikapi-field-help">
                                        Tuliskan gambaran isi buku yang membantu
                                        pembaca memilih.
                                    </span>
                                )}
                            </div>
                            <TextField
                                label="Harga (Rp)"
                                id="price"
                                type="number"
                                min="1"
                                value={draft.price}
                                error={errors.price}
                                disabled={readOnly}
                                onChange={(value) =>
                                    setDraft({ ...draft, price: value })
                                }
                                help={
                                    draft.price && Number(draft.price) > 0
                                        ? 'Harga yang akan terlihat pada katalog: ' +
                                          new Intl.NumberFormat('id-ID', {
                                              style: 'currency',
                                              currency: 'IDR',
                                              maximumFractionDigits: 0,
                                          }).format(Number(draft.price))
                                        : 'Masukkan harga dalam rupiah.'
                                }
                            />
                        </div>
                    </section>
                    <section className="ikapi-panel ikapi-panel-pad">
                        <div className="ikapi-book-form-heading">
                            <div>
                                <h2>Berkas buku</h2>
                                <p>
                                    PDF diperlukan untuk pengajuan. Sampul dapat
                                    ditambahkan bila tersedia.
                                </p>
                            </div>
                        </div>
                        <div className="ikapi-form-grid">
                            <div className="ikapi-field">
                                <span className="ikapi-field-label">
                                    Sampul buku
                                </span>
                                <label
                                    className="ikapi-file-pick"
                                    htmlFor="cover-file"
                                >
                                    <ImagePlus size={20} aria-hidden="true" />
                                    <span>
                                        <strong>Pilih sampul</strong>
                                        {coverFile
                                            ? ' · ' + coverFile.name
                                            : book?.coverName
                                              ? ' · ' + book.coverName
                                              : ' · opsional'}
                                    </span>
                                    <input
                                        id="cover-file"
                                        type="file"
                                        disabled={readOnly}
                                        onChange={(event) =>
                                            setCoverFile(
                                                event.currentTarget
                                                    .files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </label>
                                <span className="ikapi-field-help">
                                    Belum ada batas format atau ukuran sampul
                                    yang ditetapkan.
                                </span>
                                {coverPreview ? (
                                    <img
                                        className="ikapi-cover-preview"
                                        src={coverPreview}
                                        alt="Pratinjau sampul yang dipilih"
                                    />
                                ) : book?.coverName ? (
                                    <BookCover title={book.title} compact />
                                ) : null}
                            </div>
                            <div className="ikapi-field">
                                <label htmlFor="pdf-file">
                                    Berkas e-book (PDF) *
                                </label>
                                <label
                                    className="ikapi-file-pick"
                                    htmlFor="pdf-file"
                                >
                                    <UploadCloud size={20} aria-hidden="true" />
                                    <span>
                                        <strong>Pilih PDF</strong>
                                        {pdfFile
                                            ? ' · ' + pdfFile.name
                                            : book?.pdfName
                                              ? ' · ' + book.pdfName
                                              : ''}
                                    </span>
                                    <input
                                        id="pdf-file"
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        disabled={readOnly}
                                        aria-invalid={Boolean(errors.pdf)}
                                        aria-describedby={
                                            errors.pdf
                                                ? 'pdf-error'
                                                : 'pdf-help'
                                        }
                                        onChange={onPdfChange}
                                    />
                                </label>
                                {errors.pdf ? (
                                    <span
                                        className="ikapi-field-error"
                                        id="pdf-error"
                                    >
                                        {errors.pdf}
                                    </span>
                                ) : (
                                    <span
                                        className="ikapi-field-help"
                                        id="pdf-help"
                                    >
                                        PDF maksimal 50 MB.{' '}
                                        {pdfFile
                                            ? formatBytes(pdfFile.size)
                                            : book?.pdfSizeBytes
                                              ? formatBytes(book.pdfSizeBytes) +
                                                ' tersimpan'
                                              : 'Pilih berkas PDF untuk melanjutkan.'}
                                    </span>
                                )}
                            </div>
                        </div>
                        {readOnly ? null : (
                            <div className="ikapi-form-actions">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="ikapi-button ikapi-button-secondary"
                                    onClick={() =>
                                        router.visit('/prototype/penerbit/buku')
                                    }
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="ikapi-button ikapi-button-primary"
                                >
                                    Simpan & Ajukan Buku
                                </Button>
                            </div>
                        )}
                    </section>
                </form>
                <p className="ikapi-footer-note">
                    Pengajuan buku berstatus Menunggu Approval sampai disetujui
                    Administrator.
                </p>
            </PublisherLayout>
        </>
    );
}

function TextField({
    label,
    id,
    value,
    error,
    onChange,
    disabled = false,
    help,
    ...props
}: {
    label: string;
    id: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    help?: string;
    type?: 'text' | 'number';
    min?: string;
}) {
    return (
        <div className="ikapi-field">
            <label htmlFor={id}>{label}</label>
            <Input
                id={id}
                value={value}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={
                    error ? id + '-error' : help ? id + '-help' : undefined
                }
                onChange={(event) => onChange(event.target.value)}
                {...props}
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

function MissingBook() {
    return (
        <>
            <Head title="Buku tidak tersedia" />
            <PublisherLayout active="books">
                <div className="ikapi-panel ikapi-access-denied">
                    <div className="ikapi-empty-state">
                        <span className="ikapi-empty-icon">
                            <FileText size={20} />
                        </span>
                        <h3>Buku tidak tersedia</h3>
                        <p>
                            Buku ini tidak ditemukan pada daftar penerbit Anda.
                        </p>
                        <div className="ikapi-empty-action">
                            <Button
                                asChild
                                className="ikapi-button ikapi-button-primary"
                            >
                                <Link href="/prototype/penerbit/buku">
                                    Kembali ke daftar buku
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </PublisherLayout>
        </>
    );
}
