import { AVATAR_ICON_OPTIONS } from '../../utils/avatarIcons';

const SIZE_CLASSES = {
  xs: { box: 'h-6 w-6', emoji: 'text-xs', initial: 'text-[10px]' },
  sm: { box: 'h-7 w-7', emoji: 'text-sm', initial: 'text-xs' },
  md: { box: 'h-8 w-8', emoji: 'text-base', initial: 'text-xs' },
  lg: { box: 'h-9 w-9', emoji: 'text-lg', initial: 'text-sm' },
  xl: { box: 'h-16 w-16', emoji: 'text-3xl', initial: 'text-2xl' },
};

export default function UserAvatar({ avatarIcon, avatarUrl, nickname, size = 'md', className = '' }) {
  const s = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const iconOption = avatarIcon ? AVATAR_ICON_OPTIONS.find((opt) => opt.key === avatarIcon) : null;
  const base = `inline-flex shrink-0 items-center justify-center rounded-full font-bold ${s.box} ${className}`;

  if (iconOption) {
    return (
      <span
        className={`${base} ${iconOption.bg}`}
        role="img"
        aria-label={nickname ? `${nickname}님의 프로필 아이콘` : '프로필 아이콘'}
      >
        <span className={s.emoji} aria-hidden="true">{iconOption.emoji}</span>
      </span>
    );
  }

  if (avatarUrl) {
    return <img src={avatarUrl} alt={nickname || '프로필 이미지'} className={`${base} object-cover`} />;
  }

  return (
    <span className={`${base} bg-primary-soft text-primary ${s.initial}`}>
      {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
    </span>
  );
}
