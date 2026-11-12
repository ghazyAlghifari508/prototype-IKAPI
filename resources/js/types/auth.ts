export type User = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    avatar_preset:
        | 'cat'
        | 'dog'
        | 'panda'
        | 'frog'
        | 'rabbit'
        | 'owl'
        | 'bear'
        | 'koala'
        | null;
    email_verified_at: string | null;
    roles: string[];
};

export type Auth = {
    user: User | null;
};

export type AuthenticatedAuth = {
    user: User;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
