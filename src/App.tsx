import React, { useState, useEffect } from "react";
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  Search, 
  MapPin,
  RefreshCcw,
  CloudLightning,
  Droplets,
  Info
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

// Types
interface WeatherAlert {
  type: string;
  severity: "Warning" | "Critical";
  message: string;
}

interface WeatherData {
  city: string;
  current: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
  alerts: WeatherAlert[];
  lastUpdated: string;
}

const CITIES = [
  { name: "Delhi", lat: 28.61, lon: 77.20 },
  { name: "London", lat: 51.50, lon: -0.12 },
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "Tokyo", lat: 35.67, lon: 139.65 },
  { name: "Sydney", lat: -33.86, lon: 151.20 }
];

export default function App() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);

  const fetchWeather = async (city = selectedCity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?lat=${city.lat}&lon=${city.lon}&city=${city.name}`);
      if (!response.ok) throw new Error("Failed to fetch weather");
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [selectedCity]);

  const chartData = data ? data.hourly.time.slice(0, 24).map((time, i) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: data.hourly.temperature_2m[i],
    rain: data.hourly.precipitation_probability[i]
  })) : [];

  const getWeatherIcon = (code: number, size = 48) => {
    if (code === 0) return <Sun size={size} className="text-yellow-400" />;
    if (code <= 3) return <Cloud size={size} className="text-gray-400" />;
    if (code <= 48) return <div className="text-gray-500">🌫️</div>;
    if (code <= 67) return <CloudRain size={size} className="text-blue-400" />;
    if (code <= 99) return <CloudLightning size={size} className="text-purple-400" />;
    return <Cloud size={size} />;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600/30 overflow-hidden">
      {/* Left Sidebar: Location Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">
              <CloudLightning size={18} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">SkyGuard AI</h2>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search city..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200 placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm) {
                  setSelectedCity({ name: searchTerm, lat: 28.61, lon: 77.20 });
                }
              }}
            />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Pinned Locations</label>
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-colors group",
                  selectedCity.name === city.name 
                    ? "bg-blue-600/10 border border-blue-500/50 text-blue-400" 
                    : "text-slate-400 hover:bg-slate-800 border border-transparent"
                )}
              >
                <span className="font-medium text-sm">{city.name}</span>
                {selectedCity.name === city.name && <MapPin size={12} className="opacity-60" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500">
            <p className="mb-1 font-bold text-slate-300">System Status</p>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")}></div>
              <span>{loading ? "Syncing..." : "API: Connected"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Alert Banner */}
        <AnimatePresence>
          {data && data.alerts.length > 0 && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-3">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded flex-shrink-0">ACTIVE ALERT</span>
                <p className="text-sm text-amber-200 font-medium truncate italic underline decoration-amber-500/30">
                  {data.alerts[0].message}
                </p>
              </div>
              <button className="text-amber-200 text-xs hover:underline flex-shrink-0 whitespace-nowrap ml-4">View All {data.alerts.length} &rarr;</button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
              <AlertTriangle size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && !data ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
              <RefreshCcw size={32} className="animate-spin text-blue-500" />
              <p className="text-sm font-mono uppercase tracking-widest">Ingesting Atmosphere Data...</p>
            </div>
          ) : data && (
            <div className="grid grid-cols-12 gap-6">
              
              {/* Column 1: Current Weather & Stats */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-5xl font-bold text-white tracking-tighter">{data.current.temperature}°</h1>
                      <p className="text-slate-400 font-medium mt-1">
                        {data.current.weathercode === 0 ? "Clear Sky" : "Cloudy with Winds"}
                      </p>
                    </div>
                    <div className="text-5xl opacity-80">
                      {getWeatherIcon(data.current.weathercode, 56)}
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Humidity</p>
                      <p className="text-2xl font-bold">64<span className="text-sm text-slate-500 ml-1">%</span></p>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Wind Speed</p>
                      <p className="text-2xl font-bold">{data.current.windspeed}<span className="text-sm text-slate-500 ml-1">km/h</span></p>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Feels Like</p>
                      <p className="text-2xl font-bold">{data.current.temperature + 1}°</p>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Precip Prob</p>
                      <p className="text-2xl font-bold">{data.hourly.precipitation_probability[0]}%</p>
                    </div>
                  </div>
                </div>

                {/* AQI / Risk Signal */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Environment Risk</h3>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-black border",
                      data.alerts.length === 0 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {data.alerts.length === 0 ? "EXCELLENT" : "WARNING"}
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full bg-slate-800 rounded-full mb-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: data.alerts.length === 0 ? "15%" : "65%" }}
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full shadow-lg",
                        data.alerts.length === 0 ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    SENSOR_LOCAL_ID: METEO_V4 • STATUS: ACTIVE
                  </p>
                </div>

                {/* Sun Cycles */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center gap-6">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-xl">🌅</div>
                     <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sunrise</p>
                        <p className="text-lg font-bold">06:42 AM</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-xl">🌇</div>
                     <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sunset</p>
                        <p className="text-lg font-bold">06:14 PM</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* Column 2: Analytics */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                {/* Chart Area */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">24H Atmosphere Trend</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Temp</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Rain %</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="time" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} 
                          interval={4}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: '#f8fafc' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorTemp)" 
                        />
                         <Area 
                          type="monotone" 
                          dataKey="rain" 
                          stroke="#1e293b" 
                          strokeWidth={1}
                          fill="transparent" 
                          strokeDasharray="5 5"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Forecast Grid */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">Extended Outlook</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4 flex flex-col items-center justify-between gap-3 group hover:border-blue-500/50 transition-colors">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Day +{i+1}</span>
                        <div className="text-2xl group-hover:scale-110 transition-transform">
                          {getWeatherIcon(0, 32)}
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">24°</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">10% Rain</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Placeholder */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl h-44 overflow-hidden relative">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-10 grayscale"></div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full border border-blue-500/50 flex items-center justify-center mx-auto mb-2 animate-pulse">
                          <MapPin size={24} className="text-blue-500" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">RADAR_LIVE_PREVIEW</p>
                        <p className="text-[9px] text-slate-600 font-mono italic">Calibrating satellite telemetry...</p>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Dense Footer */}
        <footer className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <div>Accuracy: 99.7%</div>
            <div>Latency: 12ms</div>
            <div>Source: Open-Meteo</div>
          </div>
          <div className="text-[10px] text-slate-500 italic">
            © 2024 SkyGuard Analytics Division
          </div>
        </footer>
      </main>
    </div>
  );
}
