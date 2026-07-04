import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://127.0.0.1:8000/api"

function WeatherCard() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    axios.get(`${API}/weather`).then(res => setWeather(res.data))
  }, [])

  if (!weather) return <div className="bg-gray-900 rounded-2xl p-5">Loading weather...</div>

  return (
    <div className="bg-gray-900 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-3 text-gray-400">Weather · Binghamton</h2>
      <p className="text-5xl font-bold">{Math.round(weather.temperature)}°F</p>
      <p className="text-gray-400 mt-1 capitalize">{weather.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
        <p>Feels like: {Math.round(weather.feels_like)}°F</p>
        <p>Humidity: {weather.humidity}%</p>
        <p>Wind: {weather.wind_speed} mph</p>
      </div>
    </div>
  )
}

function ShuttleCard() {
  const [shuttles, setShuttles] = useState(null)

  useEffect(() => {
    axios.get(`${API}/shuttles`).then(res => setShuttles(res.data))
    const interval = setInterval(() => {
      axios.get(`${API}/shuttles`).then(res => setShuttles(res.data))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!shuttles) return <div className="bg-gray-900 rounded-2xl p-5">Loading shuttles...</div>

  return (
    <div className="bg-gray-900 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-3 text-gray-400">Live Shuttles</h2>
      {shuttles.length === 0 ? (
        <p className="text-gray-500">No shuttles currently in service</p>
      ) : (
        <div className="space-y-3">
          {shuttles.map((s, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Route {s.route_id}</p>
                <span className="text-green-400 text-sm">● In Service</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Next stop in {s.minutes_to_next_stop} min · {s.next_stop_time}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="text-gray-600 text-xs mt-3">Updates every 30 seconds</p>
    </div>
  )
}

function DiningCard() {
  const [dining, setDining] = useState(null)
  const [selectedHall, setSelectedHall] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState("Lunch")

  useEffect(() => {
    axios.get(`${API}/dining`).then(res => {
      setDining(res.data)
      setSelectedHall(Object.keys(res.data)[0])
    })
  }, [])

  if (!dining) return <div className="bg-gray-900 rounded-2xl p-5">Loading dining...</div>

  const halls = Object.keys(dining)
  const meals = selectedHall ? Object.keys(dining[selectedHall]) : []
  const items = selectedHall && selectedMeal ? dining[selectedHall][selectedMeal] || [] : []

  return (
    <div className="bg-gray-900 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-3 text-gray-400">Dining Hall Menu</h2>
      <div className="flex gap-2 mb-3 flex-wrap">
        {halls.map(hall => (
          <button key={hall} onClick={() => setSelectedHall(hall)}
            className={`px-3 py-1 rounded-full text-sm ${selectedHall === hall ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"}`}>
            {hall}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {meals.map(meal => (
          <button key={meal} onClick={() => setSelectedMeal(meal)}
            className={`px-3 py-1 rounded-full text-sm ${selectedMeal === meal ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>
            {meal}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center bg-gray-800 rounded-xl px-3 py-2">
            <p className="text-sm">{item.item_name}</p>
            <span className="text-xs text-gray-500">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

function ScheduleCard() {
  const [classes, setClasses] = useState([])
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    course_name: "", course_code: "", professor: "",
    location: "", day_of_week: "Monday", start_time: "", end_time: ""
  })

  const fetchClasses = () => {
    axios.get(`${API}/schedule`).then(res => setClasses(res.data))
  }

  useEffect(() => { fetchClasses() }, [])

  const handleAdd = () => {
    axios.post(`${API}/schedule`, form).then(() => {
      fetchClasses()
      setShowForm(false)
      setForm({ course_name: "", course_code: "", professor: "", location: "", day_of_week: "Monday", start_time: "", end_time: "" })
    })
  }

  const handleDelete = (id) => {
    axios.delete(`${API}/schedule/${id}`).then(fetchClasses)
  }

  const filtered = classes.filter(c => c.day_of_week === selectedDay)

  return (
    <div className="bg-gray-900 rounded-2xl p-5 col-span-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-400">My Class Schedule</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">
          {showForm ? "Cancel" : "+ Add Class"}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 bg-gray-800 p-4 rounded-xl">
          {["course_name", "course_code", "professor", "location", "start_time", "end_time"].map(field => (
            <input key={field} placeholder={field.replace("_", " ")}
              value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 outline-none"
            />
          ))}
          <select value={form.day_of_week}
            onChange={e => setForm({ ...form, day_of_week: e.target.value })}
            className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none">
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl col-span-2 md:col-span-1">
            Save Class
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {DAYS.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`px-3 py-1 rounded-full text-sm ${selectedDay === day ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>
            {day}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No classes on {selectedDay}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{c.course_name}</p>
                  <p className="text-gray-400 text-sm">{c.course_code}</p>
                </div>
                <button onClick={() => handleDelete(c.id)}
                  className="text-red-400 hover:text-red-300 text-xs">✕</button>
              </div>
              <div className="mt-2 text-sm text-gray-400 space-y-1">
                <p>👤 {c.professor}</p>
                <p>📍 {c.location}</p>
                <p>🕐 {c.start_time} – {c.end_time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">DailyDock</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WeatherCard />
        <ShuttleCard />
        <DiningCard />
        <ScheduleCard />
      </div>
    </div>
  )
}
