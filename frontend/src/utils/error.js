const fallbackMessages = {
  VALIDATION_ERROR: '입력값을 확인해주세요',
  UNAUTHORIZED: '이메일 또는 비밀번호가 올바르지 않습니다.',
  FORBIDDEN: '권한이 없습니다',
  NOT_FOUND: '대상을 찾을 수 없습니다',
  DUPLICATE: '이미 존재합니다',
  INTERNAL_ERROR: '일시적인 오류가 발생했습니다',
};

export const getErrorMessage = (error) =>
  error?.message || fallbackMessages[error?.code] || '요청을 처리하지 못했습니다';
