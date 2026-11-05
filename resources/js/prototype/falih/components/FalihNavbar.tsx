import React from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingCart, BookOpen, MessageSquare, ArrowLeft, RotateCcw, Store } from 'lucide-react';
import { useFalihStore, resetAllFalihData } from '../store';
import { toast } from 'sonner';

interface FalihNavbarProps {
    activeTab: 'katalog' | 'cart' | 'reader' | 'reviews' | 'hub';
}

export const FalihNavbar: React.FC<FalihNavbarProps> = ({ activeTab }) => {
    const { cartSummary } = useFalihStore();

    const handleReset = () => {
        if (confirm('Reset seluruh data keranjang, progress membaca, bookmark, dan ulasan kembali ke kondisi awal?')) {
            resetAllFalihData();
            toast.success('Seluruh data simulasi prototype berhasil di-reset!');
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e3e2e0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand & Context */}
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/prototype/falih" 
                            className="flex items-center gap-2.5 font-semibold text-gray-900 hover:opacity-85 transition"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#0075de] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                IK
                            </div>
                            <div>
                                <span className="text-base tracking-tight font-bold text-[#111111]">IKAPI Jabar</span>
                                <span className="text-xs text-gray-500 block font-normal -mt-0.5">Marketplace E-Book</span>
                            </div>
                        </Link>

                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#0075de] border border-blue-200">
                            Modul Falih (F03/F04/UC 07, 09, 10, 18, 19, 20)
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href="/prototype/falih/katalog"
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition ${
                                activeTab === 'katalog'
                                    ? 'bg-[#e6f3fe] text-[#0075de] font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <Store className="w-4 h-4" />
                            <span>Katalog</span>
                        </Link>

                        <Link
                            href="/prototype/falih/keranjang"
                            className={`relative px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition ${
                                activeTab === 'cart'
                                    ? 'bg-[#e6f3fe] text-[#0075de] font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Keranjang</span>
                            {cartSummary.totalItems > 0 && (
                                <span className="ml-0.5 px-1.5 py-0.2 bg-[#0075de] text-white rounded-full text-[11px] font-bold leading-none animate-pulse">
                                    {cartSummary.totalItems}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/prototype/falih/reader"
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition ${
                                activeTab === 'reader'
                                    ? 'bg-[#e6f3fe] text-[#0075de] font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>E-Reader</span>
                        </Link>

                        <Link
                            href="/prototype/falih/ulasan"
                            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition ${
                                activeTab === 'reviews'
                                    ? 'bg-[#e6f3fe] text-[#0075de] font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Ulasan & Evaluasi</span>
                        </Link>
                    </nav>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            title="Reset data simulasi prototype"
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        <Link
                            href="/prototype"
                            className="hidden md:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-md transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Hub Utama</span>
                        </Link>

                        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                F
                            </div>
                            <span className="hidden lg:inline text-xs font-medium text-gray-700">
                                Falih A. F.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
