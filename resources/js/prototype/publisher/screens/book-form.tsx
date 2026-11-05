import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    ImagePlus,
    Plus,
    Star,
    UploadCloud,
    X,
} from 'lucide-react';
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
    formatDate,
    usePublisherData,
    type PublisherBook,
} from '@/prototype/publisher/store';

type Draft = {
    title: string;
    author: string;
    category: string;
    edition: string;
    genre: string;
    synopsis: string;
    endorsementBy: string;
    endorsementText: string;
    pages: string;
    price: string;
};
type Errors = Partial<Record<keyof Draft | 'pdf' | 'samplePdf', string>>;
const maxPdfBytes = 50 * 1024 * 1024;

function emptyDraft(): Draft {
    return {
        title: '',
        author: '',
        category: '',
        edition: '',
        genre: '',
        synopsis: '',
        endorsementBy: '',
        endorsementText: '',
        pages: '',
        price: '',
    };
}
function toDraft(book: PublisherBook): Draft {
    return {
        title: book.title,
        author: book.author,
        category: book.category,
        edition: book.edition ?? '',
        genre: book.genre ?? '',
        synopsis: book.synopsis,
        endorsementBy: book.endorsementBy ?? '',
        endorsementText: book.endorsementText ?? '',
        pages: String(book.pages),
        price: String(book.price),
    };
}

