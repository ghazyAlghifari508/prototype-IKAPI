/**
 * Smart Content Filter untuk UC-07: Memberikan Komentar & Ulasan
 * Mendeteksi kata-kata kasar, ujaran tidak pantas, dan spam.
 */

const INAPPROPRIATE_WORDS = [
    // Kata kasar & umpatan (Indonesian & slang)
    'anjing', 'babi', 'bangsat', 'goblok', 'tolol', 'kampret', 'kontol', 'memek',
    'asu', 'bajingan', 'bejad', 'bodoh', 'brengsek', 'tai', 'pantek', 'pecundang',
    'idiot', 'perek', 'lonte', 'monyet',
    // Spam & penipuan
    'slot', 'judol', 'gacor', 'togel', 'situs judi', 'pinjol', 'penipu',
    'wa.me', 'hubungi no', 'klik link'
];

export interface FilterResult {
    isValid: boolean;
    flaggedWords: string[];
    highlightedHtml?: string;
    errorMessage?: string;
}

export function filterCommentContent(text: string): FilterResult {
    const trimmed = text.trim();
    if (!trimmed) {
        return {
            isValid: false,
            flaggedWords: [],
            errorMessage: 'Komentar tidak boleh kosong atau hanya berupa spasi.'
        };
    }

    const lower = trimmed.toLowerCase();
    const flagged: string[] = [];

    for (const badWord of INAPPROPRIATE_WORDS) {
        const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
        if (regex.test(lower)) {
            flagged.push(badWord);
        }
    }

    if (flagged.length > 0) {
        // Highlight flagged words for the user to correct (Alternative Scenario 4.a.4)
        let highlighted = trimmed;
        for (const badWord of flagged) {
            const regex = new RegExp(`(${badWord})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark class="bg-red-200 text-red-900 px-1 rounded font-semibold">$1</mark>');
        }

        return {
            isValid: false,
            flaggedWords: flagged,
            highlightedHtml: highlighted,
            errorMessage: `Komentar mengandung kata yang tidak pantas (${flagged.map(w => `"${w}"`).join(', ')}), mohon perbaiki ulasan Anda.`
        };
    }

    return {
        isValid: true,
        flaggedWords: []
    };
}
