import { useState, useEffect, useRef, useCallback } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import Login from "./Login"

const API = "http://127.0.0.1:8000/api"
const TABS = ["timeline", "shuttle", "weather", "dining", "calendar"]
const TAB_ICONS = { timeline: "📅", shuttle: "🚌", weather: "🌤", dining: "🍽", calendar: "🗓" }
const TAB_LABELS = { timeline: "Schedule", shuttle: "Shuttle", weather: "Weather", dining: "Dining", calendar: "Calendar" }

const TAG_COLORS = {
  class:    { pill: "bg-indigo-100 text-indigo-700 border-indigo-200",    bar: "bg-indigo-400",  dark: "bg-indigo-900 text-indigo-300 border-indigo-700" },
  work:     { pill: "bg-orange-100 text-orange-700 border-orange-200",    bar: "bg-orange-400",  dark: "bg-orange-900 text-orange-300 border-orange-700" },
  sleep:    { pill: "bg-purple-100 text-purple-700 border-purple-200",    bar: "bg-purple-400",  dark: "bg-purple-900 text-purple-300 border-purple-700" },
  personal: { pill: "bg-green-100 text-green-700 border-green-200",       bar: "bg-green-400",   dark: "bg-green-900 text-green-300 border-green-700" },
  meeting:  { pill: "bg-blue-100 text-blue-700 border-blue-200",          bar: "bg-blue-400",    dark: "bg-blue-900 text-blue-300 border-blue-700" },
}

const DOODLES = [
  { emoji: "👾", x: 5,  y: 8,  size: 28, dur: 7  },
  { emoji: "🌀", x: 88, y: 5,  size: 22, dur: 9  },
  { emoji: "⭐", x: 15, y: 75, size: 18, dur: 6  },
  { emoji: "��", x: 80, y: 70, size: 30, dur: 11 },
  { emoji: "🌙", x: 50, y: 3,  size: 20, dur: 8  },
  { emoji: "💫", x: 92, y: 40, size: 16, dur: 7  },
  { emoji: "🎮", x: 3,  y: 45, size: 24, dur: 10 },
  { emoji: "🦕", x: 70, y: 88, size: 26, dur: 9  },
  { emoji: "🎸", x: 30, y: 90, size: 20, dur: 8  },
  { emoji: "🍕", x: 60, y: 15, size: 18, dur: 6  },
]

function FloatingDoodles({ dark }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {DOODLES.map((d, i) => (
        <div key={i} className={`absolute select-none animate-bounce ${dark ? "opacity-5" : "opacity-10"}`}
          style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: d.size, animationDuration: `${d.dur}s`, animationDelay: `${i * 0.4}s` }}>
          {d.emoji}
        </div>
      ))}
    </div>
  )
}

function useTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function timeToMinutes(t) {
  if (!t) return 0
  const clean = t.replace(/\s/g, "").toUpperCase()
  const isPM = clean.includes("PM"), isAM = clean.includes("AM")
  const stripped = clean.replace("AM", "").replace("PM", "")
  const [h, m = "0"] = stripped.split(":")
  let hours = parseInt(h)
  if (isPM && hours !== 12) hours += 12
  if (isAM && hours === 12) hours = 0
  return hours * 60 + parseInt(m)
}

function minutesToLabel(mins) {
  const total = ((mins % 1440) + 1440) % 1440
  const h = Math.floor(total / 60), m = total % 60
  const ampm = h >= 12 ? "PM" : "AM"
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${m.toString().padStart(2, "0")} ${ampm}`
}

const DAY_MINS = 24 * 60
const VISIBLE_DAYS = 7
const TOTAL_MINS = DAY_MINS * VISIBLE_DAYS
const PX_PER_MIN = 3

function Card({ children, className = "", dark }) {
  return (
    <div className={`backdrop-blur-sm border rounded-3xl shadow-sm p-5 relative z-10 transition-colors duration-300
      ${dark ? "bg-gray-900/90 border-gray-800" : "bg-white/85 border-gray-100"} ${className}`}>
      {children}
    </div>
  )
}

function CardTitle({ children, dark, action }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-gray-500" : "text-gray-400"}`}>{children}</p>
      {action}
    </div>
  )
}

