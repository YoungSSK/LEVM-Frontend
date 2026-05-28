import { useState } from 'react'
import { 
  BookOpen, 
  Sparkles, 
  Flame, 
  BookMarked, 
  Clock, 
  GraduationCap, 
  Trophy, 
  Search, 
  Compass, 
  Layers, 
  Settings as SettingsIcon, 
  BarChart2, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

function App() {
  const [progress, setProgress] = useState(70)
  const [inputValue, setInputValue] = useState('')
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)

  const lessons = [
    { id: 1, title: "Advanced Idioms for Tech Professionals", level: "C1", duration: "15 min", desc: "Master professional jargon and expressions used in silicon valley boardrooms.", category: "Speaking" },
    { id: 2, title: "Nuances in Academic Writing", level: "C2", duration: "20 min", desc: "Learn the precise usage of adverbial clauses and transition indicators.", category: "Writing" },
    { id: 3, title: "Negotiation Tactics & Pitching", level: "B2", duration: "12 min", desc: "Polite pushbacks, structural pitching techniques, and assertive tone structures.", category: "Business" }
  ]

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex relative overflow-hidden font-sans">
      
      {/* Background Geometric Particles (5% opacity) */}
      <div className="absolute top-[10%] left-[20%] w-[100px] h-[100px] border border-primary/20 rounded-full geometric-particle animate-pulse duration-1000"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[120px] h-[120px] border-r-2 border-b-2 border-primary/10 rotate-45 geometric-particle"></div>
      <div className="absolute top-[60%] left-[5%] w-[8px] h-[8px] bg-primary/20 rounded-full geometric-particle"></div>
      <div className="absolute top-[30%] right-[30%] w-[12px] h-[12px] border border-primary/30 rotate-12 geometric-particle"></div>
      
      {/* Sidebar Layout */}
      <aside className="w-[260px] shrink-0 border-r border-[#494454] bg-[#0e0e10] p-6 flex flex-col justify-between hidden md:flex z-10">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-[#6d3bd7] to-[#d0bcff] flex items-center justify-center shadow-[0_0_15px_rgba(208,188,255,0.3)]">
              <Sparkles className="h-5 w-5 text-[#3c0091]" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-extrabold tracking-tight leading-none text-white">
                FLUX<span className="text-[#d0bcff]">PRO</span>
              </h1>
              <span className="text-[10px] text-[#cbc3d7] tracking-widest uppercase font-mono">English OS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-[#958ea0] uppercase block px-3 mb-2">Workspace</span>
            
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#2a2a2c]/50 text-white font-medium text-sm transition-all duration-150 hover:bg-[#2a2a2c]">
              <BarChart2 className="h-4 w-4 text-[#d0bcff]" />
              <span>Learning Board</span>
            </a>

            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-[#cbc3d7] hover:text-white font-medium text-sm transition-all duration-150 hover:bg-[#2a2a2c]/30">
              <BookOpen className="h-4 w-4 text-[#958ea0]" />
              <span>Syllabus</span>
            </a>

            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-[#cbc3d7] hover:text-white font-medium text-sm transition-all duration-150 hover:bg-[#2a2a2c]/30">
              <Layers className="h-4 w-4 text-[#958ea0]" />
              <span>Spaced Cards</span>
            </a>

            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-[#cbc3d7] hover:text-white font-medium text-sm transition-all duration-150 hover:bg-[#2a2a2c]/30">
              <Compass className="h-4 w-4 text-[#958ea0]" />
              <span>Immersive Reading</span>
            </a>
          </nav>
        </div>

        {/* User Workspace Profile and Settings */}
        <div className="space-y-4 pt-6 border-t border-[#494454]">
          <a href="#" className="flex items-center justify-between px-3 py-2 rounded-md text-[#cbc3d7] hover:text-white text-sm transition-all hover:bg-[#2a2a2c]/30">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>System Settings</span>
            </div>
            <span className="text-[10px] bg-[#353437] px-1.5 py-0.5 rounded font-mono text-[#958ea0]">v1.0</span>
          </a>
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#c0c1ff] to-[#6d3bd7] flex items-center justify-center text-xs font-bold text-[#1000a9]">
              AL
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Alex Learner</p>
              <p className="text-[10px] text-[#958ea0] font-mono">Professional Tier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-[1200px] mx-auto z-10 space-y-10">
        
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#494454]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#d0bcff] bg-[#3c0091]/20 px-2 py-0.5 rounded-full border border-[#d0bcff]/20">
                <Trophy className="h-3 w-3" />
                Level Up Available
              </span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">
              Obsidian learning space
            </h2>
            <p className="text-[#cbc3d7] text-sm mt-1">
              Engineered for absolute focus and high-performance cognitive absorption.
            </p>
          </div>
          
          {/* Quick Search */}
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#958ea0]" />
            <input 
              type="text" 
              placeholder="Search concepts, idioms..." 
              className="w-full h-9 pl-9 pr-4 rounded-md input-minimalist text-sm"
            />
          </div>
        </header>

        {/* Dashboard statistics section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="hover:border-[#d0bcff]/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono tracking-widest text-[#958ea0] uppercase">Learning Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-white">15 Days</div>
              <p className="text-xs text-[#cbc3d7] mt-1">Top 5% of active learners</p>
            </CardContent>
          </Card>
          
          <Card className="hover:border-[#d0bcff]/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono tracking-widest text-[#958ea0] uppercase">Vocabs Mastered</CardTitle>
              <BookMarked className="h-4 w-4 text-[#c0c1ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-white">420 Words</div>
              <p className="text-xs text-[#cbc3d7] mt-1">+24 words this week</p>
            </CardContent>
          </Card>

          <Card className="hover:border-[#d0bcff]/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono tracking-widest text-[#958ea0] uppercase">Focus Time</CardTitle>
              <Clock className="h-4 w-4 text-[#cebdff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-white">12.5 Hours</div>
              <p className="text-xs text-[#cbc3d7] mt-1">Daily average: 45 min</p>
            </CardContent>
          </Card>
        </section>

        {/* Goal and Interactive Progress Bar (Tactile Glow Spark) */}
        <section className="bg-[#1c1b1d] border border-[#494454] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Daily Cognitive Goal</h3>
              <p className="text-xs text-[#cbc3d7]">
                Adjust focus velocity and witness the obsidian active-spark progress indicator.
              </p>
            </div>
            
            {/* Real-time slider controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setProgress(prev => Math.max(10, prev - 10))}
                className="btn-3d-secondary px-3 py-1 text-xs rounded-md"
              >
                Decrease
              </button>
              <span className="font-mono text-sm font-bold text-[#d0bcff] bg-[#3c0091]/30 px-2 py-0.5 rounded border border-[#d0bcff]/20">
                {progress}%
              </span>
              <button 
                onClick={() => setProgress(prev => Math.min(100, prev + 10))}
                className="btn-3d-primary px-3 py-1 text-xs rounded-md"
              >
                Increase
              </button>
            </div>
          </div>

          {/* Premium Progress Bar */}
          <div className="progress-track h-4 w-full">
            <div 
              className="progress-indicator" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </section>

        {/* Custom Design System Components Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left panel: Tactile Components Showcase */}
          <div className="space-y-6">
            <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#d0bcff]" />
              Tactile Component Showcase
            </h3>
            
            {/* Flat-3D Buttons */}
            <div className="bg-[#1c1b1d] border border-[#494454] rounded-xl p-6 space-y-4">
              <h4 className="text-xs font-mono tracking-widest text-[#958ea0] uppercase">1. Flat-3D Tactile Buttons</h4>
              <p className="text-xs text-[#cbc3d7] mb-2">
                Click on the buttons to experience visual physical Y-translation and bottom-border compression.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="btn-3d-primary px-5 py-2.5 rounded-lg text-sm">
                  Primary Action
                </button>
                <button className="btn-3d-secondary px-5 py-2.5 rounded-lg text-sm">
                  Secondary Slate
                </button>
                <button className="btn-3d-tertiary px-5 py-2.5 rounded-lg text-sm">
                  Tertiary Glow
                </button>
              </div>
            </div>

            {/* Minimalist Inputs with glow */}
            <div className="bg-[#1c1b1d] border border-[#494454] rounded-xl p-6 space-y-4">
              <h4 className="text-xs font-mono tracking-widest text-[#958ea0] uppercase">2. Minimalist Focus-Glow Input</h4>
              <p className="text-xs text-[#cbc3d7] mb-2">
                Click to type; experience the Neon Violet transition and subtle outer focus glow.
              </p>
              
              <div className="space-y-3">
                <label className="text-[11px] font-mono text-[#958ea0] uppercase block">Interactive Input</label>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Focus on me to see active glow..."
                  className="w-full h-11 px-4 rounded-lg input-minimalist text-sm"
                />
                {inputValue && (
                  <p className="text-xs text-primary animate-fade-in font-mono">
                    Buffer state: "{inputValue}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Active Lessons selection (Cards with Neon-Violet Top-Border on hover) */}
          <div className="space-y-6">
            <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#c0c1ff]" />
              Syllabus & Lesson Selection
            </h3>

            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson.id)}
                  className={`
                    cursor-pointer p-5 rounded-xl bg-[#1c1b1d] border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group
                    ${selectedLesson === lesson.id 
                      ? 'border-[#d0bcff] shadow-[0_0_15px_rgba(208,188,255,0.15)] translate-x-1' 
                      : 'border-[#494454] hover:border-[#d0bcff]/50'
                    }
                  `}
                >
                  {/* Neon border highlight top on hover */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-[#3c0091]/30 text-[#d0bcff] px-2 py-0.5 rounded font-mono border border-[#d0bcff]/20">
                      {lesson.level} • {lesson.category}
                    </span>
                    <span className="text-xs text-[#958ea0]">{lesson.duration}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm md:text-base">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-[#cbc3d7] mt-1 leading-relaxed">
                      {lesson.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#cbc3d7]">
                      {selectedLesson === lesson.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-[#d0bcff]" />
                          <span className="font-semibold text-white">Active Lesson</span>
                        </>
                      ) : (
                        <span>Click to activate</span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#958ea0] group-hover:text-white transition-colors group-hover:translate-x-1 transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer info and resources */}
        <footer className="pt-8 border-t border-[#494454] text-center text-xs text-[#958ea0] space-y-2">
          <p>
            Obsidian Flux Design OS • Engineered with React + TypeScript + Tailwind CSS v4 + Shadcn UI
          </p>
          <div className="flex justify-center gap-4 text-[#cbc3d7]">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">API Reference</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Spec</a>
          </div>
        </footer>

      </main>
    </div>
  )
}

export default App
