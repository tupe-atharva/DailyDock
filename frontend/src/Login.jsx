import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const DOODLES = [
  { emoji: "👾", x: 5,   y: 8,  size: 36, dur: 7  },
  { emoji: "🌀", x: 88,  y: 5,  size: 28, dur: 9  },
  { emoji: "⭐", x: 15,  y: 75, size: 24, dur: 6  },
  { emoji: "🐙", x: 80,  y: 70, size: 38, dur: 11 },
  { emoji: "🌙", x: 50,  y: 3,  size: 26, dur: 8  },
  { emoji: "💫", x: 92,  y: 40, size: 20, dur: 7  },
  { emoji: "🎮", x: 3,   y: 45, size: 30, dur: 10 },
  { emoji: "🦕", x: 70,  y: 88, size: 34, dur: 9  },
  { emoji: "🎸", x: 30,  y: 90, size: 26, dur: 8  },
  { emoji: "🍕", x: 60,  y: 15, size: 22, dur: 6  },
  { emoji: "🚀", x: 20,  y: 20, size: 30, dur: 7  },
  { emoji: "🎯", x: 75,  y: 30, size: 24, dur: 9  },
  { emoji: "🌊", x: 40,  y: 85, size: 28, dur: 8  },
  { emoji: "🦋", x: 10,  y: 60, size: 22, dur: 6  },
  { emoji: "🎪", x: 85,  y: 55, size: 32, dur: 10 },
  { emoji: "🍦", x: 55,  y: 50, size: 20, dur: 7  },
]

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"

export default function Login({ dark, setDark }) {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "not_binghamton") {
      setError("Please use your Binghamton University Google account.")
    }
  }, [])

  const bg = dark
    ? "min-h-screen bg-gray-950"
    : "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"

  return (
    <div className={`${bg} flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300`}>

      {/* Doodles */}
      {DOODLES.map((d, i) => (
        <div key={i} className={`fixed select-none animate-bounce pointer-events-none ${dark ? "opacity-5" : "opacity-10"}`}
          style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: d.size, animationDuration: `${d.dur}s`, animationDelay: `${i * 0.3}s` }}>
          {d.emoji}
        </div>
      ))}

      {/* Dark mode toggle */}
      <button onClick={() => setDark(d => !d)}
        className={`fixed top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold z-50 transition-all
          ${dark ? "bg-gray-800 text-yellow-300 border border-gray-700" : "bg-white text-gray-600 border border-gray-200 shadow-sm"}`}>
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* Login card */}
      <div className={`relative z-10 w-full max-w-sm mx-4 rounded-3xl shadow-xl p-8 border transition-colors duration-300
        ${dark ? "bg-gray-900/90 border-gray-800" : "bg-white/90 border-gray-100"} backdrop-blur-sm`}>

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">⚓</p>
          <h1 className={`text-3xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>DailyDock</h1>
          <p className={`text-sm mt-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            Your personal Binghamton dashboard
          </p>
        </div>

        {/* Features preview */}
        <div className="space-y-2 mb-8">
          {[
            { icon: "📅", text: "Class schedule & timeline" },
            { icon: "🚌", text: "Live OCCT shuttle tracking" },
            { icon: "🍽", text: "Dining hall menus" },
            { icon: "🗓", text: "Google Calendar sync" },
            { icon: "🌤", text: "Binghamton weather" },
          ].map(({ icon, text }) => (
            <div key={text} className={`flex items-center gap-3 rounded-2xl px-4 py-2.5
              ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
              <span className="text-lg">{icon}</span>
              <p className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>{text}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Login button */}
        <a href={`${API}/auth/login`}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-200 text-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <p className={`text-center text-xs mt-4 ${dark ? "text-gray-600" : "text-gray-400"}`}>
          Use your @binghamton.edu account
        </p>
      </div>
    </div>
  )
}
