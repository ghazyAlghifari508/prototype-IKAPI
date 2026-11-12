export const avatarPresets = [
    { key: 'cat', emoji: '🐱', label: 'Kucing' },
    { key: 'dog', emoji: '🐶', label: 'Anjing' },
    { key: 'panda', emoji: '🐼', label: 'Panda' },
    { key: 'frog', emoji: '🐸', label: 'Katak' },
    { key: 'rabbit', emoji: '🐰', label: 'Kelinci' },
    { key: 'owl', emoji: '🦉', label: 'Burung hantu' },
    { key: 'bear', emoji: '🐻', label: 'Beruang' },
    { key: 'koala', emoji: '🐨', label: 'Koala' },
] as const;

export type AvatarPresetKey = (typeof avatarPresets)[number]['key'];

export function avatarPresetEmoji(key: string | null): string | null {
    return avatarPresets.find((preset) => preset.key === key)?.emoji ?? null;
}
