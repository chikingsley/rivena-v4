import type * as React from "react"
import { Command } from "lucide-react"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const activeTeam = teams[0]

  return (
    <div className="flex items-center gap-2">
      <div className="flex aspect-square h-8 items-center justify-center rounded-lg bg-purple-600 text-white">
        <Command className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-sm font-semibold">{activeTeam.name}</h2>
        <p className="text-xs text-gray-500">{activeTeam.plan}</p>
      </div>
    </div>
  )
}

