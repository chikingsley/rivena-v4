import { useState } from "react"
import { Target, ChevronDown, Flame, CheckCircle, BarChart, PlusCircle, MoreHorizontal, X } from "lucide-react"

interface Goal {
  title: string
  progress: number
  dueDate: string
  tags: string[]
  milestones?: number
}

interface Habit {
  title: string
  streak: number
  target: string
  days: boolean[]
  stats?: boolean
}

const workGoals: Goal[] = [
  {
    title: "Complete Project Presentation",
    progress: 80,
    dueDate: "Jun 30, 2024",
    tags: ["Work", "Priority"],
    milestones: 3,
  },
  {
    title: "Complete Data Analysis Course",
    progress: 45,
    dueDate: "Jul 15, 2024",
    tags: ["Work", "Learning"],
  },
]

const habits: Habit[] = [
  {
    title: "Morning Meditation",
    streak: 30,
    target: "Daily, 10 minutes",
    days: [true, true, true, true, true, true, false],
    stats: true,
  },
  {
    title: "Reading",
    streak: 12,
    target: "5 days/week, 20 pages",
    days: [true, true, true, true, false, true, false],
    stats: true,
  },
]

export function GoalsContent() {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    workGoals: true,
    habits: true,
  } as const)

  const toggleSection = (section: 'overview' | 'workGoals' | 'habits') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="h-full">
      <div className="p-3 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Progress Tracking</h3>
        <button className="p-1 text-purple-600 hover:bg-purple-50 rounded">
          <PlusCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Overview */}
      <div className="px-3 pt-2 pb-4 border-b border-gray-200">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Current Progress</h4>
            <button className="text-xs text-purple-600">View All</button>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Active Goals</span>
                <span className="font-medium">8 goals</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Habit Consistency</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: "87%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Goals */}
      <div className="mb-4">
        <div
          className="px-3 py-2 bg-gray-100 border-y border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-200"
          onClick={() => toggleSection("workGoals")}
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Work Goals</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{workGoals.length} active</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-600 transition-transform ${expandedSections.workGoals ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {expandedSections.workGoals && (
          <div className="space-y-2 py-2">
            {workGoals.map((goal, idx) => (
              <div
                key={idx}
                className="px-3 py-2 mx-2 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <h4 className="text-sm font-medium truncate">{goal.title}</h4>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">{goal.progress}%</span>
                    </div>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Due: {goal.dueDate}</span>
                  <div className="flex items-center gap-2">
                    {goal.tags.map((tag, i) => (
                      <span
                        key={tag}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          i === 0 ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habits */}
      <div className="mb-4">
        <div
          className="px-3 py-2 bg-gray-100 border-y border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-200"
          onClick={() => toggleSection("habits")}
        >
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Habits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{habits.length} active</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-600 transition-transform ${expandedSections.habits ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {expandedSections.habits && (
          <div className="space-y-2 py-2">
            {habits.map((habit, idx) => (
              <div
                key={idx}
                className="px-3 py-2 mx-2 rounded-lg bg-white border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-red-500" />
                    <h4 className="text-sm font-medium">{habit.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-blue-600">{habit.streak}</span>
                    <span className="text-xs text-gray-500">day streak</span>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1">
                  {habit.days.map((completed, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {completed ? <CheckCircle className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-[8px] mt-1 text-gray-500">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs text-gray-500 flex justify-between">
                  <span>Target: {habit.target}</span>
                  {habit.stats && (
                    <div className="flex items-center">
                      <BarChart className="h-3 w-3 mr-1" />
                      <span>View Stats</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

