"use client"

import { useState } from "react"
import {
  User,
  Heart,
  Target,
  Lightbulb,
  Star,
  Clock,
  ChevronDown,
  PenLine,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"

interface Memory {
  id: string
  content: string
  type: "fact" | "preference" | "goal" | "insight" | "achievement" | "relationship"
  confidence: number
  learnedAt: Date
  sources: string[]
}

// Memory categories with their respective icons and memories
const memoryCategories = {
  facts: {
    label: "Personal Facts",
    icon: User,
    items: [
      {
        id: "fact-1",
        content: "Your sister Emma lives in Boston and works as a graphic designer",
        type: "fact",
        confidence: 0.95,
        learnedAt: parseISO("2024-02-15"),
        sources: ["session-123"],
      },
      {
        id: "fact-2",
        content: "You're allergic to peanuts but not other nuts",
        type: "fact",
        confidence: 0.88,
        learnedAt: parseISO("2024-02-10"),
        sources: ["session-125"],
      },
    ],
  },
  preferences: {
    label: "Preferences",
    icon: Heart,
    items: [
      {
        id: "pref-1",
        content: "You prefer science fiction and historical fiction books",
        type: "preference",
        confidence: 0.85,
        learnedAt: parseISO("2024-02-20"),
        sources: ["session-128"],
      },
      {
        id: "pref-2",
        content: "You enjoy yoga and running for exercise",
        type: "preference",
        confidence: 0.78,
        learnedAt: parseISO("2024-02-05"),
        sources: ["session-118"],
      },
    ],
  },
  goals: {
    label: "Goals & Projects",
    icon: Target,
    items: [
      {
        id: "goal-1",
        content: "Training for a half marathon in September",
        type: "goal",
        confidence: 0.9,
        learnedAt: parseISO("2024-02-18"),
        sources: ["session-127"],
      },
      {
        id: "goal-2",
        content: "Learning Spanish with a goal of basic conversation by summer",
        type: "goal",
        confidence: 0.85,
        learnedAt: parseISO("2024-01-15"),
        sources: ["session-105"],
      },
    ],
  },
  insights: {
    label: "Insights & Patterns",
    icon: Lightbulb,
    items: [
      {
        id: "insight-1",
        content: "You tend to procrastinate when feeling overwhelmed rather than breaking tasks down",
        type: "insight",
        confidence: 0.75,
        learnedAt: parseISO("2024-02-12"),
        sources: ["session-122", "session-124"],
      },
      {
        id: "insight-2",
        content: "Your mood improves significantly after morning exercise",
        type: "insight",
        confidence: 0.82,
        learnedAt: parseISO("2024-02-08"),
        sources: ["session-119", "session-121"],
      },
    ],
  },
  achievements: {
    label: "Achievements",
    icon: Star,
    items: [
      {
        id: "achievement-1",
        content: "Meditated consistently for 30 days in a row",
        type: "achievement",
        confidence: 0.95,
        learnedAt: parseISO("2024-02-22"),
        sources: ["session-130"],
      },
      {
        id: "achievement-2",
        content: "Completed your first 10K race last month",
        type: "achievement",
        confidence: 0.98,
        learnedAt: parseISO("2024-01-30"),
        sources: ["session-115"],
      },
    ],
  },
}

const MemoryActions = () => {
  return (
    <div className="flex gap-1 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        title="Edit memory"
      >
        <PenLine className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        title="View related conversations"
      >
        <MessageSquare className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-destructive"
        title="Remove memory"
      >
        <AlertCircle className="h-3 w-3" />
      </Button>
    </div>
  )
}

const MemoryItem = ({ memory }: { memory: Memory }) => {
  const [showActions, setShowActions] = useState(false)
  
  const getMemoryIcon = () => {
    switch (memory.type) {
      case "fact":
        return <User className="h-4 w-4 text-blue-500" />
      case "preference":
        return <Heart className="h-4 w-4 text-pink-500" />
      case "goal":
        return <Target className="h-4 w-4 text-green-500" />
      case "insight":
        return <Lightbulb className="h-4 w-4 text-amber-500" />
      case "achievement":
        return <Star className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  return (
    <div 
      className="py-3 px-4 mb-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3 flex-grow min-w-0">
          <div className="mt-0.5 flex-shrink-0">{getMemoryIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 leading-snug">{memory.content}</p>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>Learned {format(memory.learnedAt, "MMM d")}</span>
              <span className="text-xs bg-gray-200 rounded-full px-1.5 py-0.5">
                {Math.round(memory.confidence * 100)}%
              </span>
            </p>
          </div>
        </div>
        
        {showActions && (
          <div className="flex-shrink-0 ml-2">
            <MemoryActions />
          </div>
        )}
      </div>
    </div>
  )
}

export function MemoriesContent() {
  const [expandedSections, setExpandedSections] = useState({
    facts: true,
    preferences: true,
    goals: true,
    insights: false,
    achievements: false,
  } as const)

  const toggleSection = (section: 'facts' | 'preferences' | 'goals' | 'insights' | 'achievements') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="text-sm font-medium">What I Know About You</div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-100">
            <BarChart3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-100">
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {Object.entries(memoryCategories).map(([key, category]) => {
          // Cast the key to the appropriate type
          const sectionKey = key as 'facts' | 'preferences' | 'goals' | 'insights' | 'achievements';
          
          return (
            <div key={key} className="mb-1 last:mb-0">
              <div
                className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection(sectionKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <category.icon className="h-4 w-4 text-gray-500 mr-2.5" />
                    <span className="font-medium text-gray-800">{category.label}</span>
                    <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">
                      {category.items.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      expandedSections[sectionKey] ? "transform rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {expandedSections[sectionKey] && (
                <div className="py-1">
                  {category.items.map((memory) => (
                    <MemoryItem key={memory.id} memory={memory as Memory} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}