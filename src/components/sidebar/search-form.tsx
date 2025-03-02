import { Search } from "lucide-react"

export function SearchForm({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 text-sm"
        />
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}

