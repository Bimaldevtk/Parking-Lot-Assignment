export const getMinDate = (offset = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
};

export const getDaysBetween = (start, end) => {
  const startD = new Date(start);
  const endD = new Date(end);
  return (endD - startD) / (1000 * 60 * 60 * 24) + 1;
};
