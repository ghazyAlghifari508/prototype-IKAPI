import React, { useState } from 'react';
import { 
    Star, MessageSquare, Send, ThumbsUp, ShieldCheck, 
    AlertTriangle, CheckCircle2, Award, Sparkles, Filter, CornerDownRight 
} from 'lucide-react';
import { FalihNavbar } from '../components/FalihNavbar';
import { 
    useFalihStore, submitComment, submitEvaluation, 
    EvaluationInput 
} from '../store';
import { toast } from 'sonner';
import '../styles.css';

export default function ReviewsScreen() {
    const { books, getReviews } = useFalihStore();

    // Selected book for reviewing
    const [selectedBookId, setSelectedBookId] = useState<string>('B01');
    const activeBook = books.find(b => b.id === selectedBookId) || books[0];
    const bookReviews = getReviews(activeBook.id);

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

        const res = submitComment(activeBook.id, commentInput, 'Falih Afnan Fauzi');
        if (res.success) {
            toast.success(res.message);
            setCommentInput('');
            setCommentErrorHtml(null);
        } else {
            // Alternative Scenario 4.a: Smart Filter deteksi kata kasar
            toast.error(res.message, {
                description: 'Mohon perbaiki kata-kata yang telah ditandai di bawah kolom input.',
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

        const res = submitEvaluation(activeBook.id, evalForm);
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
            // Alternative Scenario 2.a: Form belum lengkap
            setEvalError(res.message);
            toast.warning(res.message);
        }
    };

    // Calculate rating averages
    const avgRating = bookReviews.length > 0
        ? (bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length).toFixed(1)
        : activeBook.rating.toFixed(1);

    return (
        <div className="falih-layout flex flex-col min-h-screen">
            <FalihNavbar activeTab="reviews" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e3e2e0] pb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="falih-pill bg-blue-100 text-[#0075de]">
                                UC-07 & UC-20
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Ulasan Pembaca, Komentar Komunitas & Evaluasi Mutu Penerbit
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
                            Ulasan & Evaluasi Buku
                        </h1>
                    </div>

                    {/* Book Selector Dropdown */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-600">Pilih Buku:</label>
                        <select
                            value={selectedBookId}
                            onChange={e => setSelectedBookId(e.target.value)}
                            className="text-xs py-1.5 px-3 rounded-md border border-gray-300 bg-white font-medium focus:outline-hidden focus:border-[#0075de]"
                        >
                            {books.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.title} ({b.author})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Rating Statistics & Evaluation Trigger */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Book Mini Card */}
                        <div className="falih-card p-5 flex items-start gap-3.5">
                            <img
                                src={activeBook.coverImage}
                                alt={activeBook.title}
                                className="w-16 h-24 object-cover rounded-md shadow-xs border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                                <span className="text-[11px] font-bold text-[#0075de] uppercase tracking-wider block truncate">
                                    {activeBook.category}
                                </span>
                                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                                    {activeBook.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {activeBook.author}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    Penerbit: {activeBook.publisher}
                                </p>
                            </div>
                        </div>

                        {/* Overall Rating Card */}
                        <div className="falih-card p-6">
                            <h2 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                                Skor Kepuasan Pembaca
                            </h2>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="text-4xl font-extrabold text-gray-900">
                                    {avgRating}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        Berdasarkan {bookReviews.length} ulasan terverifikasi
                                    </span>
                                </div>
                            </div>

                            {/* Evaluation CTA Button (UC-20) */}
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                    Sudah selesai membaca? Bagikan evaluasi mutu penerbit dan testimoni pengalaman membaca Anda.
                                </p>
                                <button
                                    onClick={() => setShowEvalModal(true)}
                                    className="falih-btn-primary w-full py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                                >
                                    <Award className="w-4 h-4" />
                                    <span>Isi Kuesioner Evaluasi (UC-20)</span>
                                </button>
                            </div>
                        </div>

                        {/* Smart Filter Info Callout */}
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold">
                                <ShieldCheck className="w-4 h-4 text-amber-700" />
                                <span>Smart Content Filter Aktif (UC-07)</span>
                            </div>
                            <p className="leading-relaxed opacity-90 text-[11px]">
                                Sistem otomatis memfilter kata kasar, ujaran sara, dan indikasi spam sebelum komentar dipublikasikan. Coba masukkan kata kasar untuk menguji respon validasi Alternative Scenario 4.a!
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Quick Comment Form & Reviews Stream */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* UC-07: Form Memberikan Komentar Cepat */}
                        <div className="falih-card p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-[#0075de]" />
                                    <span>Tulis Tanggapan & Komentar (UC-07)</span>
                                </h2>
                                <span className="text-xs text-gray-400 font-medium">
                                    {commentInput.length} karakter
                                </span>
                            </div>

                            <form onSubmit={handleCommentSubmit} className="space-y-3">
                                <div>
                                    <textarea
                                        rows={3}
                                        value={commentInput}
                                        onChange={e => {
                                            setCommentInput(e.target.value);
                                            if (commentErrorHtml) setCommentErrorHtml(null);
                                        }}
                                        placeholder="Bagikan tanggapan Anda mengenai buku ini (teks valid minimal 5 karakter)..."
                                        className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                                    />

                                    {/* Smart Filter Error Feedback (UC-07 Alternative Flow 4.a) */}
                                    {commentErrorHtml && (
                                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 fade-in-slide">
                                            <div className="flex items-center gap-1.5 font-bold mb-1">
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                                <span>Peringatan Filter Konten:</span>
                                            </div>
                                            <p className="mb-2">Komentar mengandung kata yang tidak pantas, mohon perbaiki ulasan Anda:</p>
                                            <div 
                                                className="p-2 bg-white rounded border border-red-200 font-mono text-xs"
                                                dangerouslySetInnerHTML={{ __html: commentErrorHtml }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-[11px] text-gray-400">
                                        Posting sebagai: <span className="font-semibold text-gray-700">Falih Afnan Fauzi (Pembeli)</span>
                                    </div>

                                    {/* Tombol hanya aktif jika input valid (UC-07 Main Flow 2) */}
                                    <button
                                        type="submit"
                                        disabled={!commentInput.trim() || commentInput.trim().length < 3}
                                        className="falih-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:pointer-events-none"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Kirim Komentar</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Feed Komentar & Ulasan Publik */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
                                <span>Daftar Ulasan & Diskusi Publik ({bookReviews.length})</span>
                                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Seluruh pembeli terverifikasi</span>
                                </span>
                            </div>

                            {bookReviews.map(r => (
                                <div key={r.id} className="falih-card p-5 space-y-3 hover:border-gray-300 transition">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0075de] font-bold text-xs flex items-center justify-center">
                                                {r.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        {r.userName}
                                                    </span>
                                                    {r.isVerifiedBuyer && (
                                                        <span className="falih-pill bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                                                            Pembeli Resmi
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-gray-400 block -mt-0.5">
                                                    {r.date}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Star rating */}
                                        <div className="flex items-center gap-0.5 text-amber-400">
                                            {[...Array(r.rating)].map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment Text */}
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                        {r.commentText}
                                    </p>

                                    {/* Evaluation Badges (if from UC-20 Questionnaire) */}
                                    {r.evaluationScores && (
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                            <div className="text-gray-600">
                                                <span className="block text-[10px] text-gray-400">Ekspektasi:</span>
                                                <span className="font-bold text-gray-900">{r.evaluationScores.expectation}/5 ★</span>
                                            </div>
                                            <div className="text-gray-600">
                                                <span className="block text-[10px] text-gray-400">Kebermanfaatan:</span>
                                                <span className="font-bold text-gray-900">{r.evaluationScores.usefulness}/5 ★</span>
                                            </div>
                                            <div className="text-gray-600">
                                                <span className="block text-[10px] text-gray-400">Kesesuaian Harga:</span>
                                                <span className="font-bold text-gray-900">{r.evaluationScores.priceValue}/5 ★</span>
                                            </div>
                                            <div className="text-gray-600">
                                                <span className="block text-[10px] text-gray-400">Repeat Buy:</span>
                                                <span className="font-bold text-gray-900">{r.evaluationScores.repeatBuy}/5 ★</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Official Publisher Response Showcase */}
                                    {r.publisherResponse && (
                                        <div className="ml-4 pl-4 border-l-2 border-[#0075de] bg-blue-50/50 p-3 rounded-r-lg space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0075de]">
                                                <CornerDownRight className="w-3.5 h-3.5" />
                                                <span>Balasan Resmi Penerbit ({r.publisherResponse.publisherName})</span>
                                                <span className="text-[10px] text-gray-400 font-normal">• {r.publisherResponse.responseDate}</span>
                                            </div>
                                            <p className="text-xs text-gray-700 italic">
                                                "{r.publisherResponse.responseText}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal: UC-20 Kuesioner Evaluasi Mutu Penerbit & Buku */}
            {showEvalModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-7 shadow-2xl text-gray-900 max-h-[90vh] flex flex-col fade-in-slide">
                        <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
                            <div>
                                <span className="falih-pill bg-blue-50 text-[#0075de] border border-blue-200 text-[10px] mb-1">
                                    Formulir UC-20 Resmi
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Kuesioner Evaluasi Mutu Buku & Penerbit
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {activeBook.title} • {activeBook.publisher}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowEvalModal(false)}
                                className="text-gray-400 hover:text-gray-700 text-sm p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {evalError && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{evalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleEvaluationSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {/* Star Rating Overall */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    1. Rating Kepuasan Keseluruhan (Bintang 1 - 5)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setEvalForm({ ...evalForm, overallRating: star })}
                                            className="p-1 hover:scale-110 transition"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${
                                                    star <= evalForm.overallRating
                                                        ? 'text-amber-400 fill-amber-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-gray-600 ml-2">
                                        {evalForm.overallRating} dari 5 Bintang
                                    </span>
                                </div>
                            </div>

                            {/* 4 Likert Scale Questions from Scenario Specification */}
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    2. Kuesioner Evaluasi Kualitas Penerbit (Skala 1 s.d. 5)
                                </label>

                                {[
                                    { key: 'expectation', title: '(a) Kesesuaian Buku dengan Ekspektasi' },
                                    { key: 'usefulness', title: '(b) Kebermanfaatan Isi Naskah & Wawasan' },
                                    { key: 'priceValue', title: '(c) Kesesuaian Harga Terhadap Mutu' },
                                    { key: 'repeatBuy', title: '(d) Peluang Membeli Lagi Buku dari Penerbit Ini' }
                                ].map(item => (
                                    <div key={item.key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between text-xs font-semibold text-gray-800 mb-2">
                                            <span>{item.title}</span>
                                            <span className="text-[#0075de] font-bold">
                                                Skor: {(evalForm as any)[item.key]} / 5
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-[10px] text-gray-400">1 (Rendah)</span>
                                            <div className="flex items-center gap-3">
                                                {[1, 2, 3, 4, 5].map(val => (
                                                    <label key={val} className="flex flex-col items-center gap-1 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={item.key}
                                                            value={val}
                                                            checked={(evalForm as any)[item.key] === val}
                                                            onChange={() => setEvalForm({ ...evalForm, [item.key]: val })}
                                                            className="text-[#0075de] focus:ring-[#0075de]"
                                                        />
                                                        <span className="text-[11px] font-bold text-gray-600">{val}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-gray-400">5 (Sangat Baik)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Detailed Testimonial Text */}
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    3. Testimoni Ulasan Pengalaman Membaca
                                </label>
                                <textarea
                                    rows={3}
                                    value={evalForm.testimonialText}
                                    onChange={e => setEvalForm({ ...evalForm, testimonialText: e.target.value })}
                                    placeholder="Tuliskan ulasan mendalam mengenai gaya penulisan, manfaat materi, dan rekomendasi bagi pembaca lain..."
                                    className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#0075de]"
                                />
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEvalModal(false)}
                                    className="px-4 py-2 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="falih-btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Kirim Evaluasi & Ulasan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
