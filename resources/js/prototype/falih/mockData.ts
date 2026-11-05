export interface Book {
    id: string;
    slug: string;
    title: string;
    author: string;
    publisher: string;
    category: string;
    price: number;
    coverImage: string;
    rating: number;
    reviewCount: number;
    synopsis: string;
    isbn: string;
    totalPages: number;
    publishedYear: number;
    chapters: {
        title: string;
        page: number;
        content: string[];
    }[];
}

export interface ReviewComment {
    id: string;
    bookId: string;
    userName: string;
    userAvatar?: string;
    date: string;
    rating: number;
    commentText: string;
    isVerifiedBuyer: boolean;
    publisherResponse?: {
        publisherName: string;
        responseDate: string;
        responseText: string;
    };
    evaluationScores?: {
        expectation: number;   // 1-5
        usefulness: number;    // 1-5
        priceValue: number;    // 1-5
        repeatBuy: number;     // 1-5
    };
}

export interface Bookmark {
    id: string;
    bookId: string;
    pageNumber: number;
    chapterTitle: string;
    excerpt: string;
    createdAt: string;
}

export const MOCK_BOOKS: Book[] = [
    {
        id: 'B01',
        slug: 'jane-austen/pride-and-prejudice',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        publisher: 'Standard Ebooks Indonesia',
        category: 'Sastra & Fiksi Klasik',
        price: 45000,
        coverImage: '/images/covers/B01.jpg',
        rating: 4.8,
        reviewCount: 38,
        isbn: '978-602-03-8812-1',
        totalPages: 24,
        publishedYear: 2024,
        synopsis: 'Kisah klasik tentang etika, pendidikan, pernikahan, dan status sosial di kalangan bangsawan pedesaan Inggris pada awal abad ke-19, berpusat pada tokoh Elizabeth Bennet dan Mr. Darcy.',
        chapters: [
            {
                title: 'Bab I: Pertemuan di Meryton',
                page: 1,
                content: [
                    'Merupakan suatu kebenaran yang diakui secara universal bahwa seorang laki-laki lajang dengan kekayaan yang cukup pasti membutuhkan seorang istri.',
                    'Namun sedikit yang diketahui tentang perasaan atau pandangan orang seperti itu saat pertama kali memasuki suatu lingkungan; kebenaran ini begitu tertanam kuat di benak keluarga-keluarga di sekitarnya sehingga ia dianggap sebagai hak sah dari salah satu putri mereka.',
                    '"Bennet yang baik," kata istrinya kepadanya suatu hari, "pernahkah engkau mendengar bahwa Netherfield Park akhirnya disewa orang?" Mr. Bennet menjawab bahwa ia belum pernah mendengarnya.',
                    '"Tapi memang sudah," balas sang istri; "karena Mrs. Long baru saja ke sini, dan dia menceritakan semuanya kepadaku." Mr. Bennet tidak memberikan jawaban.',
                    '"Tidakkah engkau ingin tahu siapa yang menyewanya?" seru istrinya dengan tidak sabar. "Engkau ingin menceritakannya kepadaku, dan aku tidak berkeberatan untuk mendengarkannya."'
                ]
            },
            {
                title: 'Bab II: Kunjungan Tak Terduga',
                page: 7,
                content: [
                    'Mr. Bennet termasuk orang pertama yang mengunjungi Mr. Bingley. Sejak awal ia bermaksud untuk mengunjunginya, meskipun ia selalu meyakinkan istrinya hingga saat-saat terakhir bahwa ia tidak akan pergi.',
                    'Ketika kunjungan itu selesai dan diketahui oleh keluarganya pada malam harinya, kegembiraan yang meluap memenuhi ruangan. Rasa ingin tahu para gadis muda tentang pria tampan dan kaya itu tak terbendung.',
                    '"Betapa hebatnya engkau, Ayah!" seru Lydia dengan riang. "Sekarang kami bisa berdansa dengannya di pesta dansa berikutnya."',
                    'Elizabeth hanya tersenyum tipis, mengamati ibunya yang kembali sibuk merencanakan pesta penyambutan dengan segala keramahan desa.'
                ]
            },
            {
                title: 'Bab III: Dansa dan Prasangka',
                page: 15,
                content: [
                    'Malam pesta dansa di aula pertemuan Meryton akhirnya tiba. Semua mata tertuju pada kedatangan rombongan dari Netherfield Park: Mr. Bingley yang ramah, saudara-saudaranya yang anggun, dan seorang teman prianya—Mr. Darcy.',
                    'Mr. Darcy segera menarik perhatian seluruh ruangan dengan perawakannya yang tegap, ketampanannya, dan kabar bahwa penghasilannya mencapai sepuluh ribu pound setahun.',
                    'Namun sebelum pesta dansa berakhir, sikapnya yang dingin dan keengganannya untuk berbaur mengubah kekaguman publik menjadi kecaman keras.',
                    '"Dia tidak cukup cantik untuk menggodaku," bisik Mr. Darcy dingin ketika disarankan untuk mengajak Elizabeth Bennet berdansa. Elizabeth, yang mendengar perkataan itu tanpa sengaja, hanya tertawa kecil dengan rasa harga diri yang terusik.'
                ]
            }
        ]
    },
    {
        id: 'B02',
        slug: 'mary-shelley/frankenstein',
        title: 'Frankenstein: Sang Prometheus Modern',
        author: 'Mary Shelley',
        publisher: 'Pustaka Literasi Jawa Barat',
        category: 'Fiksi Ilmiah & Sastra',
        price: 39000,
        coverImage: '/images/covers/B02.jpg',
        rating: 4.6,
        reviewCount: 24,
        isbn: '978-602-03-7761-3',
        totalPages: 20,
        publishedYear: 2023,
        synopsis: 'Eksplorasi mendalam mengenai ambisi ilmuwan muda Victor Frankenstein yang berhasil menciptakan makhluk hidup bernyawa, namun kemudian dihadapkan pada konsekuensi etis dan tragedi kehancuran kemanusiaan.',
        chapters: [
            {
                title: 'Surat I: Ekspedisi Kutub Utara',
                page: 1,
                content: [
                    'Kepada Mrs. Saville, Inggris. St. Petersburgh, 11 Desember.',
                    'Engkau akan bersukacita mendengar bahwa tidak ada bencana yang menyertai awal perjalanan yang telah engkau pandang dengan berbagai firasat buruk ini.',
                    'Aku tiba di sini kemarin, dan tugas pertamaku adalah meyakinkan saudariku tersayang tentang kesejahteraanku serta keyakinanku yang kian bertambah akan keberhasilan usahaku.',
                    'Aku sudah berada jauh di utara London, dan saat aku berjalan di jalanan Petersburgh, aku merasakan angin utara yang dingin menyapa pipiku, yang menguatkan sarafku dan mengisiku dengan kegembiraan.'
                ]
            },
            {
                title: 'Bab IV: Percikan Kehidupan',
                page: 8,
                content: [
                    'Pada suatu malam yang suram di bulan November, aku menyaksikan penyelesaian jerih payahku yang penuh kegelisahan.',
                    'Dengan kecemasan yang hampir menyamai siksaan batin, aku mengumpulkan instrumen kehidupan di sekitarku, agar aku dapat menyalurkan percikan keberadaan ke dalam benda tak bernyawa yang terbaring di kakiku.',
                    'Waktu itu sudah pukul satu dini hari; hujan mengetuk jendela dengan suram, dan lilinku hampir padam, ketika di tengah keremangan cahaya yang berkedip-kedip itu, aku melihat mata kuning kusam dari makhluk itu terbuka perlahan.',
                    'Makhluk itu bernapas dengan berat, dan sebuah gerakan kejang menggetarkan anggota tubuhnya. Betapa dapat aku melukiskan emosiku menghadapi malapetaka ini!'
                ]
            }
        ]
    },
    {
        id: 'B03',
        slug: 'arthur-conan-doyle/the-adventures-of-sherlock-holmes',
        title: 'The Adventures of Sherlock Holmes',
        author: 'Arthur Conan Doyle',
        publisher: 'IKAPI Jabar Publishing Hub',
        category: 'Misteri & Detektif',
        price: 59000,
        coverImage: '/images/covers/B03.jpg',
        rating: 4.9,
        reviewCount: 52,
        isbn: '978-602-04-1298-5',
        totalPages: 28,
        publishedYear: 2024,
        synopsis: 'Kumpulan kasus penyelidikan paling brilian dari detektif legendaris 221B Baker Street, Sherlock Holmes bersama sahabat setianya Dr. John H. Watson, memecahkan teka-teki rumit di London era Victoria.',
        chapters: [
            {
                title: 'Kasus I: Skandal di Bohemia',
                page: 1,
                content: [
                    'Bagi Sherlock Holmes, dia selalu menjadi wanita nomor satu. Jarang sekali aku mendengar dia menyebutnya dengan nama lain. Di matanya, dia melampaui dan mengungguli seluruh kaumnya.',
                    'Bukan berarti Holmes merasakan emosi yang mirip dengan cinta terhadap Irene Adler. Semua emosi, terutama yang satu itu, sangat bertolak belakang dengan pikirannya yang dingin, tepat, namun luar biasa seimbang.',
                    'Aku melihat Holmes berdiri di depan jendela flatnya di Baker Street, kedua tangannya terbenam di saku jubah tidurnya, mengamati jalanan berkabut di bawah dengan tatapan deduktif yang tajam.',
                    '"Watson," katanya tiba-tiba tanpa menoleh, "ada seorang tamu agung yang membutuhkan bantuan kita malam ini, dan ia tiba dengan kereta bertopeng."'
                ]
            },
            {
                title: 'Kasus II: Persatuan Orang Berambut Merah',
                page: 12,
                content: [
                    'Suatu hari di musim gugur tahun lalu, aku mengunjungi temanku, Mr. Sherlock Holmes, dan mendapatinya sedang berbincang seru dengan seorang pria tua yang sangat gemuk, berwajah merah, dan berambut merah menyala.',
                    'Dengan permintaan maaf atas gangguanku, aku hendak mengundurkan diri, tetapi Holmes menarikku masuk ke dalam ruangan dan menutup pintu di belakangku.',
                    '"Engkau datang tepat waktu, Watson," katanya dengan riang. "Kasus ini tampak sederhana namun menyimpan keganjilan yang sangat menyegarkan."'
                ]
            }
        ]
    },
    {
        id: 'B04',
        slug: 'edwin-a-abbott/flatland',
        title: 'Flatland: Kisah Negeri Dua Dimensi',
        author: 'Edwin A. Abbott',
        publisher: 'Penerbit Sains Literasi',
        category: 'Filsafat & Sains Matematika',
        price: 32000,
        coverImage: '/images/covers/B04.jpg',
        rating: 4.5,
        reviewCount: 16,
        isbn: '978-602-05-9901-4',
        totalPages: 18,
        publishedYear: 2023,
        synopsis: 'Sebuah satir cerdas dan eksplorasi geometris tentang dunia datar dua dimensi yang dihuni oleh bentuk-bentuk geometris, sebelum tokoh utamanya dikunjungi oleh Bola dari dunia Tiga Dimensi.',
        chapters: [
            {
                title: 'Bagian I: Tentang Dunia Datar Ini',
                page: 1,
                content: [
                    'Kusebut dunia kami ini Flatland, bukan karena itu nama yang kami berikan kepadanya, melainkan untuk memperjelas sifatnya bagi kalian, wahana pembacaku yang berbahagia yang hidup di Ruang Tiga Dimensi.',
                    'Bayangkan selembar kertas yang sangat luas di mana Garis lurus, Segitiga, Persegi, Pentagonal, dan bentuk geometris lainnya bergerak bebas di atas permukaannya.',
                    'Tanpa memiliki daya untuk bangkit di atasnya atau tenggelam di bawahnya—persis seperti bayangan yang hidup dan berwujud—maka kalian akan memiliki gambaran yang cukup tepat tentang negara dan masyarakat kami.'
                ]
            }
        ]
    },
    {
        id: 'B05',
        slug: 'sunda/sejarah-tatar-sunda',
        title: 'Sejarah & Kebudayaan Tatar Sunda',
        author: 'Prof. Dr. Nina H. Lubis',
        publisher: 'Dinas Literasi IKAPI Jawa Barat',
        category: 'Budaya Sunda & Sejarah',
        price: 68000,
        coverImage: '/images/covers/B05.jpg',
        rating: 4.9,
        reviewCount: 47,
        isbn: '978-602-02-4411-9',
        totalPages: 32,
        publishedYear: 2024,
        synopsis: 'Dokumentasi komprehensif mengenai jejak peradaban, sistem kepemimpinan, kearifan lokal urang Sunda, dan dinamika kebudayaan Jawa Barat dari era kerajaan Tarumanagara hingga era kontemporer.',
        chapters: [
            {
                title: 'Bab I: Falsafah Luhur Silih Asih, Silih Asah, Silih Asuh',
                page: 1,
                content: [
                    'Kabudayaan Sunda ngagaduhan pondasi luhur dina ngawangun tatakrama hirup kumbuh sapopoe, nyaeta ajaran Silih Asih, Silih Asah, jeung Silih Asuh.',
                    'Silih Asih hartina silih pikanyaah jeung micinta sasama manusa tanpa ningali kasang tukang, warna kulit, atawa darajat sosial.',
                    'Silih Asah ngagambarkeun pentingna silih elingan jeung babarengan ningkatkeun elmu pangaweruh, sangkan masarakat Jawa Barat salawasna calakan tur berwawasan jembar.',
                    'Silih Asuh ngandung harti silih jaga, silih bimbing, silih tuntun dina kahadean, saperti kolot ngasuh budakna kalayan kaasih anu taya watesna.'
                ]
            },
            {
                title: 'Bab II: Prasasti Kawali & Karajaan Sunda Galuh',
                page: 14,
                content: [
                    'Dina titimangsa sajarah Jawa Barat, Prasasti Astana Gede Kawali di Ciamis janten bukti otentik ngeunaan sistem pamarentahan Karajaan Galuh anu adil tur wijaksana.',
                    'Tulisan aksara Sunda Kuno dina batu prasasti netelakeun pesen Prabu Niskala Wastu Kancana: "Pakena gawe rahayu pakeun heubeul jaya dina buana" (Laksanakeun amal kahadean sangkan lila jaya di dunya).'
                ]
            }
        ]
    },
    {
        id: 'B06',
        slug: 'penerbit-itb/algoritma-pemrograman-modern',
        title: 'Dasar Algoritma & Struktur Data Modern',
        author: 'Dr. Ir. Rinaldi Munir, M.T.',
        publisher: 'ITB Press Publisher Hub',
        category: 'Teknologi & Komputer',
        price: 75000,
        coverImage: '/images/covers/B06.jpg',
        rating: 4.7,
        reviewCount: 31,
        isbn: '978-602-06-3312-0',
        totalPages: 26,
        publishedYear: 2024,
        synopsis: 'Buku teks standar komputasi yang menyajikan konsep fundamental logika algoritmik, efisiensi kompleksitas waktu Big-O, pemrosesan pohon biner, serta penerapan struktur data dinamis pada rekayasa perangkat lunak.',
        chapters: [
            {
                title: 'Bab I: Notasi Algoritmik & Efisiensi',
                page: 1,
                content: [
                    'Algoritma adalah urutan langkah-langkah logis penyelesaian masalah yang disusun secara sistematis dan terstruktur.',
                    'Dalam rekayasa sistem modern, suatu algoritma tidak hanya dituntut untuk menghasilkan luaran yang benar, tetapi juga harus mangkus (efisien) dalam hal konsumsi memori dan waktu eksekusi.',
                    'Analisis efisiensi dihitung menggunakan notasi Asimptotik Big-O, yang mengukur pertumbuhan laju operasi matematis saat ukuran masukan (n) bertambah menuju tak hingga.'
                ]
            }
        ]
    },
    {
        id: 'B07',
        slug: 'sastra-jabar/hujan-bulan-juni',
        title: 'Hujan Bulan Juni: Kumpulan Puisi',
        author: 'Sapardi Djoko Damono',
        publisher: 'Pustaka Jaya Literasi',
        category: 'Sastra & Fiksi Klasik',
        price: 42000,
        coverImage: '/images/covers/B07.jpg',
        rating: 4.9,
        reviewCount: 65,
        isbn: '978-602-03-1288-0',
        totalPages: 16,
        publishedYear: 2023,
        synopsis: 'Antologi sajak liris paling ikonik dalam kesusastraan Indonesia modern yang merangkum kesunyian, kerinduan, dan ketabahan cinta melalui metafora alam yang hening dan bersahaja.',
        chapters: [
            {
                title: 'Bagian I: Hujan Bulan Juni',
                page: 1,
                content: [
                    'Tak ada yang lebih tabah dari hujan bulan Juni.',
                    'Dirahasiakannya rintik rindunya kepada pohon berbunga itu.',
                    'Tak ada yang lebih bijak dari hujan bulan Juni.',
                    'Dihapusnya jejak-jejak kakinya yang ragu-ragu di jalan itu.',
                    'Tak ada yang lebih arif dari hujan bulan Juni.',
                    'Dibiarkannya yang tak terucapkan diserap akar pohon bunga itu.'
                ]
            }
        ]
    }
];

