import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";
import { apiGet, apiPost } from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


interface Car {
  id: number;
  license_plate: string;
  type: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
}

export default function NewBooking() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [busyCarIds, setBusyCarIds] = useState<Set<number>>(new Set());
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | "">("");
  type AvailabilityDay = { date: string; times: string[] };
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());

  const goToPrevMonth = () => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  useEffect(() => {
    const loadCars = async () => {
      try {
        const data = await apiGet("/cars", token);
        setCars(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Hiba az autók betöltésekor:", err);
      }
    };
    if (token) loadCars();
  }, [token]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await apiGet("/services", token);
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Nem sikerült lekérni a szolgáltatásokat:", err);
      }
    };
    loadServices();
  }, []);
  useEffect(() => {
    const loadBooked = async () => {
      try {
        const data = await apiGet("/bookings", token);
        if (Array.isArray(data)) {
          const busy = new Set<number>();
          data.forEach((b: any) => {
            if (b.status && !String(b.status).toLowerCase().includes("kész")) {
              busy.add(b.car_id);
            }
          });
          setBusyCarIds(busy);
        }
      } catch (err) {
        console.error("Nem sikerült lekérni a foglalásokat:", err);
      }
    };
    loadBooked();
  }, [token]);

  useEffect(() => {
    const loadAvailability = async () => {
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const ymdLocal = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

      const year = displayedMonth.getFullYear();
      const month = displayedMonth.getMonth();
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const from = ymdLocal(first);
      const to = ymdLocal(last);
      try {
        const data = await apiGet(`/bookings/availability?from=${from}&to=${to}`, token);
        setAvailability(Array.isArray(data) ? (data as any) : []);
      } catch (err) {
        console.error("Nem sikerült lekérni az elérhető időpontokat:", err);
        setAvailability([]);
      }
    };
    loadAvailability();
  }, [displayedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedDate || !selectedTime || !selectedCar) {
      setError("Kérem, válasszon dátumot, időpontot és autót.");
      return;
    }
    const dateTime = `${selectedDate} ${selectedTime}`;
    try {
      const res = await apiPost(
        "/bookings",
        {
          car_id: selectedCar,
          date: dateTime,
          note,
          service_id: selectedService === "" ? undefined : selectedService,
        },
        token
      );
      if (res.message && res.message.toLowerCase().includes("létrehozva")) {
        setSuccess("Foglalás sikeresen létrehozva!");
        setTimeout(() => {
          navigate("/dashboard?tab=bookings");
        }, 2000);
      } else {
        setError(res.message || "Hiba történt a foglalás során.");
      }
    } catch (err) {
      console.error(err);
      setError("Nem sikerült létrehozni a foglalást.");
    }
  };

  const availableDateSet = new Set(
    availability.filter((d) => Array.isArray(d.times) && d.times.length > 0).map((d) => d.date)
  );
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }
  while (calendarCells.length < totalCells) {
    calendarCells.push(null);
  }

  return (
    <>
    <Navbar />
      <main className="min-h-screen bg-gray-50 px-6 py-6">
        <button
          onClick={() => navigate("/dashboard?tab=bookings")}
          className="text-gray-600 hover:underline mb-4"
        >
          &lt; Vissza a foglalásokhoz
        </button>
        <h1 className="text-2xl font-bold mb-6">Új időpont foglalás</h1>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Dátum választás</label>
            <div className="bg-white rounded-lg shadow p-3 w-full">
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="px-2 py-1 rounded hover:bg-gray-100"
                >
                  &lt;
                </button>
                <span className="font-medium">
                  {displayedMonth.toLocaleDateString("hu-HU", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="px-2 py-1 rounded hover:bg-gray-100"
                >
                  &gt;
                </button>
              </div>
              <div className="grid grid-cols-7 text-xs text-center text-gray-500 mb-1">
                {['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'].map((name) => (
                  <div key={name}>{name}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarCells.map((cell, idx) => {
                  if (cell === null) {
                    return <div key={idx} className="p-2" />;
                  }
                  const dateObj = new Date(year, month, cell);
                  const pad2 = (n: number) => String(n).padStart(2, "0");
                  const iso = `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
                  const isAvailable = availableDateSet.has(iso);
                  const isSelected = selectedDate === iso;
                  const t = new Date();
                  const todayIso = `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
                    const isToday = iso === todayIso;
                  const isPast = iso < todayIso;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isAvailable && !isPast) {
                          setSelectedDate(iso);
                          setSelectedTime("");
                        }
                      }}
                      disabled={!isAvailable || isPast}
                      className={[
                        "w-8 h-8 flex items-center justify-center rounded-full", 
                        isSelected
                          ? "bg-black text-white"
                          : isAvailable
                          ? isToday
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-800 hover:bg-gray-200"
                          : "text-gray-400 cursor-not-allowed"
                      ].join(" ")}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
            {selectedDate && (
              <div>
                <label className="block mb-1 font-medium">Időpont választás</label>
                <div className="grid grid-cols-3 gap-2">
                  {(() => {
                    const day = availability.find((s) => s.date === selectedDate);
                    if (!day || !Array.isArray(day.times) || day.times.length === 0) {
                      return (
                        <div className="col-span-3 text-sm text-gray-500">Nincs szabad időpont ezen a napon.</div>
                      );
                    }
                    return day.times.map((time) => {
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          disabled={false}
                          className={`px-3 py-2 rounded border text-center text-sm ${
                            selectedTime === time
                              ? "bg-black text-white"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">Autó kiválasztása</label>
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(Number(e.target.value))}
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="">Válassza ki az autót</option>
                {cars
                  .filter((c) => !busyCarIds.has(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.license_plate} – {c.type}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Szolgáltatás választása</label>
              <select
                value={selectedService}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedService(val === "" ? "" : Number(val));
                }}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Egyik sem a felsoroltak közül</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} – {Number(s.price).toLocaleString('hu-HU')} Ft
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Az árak tájékoztató jellegűek és változhatnak.
              </p>
            </div>
            <div>
              <label className="block mb-1 font-medium">Megjegyzés (opcionális)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                rows={4}
                placeholder="Írja le a problémát vagy a kért szolgáltatást..."
              ></textarea>
            </div>
          </div>
          <div className="md:col-span-2 mt-4">
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {success && <p className="text-green-600 mb-2">{success}</p>}
            <h2 className="text-lg font-semibold mb-2">Foglalás összegzése</h2>
            <div className="border rounded-lg p-4 bg-white shadow">
              <p>
                <span className="font-medium">Dátum:</span>{" "}
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("hu-HU", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "Nincs kiválasztva"}
              </p>
              <p>
                <span className="font-medium">Időpont:</span>{" "}
                {selectedTime || "Nincs kiválasztva"}
              </p>
              <p>
                <span className="font-medium">Autó:</span>{" "}
                {selectedCar
                  ? cars.find((c) => c.id === selectedCar)?.license_plate
                  : "Nincs kiválasztva"}
              </p>
              <p>
                <span className="font-medium">Szolgáltatás:</span>{" "}
                {selectedService
                  ? (() => {
                      const svc = services.find((s) => s.id === selectedService);
                      return svc
                        ? `${svc.name} – ${Number(svc.price).toLocaleString("hu-HU")} Ft`
                        : "";
                    })()
                  : "Nincs kiválasztva"}
              </p>
            </div>
            <button
              type="submit"
              className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
            >
              Foglalás megerősítése
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}