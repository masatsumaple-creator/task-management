/** 期限日（"YYYY-MM-DD" または null）が今日より過去かどうかを判定する。 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return due.getTime() < today.getTime();
}
