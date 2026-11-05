import { useMemo, useState, type FormEvent } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { MessageSquareReply, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    PageHeading,
    PublisherLayout,
    SectionHeading,
} from '@/prototype/publisher/components';
import { formatDate, usePublisherData } from '@/prototype/publisher/store';

export default function PublisherReviews() {
    const [data, update] = usePublisherData();
    const { url } = usePage();
    const requestedBook = new URL('http://ikapi.local' + url).searchParams.get(
        'buku',
    );
    const [bookFilter, setBookFilter] = useState(() =>
        data.books.some((book) => book.id === requestedBook)
            ? requestedBook!
            : 'all',
    );
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const reviews = useMemo(
        () =>
            [...data.reviews]
                .filter(
                    (review) =>
                        bookFilter === 'all' || review.bookId === bookFilter,
                )
                .sort((a, b) => b.date.localeCompare(a.date)),
        [bookFilter, data.reviews],
    );

    function reply(reviewId: string, event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const message = (drafts[reviewId] ?? '').trim();
        if (!message) {
            setErrors((current) => ({
                ...current,
                [reviewId]: 'Balasan komentar tidak boleh kosong.',
            }));
            return;
        }
        update((current) => ({
            ...current,
            reviews: current.reviews.map((review) =>
                review.id === reviewId ? { ...review, reply: message } : review,
            ),
        }));
        setDrafts((current) => ({ ...current, [reviewId]: '' }));
        setErrors((current) => ({ ...current, [reviewId]: '' }));
        toast.success('Balasan penerbit berhasil dikirim.');
    }

    return (
        <>
            <Head title="Ulasan pembaca" />
            <PublisherLayout active="reviews">
                <PageHeading
                    title="Ulasan pembaca"
                    description="Baca komentar pada buku terbitan Anda dan balas percakapan yang perlu ditanggapi."
                />
                <section className="ikapi-panel ikapi-panel-pad ikapi-review-list-panel">
                    <SectionHeading
                        title="Komentar dan ulasan"
                        detail={reviews.length + ' ulasan'}
                        action={
                            <div className="ikapi-field ikapi-review-filter">
                                <label htmlFor="review-book-filter">
                                    Filter buku
                                </label>
                                <select
                                    id="review-book-filter"
                                    value={bookFilter}
                                    onChange={(event) =>
                                        setBookFilter(event.target.value)
                                    }
                                >
                                    <option value="all">Semua buku</option>
                                    {data.books.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        }
                    />
                    {reviews.length ? (
                        <div className="ikapi-reviews">
                            {reviews.map((review) => {
                                const error = errors[review.id];
                                return (
                                    <article
                                        className="ikapi-review-card"
                                        key={review.id}
                                    >
                                        <div className="ikapi-review-head">
                                            <div className="ikapi-review-meta">
                                                <strong>
                                                    {review.displayName}
                                                </strong>
                                                <span>
                                                    {review.bookTitle} ·{' '}
                                                    {formatDate(review.date)}
                                                </span>
                                            </div>
                                            <span
                                                className="ikapi-stars"
                                                role="img"
                                                aria-label={
                                                    review.rating +
                                                    ' dari 5 bintang'
                                                }
                                            >
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={15}
                                                        fill={
                                                            star <=
                                                            review.rating
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
                                                <strong>
                                                    Balasan penerbit
                                                </strong>
                                                <p>{review.reply}</p>
                                            </div>
                                        ) : (
                                            <form
                                                className="ikapi-reply-form"
                                                onSubmit={(event) =>
                                                    reply(review.id, event)
                                                }
                                                noValidate
                                            >
                                                <div className="ikapi-field">
                                                    <label
                                                        htmlFor={
                                                            'reply-' + review.id
                                                        }
                                                    >
                                                        Balas komentar
                                                    </label>
                                                    <textarea
                                                        id={
                                                            'reply-' + review.id
                                                        }
                                                        value={
                                                            drafts[review.id] ??
                                                            ''
                                                        }
                                                        aria-invalid={Boolean(
                                                            error,
                                                        )}
                                                        aria-describedby={
                                                            error
                                                                ? 'reply-error-' +
                                                                  review.id
                                                                : undefined
                                                        }
                                                        onChange={(event) => {
                                                            setDrafts(
                                                                (current) => ({
                                                                    ...current,
                                                                    [review.id]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                }),
                                                            );
                                                            setErrors(
                                                                (current) => ({
                                                                    ...current,
                                                                    [review.id]:
                                                                        '',
                                                                }),
                                                            );
                                                        }}
                                                        placeholder="Tulis balasan yang membantu pembaca"
                                                    />
                                                    {error ? (
                                                        <span
                                                            className="ikapi-field-error"
                                                            id={
                                                                'reply-error-' +
                                                                review.id
                                                            }
                                                            role="alert"
                                                        >
                                                            {error}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <Button
                                                    type="submit"
                                                    className="ikapi-button ikapi-button-secondary"
                                                >
                                                    <MessageSquareReply
                                                        size={16}
                                                        aria-hidden="true"
                                                    />
                                                    Kirim balasan
                                                </Button>
                                            </form>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="ikapi-review-empty">
                            <h3>Belum ada ulasan untuk buku ini</h3>
                            <p>Pilih buku lain atau kembali ke semua ulasan.</p>
                            <Button
                                variant="outline"
                                className="ikapi-button ikapi-button-secondary"
                                onClick={() => setBookFilter('all')}
                            >
                                Lihat semua ulasan
                            </Button>
                        </div>
                    )}
                </section>
            </PublisherLayout>
        </>
    );
}
