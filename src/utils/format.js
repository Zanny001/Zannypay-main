export function formatCurrency(amount, currency = '₦') {
  const n = Number(amount) || 0;
  return `${currency}${n.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(isoString) {
  if (!isoString) return 'Just now';
  const d = new Date(isoString);
  
  // Guard against invalid date objects
  if (isNaN(d.getTime())) return 'Just now';

  return d.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function maskAccount(num) {
  const str = String(num);
  if (str.length <= 4) return str;
  return '•••• ' + str.slice(-4);
}
