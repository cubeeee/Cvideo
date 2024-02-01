export const parseTime = (seconds: number) => {
  const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

export const getRandomDuration = (min, max) => {
  return Math.random() * (max - min) + min;
};