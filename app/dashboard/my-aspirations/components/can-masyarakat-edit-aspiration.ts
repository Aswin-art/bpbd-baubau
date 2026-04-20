/** Aspirasi milik masyarakat: boleh ubah/hapus hanya saat menunggu dan belum ada balasan BPBD. */
export function canMasyarakatEditAspiration(row: {
  status: string;
  adminReply: string | null;
  repliedAt: string | null;
}): boolean {
  if (row.status !== "pending") return false;
  if (row.repliedAt) return false;
  if (row.adminReply?.trim()) return false;
  return true;
}
