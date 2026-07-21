export function getStatusColor(status: string): string {
  switch (status) {
    case "OPEN": return "bg-green-100 text-green-700";
    case "PENDING": return "bg-yellow-100 text-yellow-700";
    case "CLOSED": return "bg-gray-100 text-gray-500";
    default: return "bg-blue-100 text-blue-700";
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case "OPEN": return "bg-green-500";
    case "PENDING": return "bg-yellow-500";
    case "CLOSED": return "bg-gray-400";
    default: return "bg-blue-500";
  }
}

export function canEditUnsend(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 5 * 60 * 1000;
}

export interface Reaction {
  id: string;
  emoji: string;
  user: { id: string; name: string; email: string };
}

export function groupReactions(reactions: Reaction[]) {
  const map: Record<string, { emoji: string; count: number; users: string[]; hasOwn: boolean }> = {};
  for (const r of reactions) {
    if (!map[r.emoji]) map[r.emoji] = { emoji: r.emoji, count: 0, users: [], hasOwn: false };
    map[r.emoji].count++;
    map[r.emoji].users.push(r.user.name || r.user.email.split("@")[0]);
  }
  return Object.values(map);
}
