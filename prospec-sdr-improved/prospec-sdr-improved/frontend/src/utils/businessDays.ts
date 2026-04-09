/**
 * Retorna a quantidade de dias úteis (seg–sex) de um mês,
 * com suporte a sobreposições manuais para feriados.
 */
const MANUAL_OVERRIDES: Record<string, number> = {
  '2026-02': 18,
};

export function getBusinessDays(month: string): number {
  if (MANUAL_OVERRIDES[month]) return MANUAL_OVERRIDES[month];

  const [year, m] = month.split('-').map(Number);
  let days = 0;
  const date = new Date(year, m - 1, 1);
  while (date.getMonth() === m - 1) {
    const d = date.getDay();
    if (d !== 0 && d !== 6) days++;
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getBusinessDaysPassed(month: string): number {
  const [year, m] = month.split('-').map(Number);
  const today = new Date();
  let days = 0;
  const date = new Date(year, m - 1, 1);
  while (date <= today && date.getMonth() === m - 1) {
    const d = date.getDay();
    if (d !== 0 && d !== 6) days++;
    date.setDate(date.getDate() + 1);
  }
  return Math.max(1, days);
}
