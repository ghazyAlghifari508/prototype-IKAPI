export type BuyerUser = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    avatarUrl: string;
    avatarType: 'custom' | 'preset';
};

export type PublisherUser = {
    id: number;
    businessName: string;
    legalNumber: string;
    ikapiMemberNumber: string;
    businessEmail: string;
    officeAddress: string;
    contactPhone: string;
    documentUploadStatus: 'missing' | 'uploaded';
    approvalState: 'pending' | 'approved';
};

export type PresetAvatar = { id: string; emoji: string; label: string };

export const mockBuyerUser: BuyerUser = {
    id: 1,
    firstName: 'Fadli',
    lastName: 'Sugiardi',
    email: 'fadli@example.com',
    phone: '0812 3456 7890',
    address: 'Bandung, Jawa Barat',
    avatarUrl: '',
    avatarType: 'preset',
};

export const mockPublisherUser: PublisherUser = {
    id: 2,
    businessName: 'Penerbit IKAPI Jabar',
    legalNumber: 'AHU-0012345.AH.01.01',
    ikapiMemberNumber: 'IKAPI-JBR-2025-001',
    businessEmail: 'penerbit@ikapi.id',
    officeAddress: 'Bandung, Jawa Barat',
    contactPhone: '022 1234 5678',
    documentUploadStatus: 'uploaded',
    approvalState: 'approved',
};

export const demoEmails = [
    mockBuyerUser.email,
    'pembeli@ikapi.id',
    mockPublisherUser.businessEmail,
    'pending@ikapi.id',
];

export const presetAvatars: PresetAvatar[] = [
    { id: 'reading-cat', emoji: '🐱', label: 'Kucing pembaca' },
    { id: 'curious-fox', emoji: '🦊', label: 'Rubah ingin tahu' },
    { id: 'book-panda', emoji: '🐼', label: 'Panda pecinta buku' },
    { id: 'green-frog', emoji: '🐸', label: 'Katak ceria' },
    { id: 'bunny-reader', emoji: '🐰', label: 'Kelinci pembaca' },
    { id: 'wise-owl', emoji: '🦉', label: 'Burung hantu bijak' },
    { id: 'bear-bookworm', emoji: '🐻', label: 'Beruang kutu buku' },
    { id: 'koala-story', emoji: '🐨', label: 'Koala pencinta cerita' },
];
