export const splitBookCategory = (category) => {
  if (!category) return [];

  return String(category)
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean);
};

export const getBookCardCategory = (category, fallback = '일반') => {
  const parts = splitBookCategory(category);
  return parts[1] || parts[0] || fallback;
};
