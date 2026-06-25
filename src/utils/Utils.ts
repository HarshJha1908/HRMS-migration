export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

export const formatLeaveValue = (
  total: string | null,
  submitted: string | null,
  balance: string | null
) => {
  return `${total ?? "NA"}[${submitted ?? "0.0"} / ${balance ?? "0.0"}]`;
};