export default function PublisherBookForm({ bookId }: { bookId?: string }) {
    const [data, update] = usePublisherData();
    const { url } = usePage();
    const routeParams = new URL('http://ikapi.local' + url).searchParams;
    const backParams = new URLSearchParams();
    ['q', 'status', 'kategori', 'dari', 'sampai'].forEach((key) => {
        const value = routeParams.get(key);
        if (value) backParams.set(key, value);
    });
    const backUrl =
        '/prototype/penerbit/buku' +
        (backParams.size ? '?' + backParams.toString() : '');
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
    const [samplePdfFile, setSamplePdfFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [showNewAuthor, setShowNewAuthor] = useState(false);
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

    function onSamplePdfChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files?.[0] ?? null;
        event.currentTarget.value = '';
        if (!file) return;
        if (
            file.type !== 'application/pdf' &&
            !file.name.toLowerCase().endsWith('.pdf')
        ) {
            setSamplePdfFile(null);
            setErrors((current) => ({
                ...current,
                samplePdf: 'Format berkas sampel harus PDF. Pilih berkas lain.',
            }));
            return;
        }
        setSamplePdfFile(file);
        setErrors((current) => ({ ...current, samplePdf: undefined }));
    }

    function addAuthor() {
        const name = newAuthor.trim();
        if (!name) return;
        update((current) => ({
            ...current,
            authors: [...new Set([...(current.authors ?? []), name])].sort(
                (first, second) => first.localeCompare(second, 'id'),
            ),
        }));
        setDraft((current) => ({ ...current, author: name }));
        setNewAuthor('');
        setShowNewAuthor(false);
        setErrors((current) => ({ ...current, author: undefined }));
    }

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors: Errors = {};
        if (errors.pdf) nextErrors.pdf = errors.pdf;
        if (errors.samplePdf) nextErrors.samplePdf = errors.samplePdf;
        if (!draft.title.trim()) nextErrors.title = 'Judul buku wajib diisi.';
        if (!draft.author.trim())
            nextErrors.author = 'Nama penulis wajib diisi.';
        if (!draft.category) nextErrors.category = 'Pilih kategori buku.';
        if (!draft.synopsis.trim())
            nextErrors.synopsis = 'Sinopsis wajib diisi.';
        if (
            Boolean(draft.endorsementBy.trim()) !==
            Boolean(draft.endorsementText.trim())
        ) {
            if (!draft.endorsementBy.trim())
                nextErrors.endorsementBy =
                    'Isi nama tokoh/media untuk kutipan ini.';
            if (!draft.endorsementText.trim())
                nextErrors.endorsementText =
                    'Isi kutipan atau ulasan tokoh/media.';
        }
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
            edition: draft.edition.trim() || undefined,
            genre: draft.genre.trim() || undefined,
            synopsis: draft.synopsis.trim(),
            endorsementBy: draft.endorsementBy.trim() || undefined,
            endorsementText: draft.endorsementText.trim() || undefined,
            pages,
            price,
            sales: book?.sales ?? 0,
            status: 'Menunggu Approval',
            revisionNote: undefined,
            coverName: coverFile?.name ?? book?.coverName,
            pdfName: pdfFile?.name ?? book?.pdfName,
            pdfSizeBytes: pdfFile?.size ?? book?.pdfSizeBytes,
            sampleName: samplePdfFile?.name ?? book?.sampleName,
            updatedAt: new Date().toISOString().slice(0, 10),
        };
        update((current) => ({
            ...current,
            authors: [...new Set([...(current.authors ?? []), updated.author])],
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

    if (missing) return <MissingBook backUrl={backUrl} />;

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
                            <Link href={backUrl}>
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
                                help={
                                    draft.title.length +
                                    ' karakter · tidak diubah otomatis ke huruf besar'
                                }
                                onChange={(value) =>
                                    setDraft({ ...draft, title: value })
                                }
                            />
                            <div className="ikapi-field">
                                <label htmlFor="author">Penulis</label>
                                <div className="ikapi-author-select-row">
                                    <select
                                        id="author"
                                        value={draft.author}
                                        disabled={readOnly}
                                        aria-invalid={Boolean(errors.author)}
                                        aria-describedby={
                                            errors.author
                                                ? 'author-error'
                                                : 'author-help'
                                        }
                                        onChange={(event) =>
                                            setDraft({
                                                ...draft,
                                                author: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Pilih penulis</option>
                                        {[
                                            ...new Set([
                                                ...(data.authors ?? []),
                                                ...data.books.map(
                                                    (item) => item.author,
                                                ),
                                            ]),
                                        ]
                                            .sort((first, second) =>
                                                first.localeCompare(
                                                    second,
                                                    'id',
                                                ),
                                            )
                                            .map((author) => (
                                                <option
                                                    key={author}
                                                    value={author}
                                                >
                                                    {author}
                                                </option>
                                            ))}
                                    </select>
                                    {readOnly ? null : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="ikapi-button ikapi-button-secondary ikapi-author-add-toggle"
                                            aria-expanded={showNewAuthor}
                                            aria-controls="new-author-panel"
                                            onClick={() =>
                                                setShowNewAuthor(
                                                    (visible) => !visible,
                                                )
                                            }
                                        >
                                            {showNewAuthor ? (
                                                <X
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <Plus
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {showNewAuthor
                                                ? 'Tutup'
                                                : 'Tambah penulis'}
                                        </Button>
                                    )}
                                </div>
                                {errors.author ? (
                                    <span
                                        className="ikapi-field-error"
                                        id="author-error"
                                    >
                                        {errors.author}
                                    </span>
                                ) : (
                                    <span
                                        className="ikapi-field-help"
                                        id="author-help"
                                    >
                                        Pilih nama yang sudah tercatat atau
                                        tambahkan penulis baru.
                                    </span>
                                )}
                                {showNewAuthor && !readOnly ? (
                                    <div
                                        className="ikapi-author-add-panel"
                                        id="new-author-panel"
                                    >
                                        <label htmlFor="new-author">
                                            Nama penulis baru
                                        </label>
                                        <div className="ikapi-author-add-row">
                                            <Input
                                                id="new-author"
                                                value={newAuthor}
                                                onChange={(event) =>
                                                    setNewAuthor(
                                                        event.target.value,
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        event.preventDefault();
                                                        addAuthor();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                className="ikapi-button ikapi-button-secondary"
                                                disabled={!newAuthor.trim()}
                                                onClick={addAuthor}
                                            >
                                                Tambahkan
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <div className="ikapi-field">
                                <label htmlFor="publisher">Penerbit</label>
                                <div className="ikapi-publisher-field-control">
                                    <Input
                                        id="publisher"
                                        value={data.profile.publisherName}
                                        disabled
                                    />
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="ikapi-button ikapi-button-secondary"
                                    >
                                        <Link href="/prototype/penerbit/profil">
                                            Ubah profil
                                        </Link>
                                    </Button>
                                </div>
                                <span className="ikapi-field-help">
                                    Nama penerbit mengikuti profil akun ini.
                                </span>
                            </div>
                            <TextField
                                label="Genre (opsional)"
                                id="genre"
                                value={draft.genre}
                                disabled={readOnly}
                                onChange={(value) =>
                                    setDraft({ ...draft, genre: value })
                                }
                                help="Isi genre sesuai buku; daftar genre belum ditetapkan."
                            />
                            <TextField
                                label="Edisi (opsional)"
                                id="edition"
                                value={draft.edition}
                                disabled={readOnly}
                                onChange={(value) =>
                                    setDraft({ ...draft, edition: value })
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
                                        {draft.synopsis.length} karakter ·
                                        tuliskan gambaran isi buku untuk
                                        membantu pembaca memilih.
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
                                <h2>Ulasan tokoh atau media</h2>
                                <p>
                                    Tambahkan apresiasi untuk buku ini jika
                                    tersedia.
                                </p>
                            </div>
                        </div>
                        <div className="ikapi-form-grid">
                            <TextField
                                label="Nama tokoh/media (opsional)"
                                id="endorsement-by"
                                value={draft.endorsementBy}
                                error={errors.endorsementBy}
                                disabled={readOnly}
                                onChange={(value) =>
                                    setDraft({
                                        ...draft,
                                        endorsementBy: value,
                                    })
                                }
                            />
                            <div className="ikapi-field ikapi-field-full">
                                <label htmlFor="endorsement-text">
                                    Kutipan atau ulasan (opsional)
                                </label>
                                <textarea
                                    id="endorsement-text"
                                    value={draft.endorsementText}
                                    disabled={readOnly}
                                    aria-invalid={Boolean(
                                        errors.endorsementText,
                                    )}
                                    aria-describedby={
                                        errors.endorsementText
                                            ? 'endorsement-text-error'
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        setDraft({
                                            ...draft,
                                            endorsementText: event.target.value,
                                        })
                                    }
                                />
                                {errors.endorsementText ? (
                                    <span
                                        className="ikapi-field-error"
                                        id="endorsement-text-error"
                                    >
                                        {errors.endorsementText}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </section>
                    <section className="ikapi-panel ikapi-panel-pad">
                        <div className="ikapi-book-form-heading">
                            <div>
                                <h2>Berkas buku</h2>
                                <p>
                                    PDF diperlukan untuk pengajuan. Sampul dapat
                                    dan sampel/bab dapat ditambahkan bila
                                    tersedia.
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
                            <div className="ikapi-field">
                                <label htmlFor="sample-pdf-file">
                                    Sampel atau bab PDF (opsional)
                                </label>
                                <label
                                    className="ikapi-file-pick"
                                    htmlFor="sample-pdf-file"
                                >
                                    <UploadCloud size={20} aria-hidden="true" />
                                    <span>
                                        <strong>Pilih PDF sampel</strong>
                                        {samplePdfFile
                                            ? ' · ' + samplePdfFile.name
                                            : book?.sampleName
                                              ? ' · ' + book.sampleName
                                              : ' · opsional'}
                                    </span>
                                    <input
                                        id="sample-pdf-file"
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        disabled={readOnly}
                                        aria-invalid={Boolean(errors.samplePdf)}
                                        aria-describedby={
                                            errors.samplePdf
                                                ? 'sample-pdf-error'
                                                : 'sample-pdf-help'
                                        }
                                        onChange={onSamplePdfChange}
                                    />
                                </label>
                                {errors.samplePdf ? (
                                    <>
                                        <span
                                            className="ikapi-field-error"
                                            id="sample-pdf-error"
                                        >
                                            {errors.samplePdf}
                                        </span>
                                        <button
                                            type="button"
                                            className="ikapi-text-action"
                                            onClick={() =>
                                                setErrors((current) => ({
                                                    ...current,
                                                    samplePdf: undefined,
                                                }))
                                            }
                                        >
                                            Lanjut tanpa sampel
                                        </button>
                                    </>
                                ) : (
                                    <span
                                        className="ikapi-field-help"
                                        id="sample-pdf-help"
                                    >
                                        PDF buku lengkap tetap diperlukan;
                                        sampel/bab digunakan untuk preview.
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
                                    onClick={() => router.visit(backUrl)}
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
                {readOnly && book ? <BookReviews book={book} /> : null}
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
    onChange?: (value: string) => void;
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
                onChange={(event) => onChange?.(event.target.value)}
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

function BookReviews({ book }: { book: PublisherBook }) {
    const [data] = usePublisherData();
    const reviews = data.reviews
        .filter((review) => review.bookId === book.id)
        .sort((first, second) => second.date.localeCompare(first.date));
    const average = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return (
        <section className="ikapi-panel ikapi-panel-pad ikapi-book-reviews">
            <div className="ikapi-book-form-heading">
                <div>
                    <h2>Ulasan pembeli</h2>
                    <p>
                        {reviews.length
                            ? `${reviews.length} ulasan · rata-rata ${average.toLocaleString('id-ID', { maximumFractionDigits: 1 })} dari 5 bintang`
                            : 'Belum ada ulasan untuk buku ini.'}
                    </p>
                </div>
                <Button
                    asChild
                    variant="outline"
                    className="ikapi-button ikapi-button-secondary"
                >
                    <Link
                        href={
                            '/prototype/penerbit/ulasan?buku=' +
                            encodeURIComponent(book.id)
                        }
                    >
                        Buka semua ulasan
                    </Link>
                </Button>
            </div>
            {reviews.length ? (
                <div className="ikapi-reviews ikapi-book-review-list">
                    {reviews.map((review) => (
                        <article className="ikapi-review-card" key={review.id}>
                            <div className="ikapi-review-head">
                                <div className="ikapi-review-meta">
                                    <strong>{review.displayName}</strong>
                                    <span>{formatDate(review.date)}</span>
                                </div>
                                <span
                                    className="ikapi-stars"
                                    role="img"
                                    aria-label={
                                        review.rating + ' dari 5 bintang'
                                    }
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={15}
                                            fill={
                                                star <= review.rating
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                    ))}
                                </span>
                            </div>
                            <p>{review.comment}</p>
                            {review.reply ? (
                                <div className="ikapi-review-reply">
                                    <strong>Balasan penerbit</strong>
                                    <p>{review.reply}</p>
                                </div>
                            ) : null}
                        </article>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

function MissingBook({ backUrl }: { backUrl: string }) {
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
                                <Link href={backUrl}>
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