function Header({ dark, setDark, user, logout }) {
  const now = useTime()
  const base = dark ? "text-white" : "text-gray-900"
  const sub = dark ? "text-gray-400" : "text-gray-500"
  return (
    <div className="flex justify-between items-center px-6 pt-8 pb-6 relative z-10">
      <div className="flex items-center gap-3">
        {user?.picture && <img src={user.picture} className="w-10 h-10 rounded-full border-2 border-indigo-200" alt="avatar" />}
        <div>
          <p className={`text-4xl font-black tracking-tight ${base}`}>DailyDock</p>
          <p className={`text-base mt-0.5 ${sub}`}>{getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <p className={`text-4xl font-black tabular-nums ${base}`}>
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className={`text-sm ${sub}`}>
            {now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDark(d => !d)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${dark ? "bg-gray-800 text-yellow-300 border border-gray-700" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={logout}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${dark ? "bg-gray-800 text-gray-400 border border-gray-700" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

function Timeline({ classes, calendarEvents, dark }) {
  const now = useTime()
  const scrollRef = useRef(null)
  const dragRef = useRef(null)
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dd_tasks") || "[]") } catch { return [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [form, setForm] = useState({ title: "", tag: "personal", location: "" })

  useEffect(() => { localStorage.setItem("dd_tasks", JSON.stringify(tasks)) }, [tasks])

  useEffect(() => {
    if (scrollRef.current) {
      const nowMins = now.getHours() * 60 + now.getMinutes()
      scrollRef.current.scrollLeft = Math.max(0, nowMins * PX_PER_MIN - 120)
    }
  }, [])

  const nowMins = now.getHours() * 60 + now.getMinutes()

  const classItems = classes.map(c => ({
    id: `class-${c.id}`, title: c.course_name, tag: "class",
    location: c.location, start_min: timeToMinutes(c.start_time),
    end_min: timeToMinutes(c.end_time), readonly: true
  }))

  const calItems = (calendarEvents || [])
    .filter(e => e.start?.includes("T"))
    .map((e, i) => {
      const start = new Date(e.start), end = new Date(e.end)
      const startMin = start.getHours() * 60 + start.getMinutes()
      const endMin = end.getHours() * 60 + end.getMinutes()
      return { id: `cal-${i}`, title: e.title, tag: "meeting", location: e.location, start_min: startMin, end_min: endMin, readonly: true }
    })

  const allItems = [...tasks, ...classItems, ...calItems]

  const getMinFromX = (x) => {
    if (!dragRef.current || !scrollRef.current) return 0
    const rect = dragRef.current.getBoundingClientRect()
    const relX = x - rect.left + scrollRef.current.scrollLeft
    return Math.round(relX / PX_PER_MIN / 15) * 15
  }

  const handleMouseDown = (e) => {
    if (e.target.closest(".task-block")) return
    const mins = getMinFromX(e.clientX)
    setDragStart(mins); setDragEnd(mins + 60); setIsDragging(true)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    setDragEnd(Math.max(dragStart + 15, getMinFromX(e.clientX)))
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragEnd - dragStart >= 15) setShowForm(true)
  }, [isDragging, dragStart, dragEnd])

  const handleTouchStart = (e) => {
    if (e.target.closest(".task-block")) return
    const mins = getMinFromX(e.touches[0].clientX)
    setDragStart(mins); setDragEnd(mins + 60); setShowForm(true)
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp) }
  }, [handleMouseMove, handleMouseUp])

  const handleAdd = () => {
    if (!form.title) return
    setTasks(prev => [...prev, { id: Date.now(), ...form, start_min: dragStart, end_min: dragEnd }])
    setShowForm(false)
    setForm({ title: "", tag: "personal", location: "" })
  }

  const hourMarkers = []
  for (let d = 0; d < VISIBLE_DAYS; d++) {
    for (let h = 0; h < 24; h++) {
      hourMarkers.push({ mins: d * DAY_MINS + h * 60, label: minutesToLabel(h * 60), isDay: h === 0, day: d })
    }
  }

  const barClass = (tag) => TAG_COLORS[tag]?.bar || "bg-gray-400"
  const pillClass = (tag) => dark ? TAG_COLORS[tag]?.dark : TAG_COLORS[tag]?.pill

  return (
    <Card dark={dark} className="col-span-full">
      <CardTitle dark={dark}>📅 Weekly Timeline · Drag to add tasks</CardTitle>
      <div ref={scrollRef} className="overflow-x-auto pb-2 select-none" style={{ WebkitOverflowScrolling: "touch" }}>
        <div ref={dragRef} style={{ width: TOTAL_MINS * PX_PER_MIN, position: "relative" }}
          onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} className="cursor-crosshair">
          <div className="relative h-7 mb-1" style={{ width: TOTAL_MINS * PX_PER_MIN }}>
            {hourMarkers.map(({ mins, label, isDay, day }) => (
              <div key={mins} className="absolute top-0" style={{ left: mins * PX_PER_MIN }}>
                <span className={`text-xs whitespace-nowrap ${isDay
                  ? (dark ? "text-indigo-400 font-bold" : "text-indigo-600 font-bold")
                  : (dark ? "text-gray-700" : "text-gray-300")}`}>
                  {isDay ? `Day ${day + 1}` : label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative rounded-2xl overflow-hidden"
            style={{ height: 80, width: TOTAL_MINS * PX_PER_MIN, background: dark ? "#1f2937" : "#f3f4f6" }}>
            {hourMarkers.map(({ mins, isDay }) => (
              <div key={mins} className={`absolute top-0 bottom-0 ${isDay ? "w-0.5" : "w-px"}
                ${isDay ? (dark ? "bg-gray-500" : "bg-gray-300") : (dark ? "bg-gray-700" : "bg-gray-200")}`}
                style={{ left: mins * PX_PER_MIN }} />
            ))}
            {isDragging && dragStart !== null && (
              <div className="absolute top-2 bottom-2 rounded-xl bg-indigo-400 opacity-40"
                style={{ left: dragStart * PX_PER_MIN, width: (dragEnd - dragStart) * PX_PER_MIN }} />
            )}
            {allItems.map(task => (
              <div key={task.id}
                className={`task-block absolute top-3 bottom-3 rounded-xl ${barClass(task.tag)} flex items-center px-2 overflow-hidden group`}
                style={{ left: task.start_min * PX_PER_MIN, width: Math.max((task.end_min - task.start_min) * PX_PER_MIN, 40) }}>
                <p className="text-white text-xs font-semibold truncate flex-1">{task.title}</p>
                {!task.readonly && (
                  <button onClick={e => { e.stopPropagation(); setTasks(p => p.filter(t => t.id !== task.id)) }}
                    className="text-white/60 hover:text-white text-xs ml-1 hidden group-hover:block">✕</button>
                )}
              </div>
            ))}
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20" style={{ left: nowMins * PX_PER_MIN }}>
              <div className="w-3 h-3 bg-red-500 rounded-full -translate-x-1 mt-1.5" />
            </div>
          </div>
          <div className="text-xs mt-1 text-red-400 font-semibold" style={{ paddingLeft: nowMins * PX_PER_MIN }}>
            <span className="whitespace-nowrap">▲ Now</span>
          </div>
        </div>
      </div>
      {showForm && (
        <div className={`mt-4 rounded-2xl p-4 border ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <p className={`text-xs font-semibold mb-3 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {minutesToLabel(dragStart % DAY_MINS)} → {minutesToLabel(dragEnd % DAY_MINS)}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <input placeholder="Task title *" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={`col-span-full rounded-xl px-3 py-2 text-sm outline-none border focus:ring-2 focus:ring-indigo-400
                ${dark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`} />
            <input placeholder="Location (optional)" value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className={`rounded-xl px-3 py-2 text-sm outline-none border focus:ring-2 focus:ring-indigo-400
                ${dark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`} />
            <div className="flex gap-2 flex-wrap items-center">
              {Object.keys(TAG_COLORS).map(tag => (
                <button key={tag} onClick={() => setForm({ ...form, tag })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all
                    ${form.tag === tag ? pillClass(tag) : (dark ? "bg-gray-700 text-gray-400 border-gray-600" : "bg-white text-gray-400 border-gray-200")}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl font-semibold">Add</button>
            <button onClick={() => setShowForm(false)}
              className={`text-sm px-4 py-2 rounded-xl ${dark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>Cancel</button>
          </div>
        </div>
      )}
      {allItems.length > 0 && (
        <div className="mt-4 space-y-2">
          {allItems.sort((a, b) => a.start_min - b.start_min).map(task => (
            <div key={task.id} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${barClass(task.tag)}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${dark ? "text-white" : "text-gray-800"}`}>{task.title}</p>
                {task.location && <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>📍 {task.location}</p>}
              </div>
              <p className={`text-xs shrink-0 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                {minutesToLabel(task.start_min)} – {minutesToLabel(task.end_min)}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${pillClass(task.tag)}`}>{task.tag}</span>
              {!task.readonly && (
                <button onClick={() => setTasks(p => p.filter(t => t.id !== task.id))}
                  className={`text-xs ${dark ? "text-gray-600 hover:text-red-400" : "text-gray-300 hover:text-red-400"}`}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371e3
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180
  const dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function ShuttleCard({ dark }) {
  const [shuttles, setShuttles] = useState(null)
  const [stops, setStops] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(false)
  const [nearestStops, setNearestStops] = useState([])

  useEffect(() => {
    const fetchShuttles = () => axios.get(`${API}/shuttles`).then(res => setShuttles(res.data))
    fetchShuttles()
    const t = setInterval(fetchShuttles, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    axios.get(`${API}/stops`).then(res => setStops(res.data))
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError(true); return }
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError(true),
      { timeout: 8000 }
    )
  }, [])

  useEffect(() => {
    if (!userLocation || stops.length === 0) return
    const sorted = stops
      .map(s => ({ ...s, dist: haversine(userLocation.lat, userLocation.lng, s.lat, s.lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
    setNearestStops(sorted)
  }, [userLocation, stops])

  const active = shuttles?.filter(s => s.in_service === 1 && s.route_name !== "Route 777") || []
  const inactive = shuttles?.filter(s => s.in_service === 0 && s.route_name !== "Route 777") || []
  const nearestStopIds = new Set(nearestStops.map(s => s.id))
  const nearbyBuses = active.filter(s => nearestStopIds.has(s.next_stop_id))
  const otherBuses = active.filter(s => !nearestStopIds.has(s.next_stop_id))

  const BusRow = ({ s, highlight }) => (
    <div className={`flex justify-between items-center rounded-2xl px-4 py-3 ${
      highlight
        ? (dark ? "bg-indigo-900/40 border border-indigo-700" : "bg-indigo-50 border border-indigo-200")
        : (dark ? "bg-gray-800" : "bg-gray-50")
    }`}>
      <div>
        <div className="flex items-center gap-2">
          <p className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>{s.route_name}</p>
          {highlight && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">Near you</span>}
        </div>
        <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>Next · {s.next_stop_time}</p>
      </div>
      <div className="text-right">
        <p className={`text-2xl font-black ${highlight ? "text-indigo-500" : (dark ? "text-gray-300" : "text-gray-700")}`}>
          {s.minutes_to_next_stop ?? "–"}
        </p>
        <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>min away</p>
      </div>
    </div>
  )

  return (
    <Card dark={dark}>
      <CardTitle dark={dark}>🚌 Live Shuttles</CardTitle>
      {userLocation && nearestStops.length > 0 && (
        <p className={`text-xs mb-3 ${dark ? "text-gray-500" : "text-gray-400"}`}>
          📍 Nearest stop: {nearestStops[0].name} · {Math.round(nearestStops[0].dist)}m away
        </p>
      )}
      {locationError && (
        <p className={`text-xs mb-3 ${dark ? "text-gray-600" : "text-gray-300"}`}>
          📍 Enable location for personalized results
        </p>
      )}
      {!shuttles ? <p className={`text-sm ${dark ? "text-gray-600" : "text-gray-300"}`}>Loading...</p> : (
        <>
          {active.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">🚌</p>
              <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>No shuttles in service</p>
            </div>
          ) : (
            <div className="space-y-3 mb-3">
              {nearbyBuses.map((s, i) => <BusRow key={i} s={s} highlight={true} />)}
              {otherBuses.map((s, i) => <BusRow key={i} s={s} highlight={false} />)}
              {nearbyBuses.length === 0 && active.length > 0 && (
                <p className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>
                  No buses stopping near you right now
                </p>
              )}
            </div>
          )}
          {inactive.length > 0 && (
            <details>
              <summary className={`text-xs cursor-pointer ${dark ? "text-gray-600" : "text-gray-300"}`}>
                {inactive.length} routes not in service
              </summary>
              <div className="mt-2 space-y-1.5">
                {inactive.map((s, i) => (
                  <div key={i} className={`flex justify-between rounded-xl px-3 py-2 ${dark ? "bg-gray-800/50" : "bg-gray-50"}`}>
                    <p className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>{s.route_name}</p>
                    <p className={`text-xs ${dark ? "text-gray-700" : "text-gray-300"}`}>Out of service</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
      <p className={`text-xs mt-3 ${dark ? "text-gray-700" : "text-gray-300"}`}>Refreshes every 30s</p>
    </Card>
  )
}

function WeatherCard({ dark }) {
  const [weather, setWeather] = useState(null)
  useEffect(() => { axios.get(`${API}/weather`).then(res => setWeather(res.data)) }, [])
  return (
    <Card dark={dark}>
      <CardTitle dark={dark}>🌤 Weather · Binghamton</CardTitle>
      {!weather ? <p className={`text-sm ${dark ? "text-gray-600" : "text-gray-300"}`}>Loading...</p> : (
        <>
          <p className={`text-6xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>{Math.round(weather.temperature)}°</p>
          <p className={`capitalize text-sm mt-1 ${dark ? "text-gray-400" : "text-gray-400"}`}>{weather.description}</p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[{ label: "Feels", value: `${Math.round(weather.feels_like)}°` }, { label: "Humidity", value: `${weather.humidity}%` }, { label: "Wind", value: `${weather.wind_speed}mph` }].map(({ label, value }) => (
              <div key={label} className={`rounded-2xl p-3 text-center ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
                <p className={`font-bold text-sm mt-1 ${dark ? "text-white" : "text-gray-900"}`}>{value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

function DiningCard({ dark }) {
  const [dining, setDining] = useState(null)
  const [hall, setHall] = useState(null)
  const [meal, setMeal] = useState("Lunch")
  useEffect(() => {
    axios.get(`${API}/dining`).then(res => { setDining(res.data); setHall(Object.keys(res.data)[0]) })
  }, [])
  if (!dining) return <Card dark={dark}><p className={`text-sm ${dark ? "text-gray-600" : "text-gray-300"}`}>Loading...</p></Card>
  const halls = Object.keys(dining)
  const meals = hall ? Object.keys(dining[hall]) : []
  const items = hall && meal ? dining[hall][meal] || [] : []
  const btn = (active) => active ? "bg-indigo-500 text-white" : (dark ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200")
  return (
    <Card dark={dark}>
      <CardTitle dark={dark}>�� Dining Hall</CardTitle>
      <div className="flex gap-2 flex-wrap mb-2">
        {halls.map(h => <button key={h} onClick={() => setHall(h)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${hall === h ? "bg-emerald-500 text-white" : btn(false)}`}>{h}</button>)}
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        {meals.map(m => <button key={m} onClick={() => setMeal(m)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${btn(meal === m)}`}>{m}</button>)}
      </div>
      <div className="space-y-1.5 max-h-52 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className={`flex justify-between items-center rounded-xl px-3 py-2 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
            <p className={`text-sm ${dark ? "text-white" : "text-gray-800"}`}>{item.item_name}</p>
            <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{item.category}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CalendarCard({ dark, authHeaders }) {
  const [events, setEvents] = useState(null)
  useEffect(() => {
    if (!authHeaders?.Authorization) return
    axios.get(`${API}/calendar/events`, { headers: authHeaders })
      .then(res => setEvents(res.data))
      .catch(() => setEvents([]))
  }, [authHeaders?.Authorization])

  const formatTime = iso => !iso || iso.length === 10 ? "All day" : new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const formatDate = iso => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })

  if (!events) return <Card dark={dark} className="col-span-full"><p className={`text-sm ${dark ? "text-gray-600" : "text-gray-300"}`}>Loading calendar...</p></Card>

  return (
    <Card dark={dark} className="col-span-full">
      <CardTitle dark={dark}>🗓 Upcoming Events & Shifts</CardTitle>
      {events.length === 0 ? (
        <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>No upcoming events</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.filter(e => e.title !== "Office").map((e, i) => (
            <div key={i} className={`border rounded-2xl p-4 ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
              <p className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>{e.title}</p>
              <p className="text-indigo-500 text-xs mt-1 font-medium">{formatDate(e.start)}</p>
              <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{formatTime(e.start)} – {formatTime(e.end)}</p>
              {e.location && <p className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>📍 {e.location}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function BottomBar({ active, setActive, dark }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 flex justify-around items-center px-4 py-3 z-50 md:hidden border-t transition-colors duration-300
      ${dark ? "bg-gray-950/95 border-gray-800" : "bg-white/95 border-gray-100"} backdrop-blur-md`}>
      {TABS.map(tab => (
        <button key={tab} onClick={() => setActive(tab)}
          className={`flex flex-col items-center gap-0.5 transition-all ${active === tab ? "scale-110" : "opacity-40"}`}>
          <span className="text-xl">{TAB_ICONS[tab]}</span>
          <span className={`text-xs font-bold ${active === tab ? "text-indigo-500" : (dark ? "text-gray-500" : "text-gray-400")}`}>
            {TAB_LABELS[tab]}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ dark, setDark, token, onLogout }) {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("timeline")
  const [classes, setClasses] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const authHeaders = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${API}/auth/me`, { headers: authHeaders })
      .then(res => setUser(res.data))
      .catch(() => onLogout())
  }, [token])

  useEffect(() => {
    if (!token) return
    axios.get(`${API}/schedule`, { headers: authHeaders }).then(res => setClasses(res.data)).catch(() => {})
    axios.get(`${API}/calendar/events`, { headers: authHeaders }).then(res => setCalendarEvents(res.data)).catch(() => {})
  }, [token])

  const bg = dark
    ? "min-h-screen bg-gray-950 transition-colors duration-300"
    : "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 transition-colors duration-300"

  const props = { dark, authHeaders }

  return (
    <div className={bg}>
      <FloatingDoodles dark={dark} />
      <div className="max-w-6xl mx-auto pb-28 md:pb-10">
        <Header dark={dark} setDark={setDark} user={user} logout={onLogout} />
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-5">
          <Timeline classes={classes} calendarEvents={calendarEvents} {...props} />
          <ShuttleCard {...props} />
          <WeatherCard {...props} />
          <DiningCard {...props} />
          <CalendarCard {...props} />
        </div>
        <div className="md:hidden px-4">
          {activeTab === "timeline" && <Timeline classes={classes} calendarEvents={calendarEvents} {...props} />}
          {activeTab === "shuttle" && <ShuttleCard {...props} />}
          {activeTab === "weather" && <WeatherCard {...props} />}
          {activeTab === "dining" && <DiningCard {...props} />}
          {activeTab === "calendar" && <CalendarCard {...props} />}
        </div>
      </div>
      <BottomBar active={activeTab} setActive={setActiveTab} dark={dark} />
    </div>
  )
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false)
  const [token, setToken] = useState(() => {
    // Check URL params first on initial load
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get("token")
    if (urlToken) {
      localStorage.setItem("dd_token", urlToken)
      window.history.replaceState({}, "", "/")
      return urlToken
    }
    return localStorage.getItem("dd_token")
  })

  const handleLogout = () => {
    localStorage.removeItem("dd_token")
    localStorage.removeItem("dd_tasks")
    setToken(null)
  }

  return (
    <Routes>
      <Route path="/login" element={<Login dark={dark} setDark={setDark} />} />
      <Route path="/" element={
        token
          ? <Dashboard dark={dark} setDark={setDark} token={token} onLogout={handleLogout} />
          : <Login dark={dark} setDark={setDark} />
      } />
    </Routes>
  )
}
