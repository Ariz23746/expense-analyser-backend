export const getCurrentMonthAndYear = () => {
  const currentDate = new Date();
  return {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };
};