export const INITIAL_REVIEWS: ReviewComment[] = [
    {
        id: 'REV-01',
        bookId: 'B01',
        userName: 'Fadli Sugiardi',
        date: '3 Nov 2026',
        rating: 5,
        commentText: 'Format pembaca digital di aplikasi IKAPI ini sangat rapi. Tipografinya sangat ramah di mata untuk membaca novel klasik berlama-lama.',
        isVerifiedBuyer: true,
        evaluationScores: {
            expectation: 5,
            usefulness: 5,
            priceValue: 5,
            repeatBuy: 5
        },
        publisherResponse: {
            publisherName: 'Standard Ebooks Indonesia',
            responseDate: '4 Nov 2026',
            responseText: 'Hatur nuhun Kang Fadli! Kami berkomitmen menjaga tipografi berkualitas tinggi untuk seluruh naskah klasik di IKAPI Jawa Barat.'
        }
    },
    {
        id: 'REV-02',
        bookId: 'B05',
        userName: 'Dimas Setiawan',
        date: '2 Nov 2026',
        rating: 5,
        commentText: 'Buku Sejarah Tatar Sunda karya Bu Nina ini wajib dibaca mahasiswa. Referensi prasastinya lengkap dan penjelasannya runtut.',
        isVerifiedBuyer: true,
        evaluationScores: {
            expectation: 5,
            usefulness: 5,
            priceValue: 4,
            repeatBuy: 5
        }
    },
    {
        id: 'REV-03',
        bookId: 'B03',
        userName: 'Devina Poetri',
        date: '1 Nov 2026',
        rating: 5,
        commentText: 'Petualangan Sherlock Holmes terjemahannya sangat natural dan mudah dipahami. Bookmark fitur sangat membantu saat jeda membaca.',
        isVerifiedBuyer: true,
        evaluationScores: {
            expectation: 5,
            usefulness: 4,
            priceValue: 5,
            repeatBuy: 4
        }
    }
];
