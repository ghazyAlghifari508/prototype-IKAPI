import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Star, MessageSquare, Send, ShieldCheck, 
    AlertTriangle, CheckCircle2, Award, CornerDownRight,
    Lock, Unlock, Filter
} from 'lucide-react';
import { BuyerLayout, PageHeading } from '../components/BuyerLayout';
import { 
    useFalihStore, submitComment, submitEvaluation, 
    EvaluationInput, isBookPaidByBuyer, togglePaidStatusForDemo
} from '../store';
import { toast } from 'sonner';
import '@/prototype/publisher/styles.css';

export default function ReviewsScreen() {
    const { books, getReviews } = useFalihStore();

    // Selected book for reviewing
    const [selectedBookId, setSelectedBookId] = useState<string>('B01');
    const activeBook = books.find(b => b.id === selectedBookId) || books[0];
    const bookReviews = getReviews(activeBook.id);
    const isPaid = isBookPaidByBuyer(activeBook.id);
    const [reviewFilter, setReviewFilter] = useState<'all' | 'evaluated' | 'fiveStar'>('all');

    const handleTogglePaid = () => {
        const res = togglePaidStatusForDemo(activeBook.id);
        toast.info(res.message);
    };

    const displayedReviews = bookReviews.filter(r => {
        if (reviewFilter === 'evaluated') return !!r.evaluationScores;
        if (reviewFilter === 'fiveStar') return r.rating === 5;
        return true;
    });

    // UC-07 State: Quick Comment Form
    const [commentInput, setCommentInput] = useState('');
    const [commentErrorHtml, setCommentErrorHtml] = useState<string | null>(null);

    // UC-20 State: Structured Publisher Evaluation Questionnaire
    const [showEvalModal, setShowEvalModal] = useState(false);
    const [evalForm, setEvalForm] = useState<EvaluationInput>({
        overallRating: 5,
        expectation: 5,
        usefulness: 5,
        priceValue: 5,
        repeatBuy: 5,
        testimonialText: ''
    });
    const [evalError, setEvalError] = useState<string | null>(null);

    // Handle Quick Comment Submit (UC-07)
    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCommentErrorHtml(null);

        const res = submitComment(activeBook.id, commentInput, 'Ahmad Budiman');
        if (res.success) {
            toast.success(res.message);
            setCommentInput('');
            setCommentErrorHtml(null);
        } else {
            // Alternative Scenario 4.a: Smart Filter deteksi kata kasar
            toast.error(res.message, {
                description: 'Mohon perbaiki kata-kata yang telah ditandai di bawah kolom komentar.',
                duration: 5000
            });
            if (res.filterResult.highlightedHtml) {
                setCommentErrorHtml(res.filterResult.highlightedHtml);
            }
        }
    };

    // Handle Questionnaire Evaluation Submit (UC-20)
    const handleEvaluationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setEvalError(null);

        const res = submitEvaluation(activeBook.id, {
            ...evalForm,
            userName: 'Ahmad Budiman'
        });
        if (res.success) {
            toast.success(res.message, { duration: 5000 });
            setShowEvalModal(false);
            setEvalForm({
                overallRating: 5,
                expectation: 5,
                usefulness: 5,
                priceValue: 5,
                repeatBuy: 5,
                testimonialText: ''
            });
        } else {
            setEvalError(res.message);
            toast.warning(res.message);
        }
    };

    // Calculate rating averages
    const avgRating = bookReviews.length > 0
        ? (bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length).toFixed(1)
        : activeBook.rating.toFixed(1);

    return (
        <>
            <Head title="Ulasan & Evaluasi Buku - IKAPI Jawa Barat" />
            <BuyerLayout active="reviews">
                <PageHeading
                    eyebrow="Komunitas Pembaca IKAPI"
                    title="Ulasan & evaluasi buku"
                    description="Baca respons pembaca pada buku digital, berikan tanggapan terverifikasi, dan sampaikan kuesioner mutu untuk penerbit."
                    action={
                        isPaid ? (
                            <button
                                onClick={() => setShowEvalModal(true)}
                                className="ikapi-button ikapi-button-primary flex items-center gap-2 cursor-pointer"
                            >
                                <Award size={16} />
                                <span>Isi Kuesioner Evaluasi (UC-20)</span>
                            </button>
                        ) : null
                    }
                />

                {/* Filter and Top Overview Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Book Details & Rating Stats */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Book Selection Card */}
                        <div className="ikapi-panel ikapi-panel-pad space-y-4">
                            <div className="ikapi-field">
                                <label htmlFor="select-book" className="font-bold text-xs uppercase tracking-wider text-[#62635e]">
                                    Pilih Buku Naskah:
                                </label>
                                <select
                                    id="select-book"
                                    value={selectedBookId}
                                    onChange={e => setSelectedBookId(e.target.value)}
                                    className="text-sm rounded-lg"
                                >
                                    {books.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.title} — {b.author}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3.5 pt-3 border-t border-[var(--line)]">
                                <img
                                    src={activeBook.coverImage}
                                    alt={activeBook.title}
                                    className="w-16 h-24 object-cover rounded-md shadow-xs border border-[var(--line)] shrink-0"
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold text-[#a33b46] uppercase tracking-wider block truncate">
                                        {activeBook.category}
                                    </span>
                                    <h3 className="font-serif font-bold text-[var(--ink)] text-sm leading-snug line-clamp-2 mt-0.5">
                                        {activeBook.title}
                                    </h3>
                                    <p className="text-xs text-[var(--muted)] mt-1">
                                        {activeBook.author}
                                    </p>
                                    <p className="text-[11px] text-[var(--muted)] opacity-80">
                                        Penerbit: {activeBook.publisher}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rating Summary Card */}
                        <div className="ikapi-panel ikapi-panel-pad">
                            <div className="ikapi-section-heading">
                                <h2>Skor Kepuasan Pembaca</h2>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="font-serif text-4xl font-bold text-[var(--ink)]">
                                    {avgRating}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={16} className="fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[var(--muted)]">
                                        Berdasarkan {bookReviews.length} ulasan terverifikasi
                                    </span>
                                </div>
                            </div>

                            {/* Payment Status Gate (Catatan Rapat 22 Okt: yg penting udah bayar udah boleh ngulas) */}
                            <div className="pt-3 border-t border-[var(--line)] space-y-2.5">
                                {isPaid ? (
                                    <div className="p-3 rounded-lg border text-xs" style={{ background: 'var(--green-wash)', borderColor: 'var(--line)', color: 'var(--green)' }}>
                                        <div className="flex items-center justify-between font-bold mb-1">
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle2 size={15} />
                                                <span>Pembayaran Lunas</span>
                                            </span>
                                            <button 
                                                onClick={handleTogglePaid}
                                                className="text-[11px] text-[var(--muted)] hover:text-[var(--ink)] underline cursor-pointer"
                                                title="Ubah simulasi status bayar"
                                            >
                                                Ubah Simulasi
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-[var(--ink)] opacity-80">
                                            Hak mengulas dan evaluasi mutu aktif. Anda tercatat sebagai pembeli sah naskah ini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-3.5 rounded-lg border text-xs space-y-2" style={{ background: 'var(--amber-wash)', borderColor: 'var(--line)', color: 'var(--amber)' }}>
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <Lock size={15} className="text-[#a33b46]" />
                                            <span>Ulasan Terkunci (Belum Dibeli)</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-[var(--ink)] opacity-85">
                                            Sesuai ketentuan, hanya pembeli yang telah menyelesaikan transaksi pembayaran yang berhak memberikan komentar dan evaluasi mutu.
                                        </p>
                                        <button
                                            onClick={handleTogglePaid}
                                            className="ikapi-button ikapi-button-primary w-full text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <Unlock size={14} />
                                            <span>Simulasikan Sudah Bayar (Buka Akses)</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Smart Content Filter Info */}
                        <div className="p-4 rounded-xl border text-xs space-y-1.5" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
                            <div className="flex items-center gap-1.5 font-bold text-[#a33b46]">
                                <ShieldCheck size={16} />
                                <span>Smart Content Filter (UC-07)</span>
                            </div>
                            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                                Sistem secara otomatis memfilter ujaran kasar dan indikasi spam sebelum ulasan tayang ke publik. Uji coba dengan mengetikkan kata kasar untuk melihat feedback Alternative Scenario 4.a.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Comment Form & Reviews List */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Comment Form (UC-07) */}
                        <div className="ikapi-panel ikapi-panel-pad">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-serif font-bold text-base text-[var(--ink)] flex items-center gap-2">
                                    <MessageSquare size={16} className="text-[#a33b46]" />
                                    <span>Tulis Komentar & Ulasan Naskah</span>
                                </h2>
                                <span className="text-xs text-[var(--muted)]">
                                    {commentInput.length} karakter
                                </span>
                            </div>

                            {!isPaid ? (
                                <div className="p-6 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)] text-center space-y-2">
                                    <Lock size={24} className="text-[var(--muted)] mx-auto opacity-60" />
                                    <h3 className="font-serif font-bold text-sm text-[var(--ink)]">Kolom Ulasan Terkunci</h3>
                                    <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
                                        "Ulasan: yang penting sudah bayar baru boleh ngulas". Selesaikan pembayaran naskah digital ini terlebih dahulu untuk mengaktifkan kolom komentar.
                                    </p>
                                    <button
                                        onClick={handleTogglePaid}
                                        className="ikapi-button ikapi-button-primary inline-flex items-center gap-1.5 text-xs mt-2 cursor-pointer"
                                    >
                                        <Unlock size={14} />
                                        <span>Aktifkan Status Sudah Bayar (Mode Simulasi)</span>
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleCommentSubmit} className="space-y-3">
                                    <div className="ikapi-field">
                                        <textarea
                                            rows={3}
                                            value={commentInput}
                                            onChange={e => {
                                                setCommentInput(e.target.value);
                                                if (commentErrorHtml) setCommentErrorHtml(null);
                                            }}
                                            placeholder="Bagikan tanggapan dan ulasan Anda mengenai buku digital ini..."
                                            className="text-sm"
                                        />

                                        {/* Smart Filter Error Feedback */}
                                        {commentErrorHtml && (
                                            <div className="mt-2 p-3 rounded-lg border border-red-300 bg-red-50 text-xs text-red-900">
                                                <div className="flex items-center gap-1.5 font-bold mb-1">
                                                    <AlertTriangle size={15} className="text-red-600" />
                                                    <span>Peringatan Filter Konten Cerdas:</span>
                                                </div>
                                                <p className="mb-2 text-[11px]">Komentar mengandung kata tidak pantas, mohon sunting sebelum mengirim:</p>
                                                <div 
                                                    className="p-2 bg-white rounded border border-red-200 font-mono text-xs"
                                                    dangerouslySetInnerHTML={{ __html: commentErrorHtml }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                                            <ShieldCheck size={14} className="text-[var(--green)]" />
                                            <span>Sebagai: <strong className="text-[var(--ink)]">Ahmad Budiman (Pembeli Terdaftar)</strong></span>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!commentInput.trim() || commentInput.trim().length < 3}
                                            className="ikapi-button ikapi-button-primary px-5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                        >
                                            <Send size={14} />
                                            <span>Kirim Ulasan</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Reviews Stream */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--line)]">
                                <div className="flex items-center gap-2">
                                    <Filter size={15} className="text-[var(--muted)]" />
                                    <button
                                        onClick={() => setReviewFilter('all')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                            reviewFilter === 'all'
                                                ? 'bg-[#a33b46] text-white'
                                                : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]'
                                        }`}
                                    >
                                        Semua ({bookReviews.length})
                                    </button>
                                    <button
                                        onClick={() => setReviewFilter('evaluated')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                            reviewFilter === 'evaluated'
                                                ? 'bg-[#a33b46] text-white'
                                                : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]'
                                        }`}
                                    >
                                        Kuesioner Mutu ({bookReviews.filter(r => !!r.evaluationScores).length})
                                    </button>
                                    <button
                                        onClick={() => setReviewFilter('fiveStar')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                            reviewFilter === 'fiveStar'
                                                ? 'bg-[#a33b46] text-white'
                                                : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]'
                                        }`}
                                    >
                                        Bintang 5 ({bookReviews.filter(r => r.rating === 5).length})
                                    </button>
                                </div>
                                <span className="flex items-center gap-1 text-[var(--green)] font-semibold text-[11px]">
                                    <ShieldCheck size={14} />
                                    <span>Ulasan terverifikasi lunas</span>
                                </span>
                            </div>

                            {displayedReviews.length === 0 ? (
                                <div className="ikapi-panel ikapi-panel-pad text-center py-10 text-[var(--muted)] text-xs">
                                    Belum ada ulasan untuk filter ini.
                                </div>
                            ) : (
                                displayedReviews.map(r => (
                                    <article key={r.id} className="ikapi-panel ikapi-panel-pad space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                                                    style={{ background: 'var(--coral-wash)', color: 'var(--wine)' }}
                                                >
                                                    {r.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[var(--ink)] text-sm">
                                                            {r.userName}
                                                        </span>
                                                        {r.isVerifiedBuyer && (
                                                            <span 
                                                                className="px-2 py-0.5 text-[10px] font-bold rounded-full border"
                                                                style={{ background: 'var(--green-wash)', color: 'var(--green)', borderColor: 'var(--line)' }}
                                                            >
                                                                Pembeli Lunas
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-[var(--muted)] block -mt-0.5">
                                                        {r.date}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                {[...Array(r.rating)].map((_, i) => (
                                                    <Star key={i} size={15} className="fill-current" />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
                                            {r.commentText}
                                        </p>

                                        {/* Kuesioner Evaluasi 4 Aspek Likert */}
                                        {r.evaluationScores && (
                                            <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                                <div>
                                                    <span className="block text-[10px] text-[var(--muted)]">Ekspektasi:</span>
                                                    <span className="font-bold text-[var(--ink)]">{r.evaluationScores.expectation}/5 ★</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-[var(--muted)]">Kebermanfaatan:</span>
                                                    <span className="font-bold text-[var(--ink)]">{r.evaluationScores.usefulness}/5 ★</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-[var(--muted)]">Kesesuaian Harga:</span>
                                                    <span className="font-bold text-[var(--ink)]">{r.evaluationScores.priceValue}/5 ★</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-[var(--muted)]">Repeat Buy:</span>
                                                    <span className="font-bold text-[var(--ink)]">{r.evaluationScores.repeatBuy}/5 ★</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Publisher Official Reply */}
                                        {r.publisherResponse && (
                                            <div 
                                                className="ml-4 pl-4 border-l-2 p-3 rounded-r-lg space-y-1"
                                                style={{ borderColor: 'var(--wine)', background: 'var(--coral-wash)' }}
                                            >
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#a33b46]">
                                                    <CornerDownRight size={14} />
                                                    <span>Tanggapan Resmi Penerbit ({r.publisherResponse.publisherName})</span>
                                                    <span className="text-[10px] text-[var(--muted)] font-normal">• {r.publisherResponse.responseDate}</span>
                                                </div>
                                                <p className="text-xs text-[var(--ink)] italic">
                                                    "{r.publisherResponse.responseText}"
                                                </p>
                                            </div>
                                        )}
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal: UC-20 Kuesioner Evaluasi Mutu */}
                {showEvalModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-xl w-full p-6 sm:p-7 shadow-2xl text-[var(--ink)] max-h-[90vh] flex flex-col">
                            <div className="flex items-start justify-between pb-3 border-b border-[var(--line)] mb-4">
                                <div>
                                    <span 
                                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                        style={{ background: 'var(--coral-wash)', color: 'var(--wine)', borderColor: 'var(--line)' }}
                                    >
                                        Formulir UC-20 Resmi
                                    </span>
                                    <h3 className="font-serif text-lg font-bold text-[var(--ink)] mt-1">
                                        Kuesioner Evaluasi Mutu Buku & Penerbit
                                    </h3>
                                    <p className="text-xs text-[var(--muted)]">
                                        Naskah: <strong>{activeBook.title}</strong> ({activeBook.publisher})
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowEvalModal(false)}
                                    className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleEvaluationSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                                {evalError && (
                                    <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-red-800 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-red-600 shrink-0" />
                                        <span>{evalError}</span>
                                    </div>
                                )}

                                {/* Overall Rating */}
                                <div>
                                    <label className="block font-bold text-[var(--ink)] mb-1">
                                        Rating Bintang Keseluruhan (1 - 5 Bintang):
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setEvalForm(f => ({ ...f, overallRating: star }))}
                                                className="p-1 hover:scale-110 transition cursor-pointer"
                                            >
                                                <Star
                                                    size={22}
                                                    className={star <= evalForm.overallRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                                                />
                                            </button>
                                        ))}
                                        <span className="font-bold text-[var(--ink)] ml-2 text-sm">{evalForm.overallRating} / 5</span>
                                    </div>
                                </div>

                                {/* 4 Aspek Evaluasi */}
                                <div className="space-y-3 pt-3 border-t border-[var(--line)]">
                                    <p className="font-bold text-[var(--ink)]">4 Aspek Penilaian Skala Likert (1: Sangat Buruk - 5: Sangat Baik):</p>

                                    {[
                                        { key: 'expectation', label: '1. Kesesuaian Isi dengan Sinopsis & Ekspektasi' },
                                        { key: 'usefulness', label: '2. Kebermanfaatan & Relevansi Ilmu/Nilai Cerita' },
                                        { key: 'priceValue', label: '3. Kesesuaian Kualitas Terbitan dengan Harga Jual' },
                                        { key: 'repeatBuy', label: '4. Minat Membaca/Membeli Terbitan Penerbit Ini Lagi' },
                                    ].map(item => (
                                        <div key={item.key} className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-quiet)]">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="font-bold text-[var(--ink)]">{item.label}</span>
                                                <span className="font-bold text-[#a33b46]">Skor: {(evalForm as any)[item.key]}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-1">
                                                {[1, 2, 3, 4, 5].map(val => (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        onClick={() => setEvalForm(f => ({ ...f, [item.key]: val }))}
                                                        className={`flex-1 py-1 text-center font-bold rounded-md border transition cursor-pointer ${
                                                            (evalForm as any)[item.key] === val
                                                                ? 'bg-[#a33b46] text-white border-[#a33b46]'
                                                                : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]'
                                                        }`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Testimonial Text */}
                                <div className="ikapi-field pt-2">
                                    <label htmlFor="eval-testi" className="font-bold text-[var(--ink)]">
                                        Testimoni & Saran Perbaikan untuk Penerbit:
                                    </label>
                                    <textarea
                                        id="eval-testi"
                                        rows={3}
                                        value={evalForm.testimonialText}
                                        onChange={e => setEvalForm(f => ({ ...f, testimonialText: e.target.value }))}
                                        placeholder="Tuliskan ulasan mendalam Anda untuk membantu penerbit meningkatkan mutu buku..."
                                        className="text-xs"
                                    />
                                </div>

                                <div className="pt-3 border-t border-[var(--line)] flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEvalModal(false)}
                                        className="ikapi-button ikapi-button-secondary text-xs cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="ikapi-button ikapi-button-primary text-xs cursor-pointer"
                                    >
                                        Kirim Kuesioner Evaluasi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </BuyerLayout>
        </>
    );
}
