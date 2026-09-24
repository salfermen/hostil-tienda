import { statusLabels } from '@/lib/drops/status'
import type { DropStatus } from '@/lib/generated/prisma/enums'

export function StatusBadge({ status }: { status: DropStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>{statusLabels[status]}</span>
  )
}
