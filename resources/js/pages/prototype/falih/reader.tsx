import React from 'react';
import ReaderScreen from '@/prototype/falih/screens/ReaderScreen';

export default function ReaderPage() {
    // Check if URL has ?book= query param
    let initialBook = 'B01';
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const bookParam = params.get('book');
        if (bookParam) initialBook = bookParam;
    }
    return <ReaderScreen initialBookId={initialBook} />;
}
