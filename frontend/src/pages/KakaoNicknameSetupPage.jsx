import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api/users';
import { getErrorMessage } from '../utils/error';
import { AVATAR_ICON_OPTIONS } from '../utils/avatarIcons';
import AvatarIconGlyph from '../components/common/AvatarIconGlyph';

export default function KakaoNicknameSetupPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarIcon, setAvatarIcon] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateMe({ nickname, bio, avatarIcon });
      setUser(updatedUser);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="page min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="container">
        <form onSubmit={handleSubmit} className="card card--padded mx-auto grid max-w-[420px] gap-4">
          <div className="text-center mb-2">
            <h1 className="page-title mb-1">닉네임 설정</h1>
            <p className="text-sm text-text-muted">
              {user?.nickname ? `${user.nickname}님, ` : ''}문장서재에서 사용할 닉네임을 정해주세요
            </p>
          </div>

          <label className="form-field">
            <span className="form-label">닉네임</span>
            <input
              className="input"
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="form-field">
            <span className="form-label">소개글</span>
            <textarea
              className="textarea"
              rows={3}
              placeholder="나를 소개하는 한마디를 남겨보세요."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isSaving}
            />
          </label>

          <div className="form-field">
            <span className="form-label">프로필 아이콘</span>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_ICON_OPTIONS.map((icon) => {
                const isSelected = avatarIcon === icon.key;
                return (
                  <button
                    key={icon.key}
                    type="button"
                    onClick={() => setAvatarIcon(isSelected ? '' : icon.key)}
                    disabled={isSaving}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition ${icon.bg} ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
                    }`}
                    aria-label={`아이콘 ${icon.key} 선택`}
                    aria-pressed={isSelected}
                    title={icon.key}
                  >
                    <AvatarIconGlyph iconKey={icon.key} emoji={icon.emoji} />
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="button button--primary button--lg mt-2" disabled={isSaving}>
            {isSaving ? '저장 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
