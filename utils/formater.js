const formatNumber = (number) => {
  if (number % 10 === number) return `0${number}`;
  return number.toString();
};

exports.formatDate = (date) => {
  return new Date(
    `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}`
  ).toISOString();
};
