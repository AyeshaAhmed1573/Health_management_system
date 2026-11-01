// Backend stores address as {street, city, province, postalCode} and operating hours as
// {open, close}, but older records (and some forms) use plain strings. Render either safely.
export function formatAddress(address, fallback = "Address not available") {
  if (!address) return fallback;
  if (typeof address === "string") return address;
  const text = [address.street, address.city, address.province, address.postalCode].filter(Boolean).join(", ");
  return text || fallback;
}

export function formatHours(hours, fallback = "Hours not available") {
  if (!hours) return fallback;
  if (typeof hours === "string") return hours;
  if (hours.open && hours.close) return `${hours.open} - ${hours.close}`;
  return hours.open || hours.close || fallback;
}
