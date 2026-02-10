import { useState, useEffect, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { apiGet, apiPut, apiPost, apiDelete } from "../api/api";
import { formatBookingHu } from "../utils/datetime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface BookingWithDetails {
  id: number;
  user_id: number;
  car_id: number;
  date: string;
  note: string;
  status: string;
  user_name: string;
  user_phone: string;
  license_plate: string;
  car_type: string;
  hours?: number;
  cost?: number;
  description?: string;
  noteToClient?: string;
  service_id?: number;
  service_name?: string;
  service_work_hours?: number;
  service_price?: number;
}

interface CarWithOwner {
  id: number;
  owner_id: number;
  license_plate: string;
  type: string;
  status: string;
  user_name: string;
  user_phone: string;
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  work_hours?: number;
}

export default function AdminDashboard() {
  const { token, user, ready } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState<"bookings" | "cars" | "notifications">(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "cars" || tab === "notifications" || tab === "bookings") return tab;
    return "bookings";
  });

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [cars, setCars] = useState<CarWithOwner[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingModal, setBookingModal] = useState<BookingWithDetails | null>(null);
  const [carModal, setCarModal] = useState<CarWithOwner | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string>("");

  const [editHours, setEditHours] = useState<string>("");
  const [editCost, setEditCost] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editNoteToClient, setEditNoteToClient] = useState<string>("");

  const [editCarLicense, setEditCarLicense] = useState("");
  const [editCarType, setEditCarType] = useState("");
  const [editCarStatus, setEditCarStatus] = useState("");

  const [notificationUsers, setNotificationUsers] = useState<number[]>([]);
  const [notificationType, setNotificationType] = useState<string>("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [bookingSearch, setBookingSearch] = useState<string>("");

  const loadData = async () => {
    if (!token) return;
    try {
      const [bookingData, carData, usersData] = await Promise.all([
        apiGet("/bookings", token),
        apiGet("/cars", token),
        apiGet("/users", token),
      ]);

      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setCars(Array.isArray(carData) ? carData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (!token) return;

    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);

    const interval = window.setInterval(() => {
      loadData();
    }, 20000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    const loadServices = async () => {
      if (!token) return;
      try {
        const data = await apiGet("/services", token);
        if (Array.isArray(data)) setServices(data as Service[]);
      } catch (err) {
        console.error("Nem sikerÃ¼lt lekÃ©rni a szolgÃ¡ltatÃ¡sokat:", err);
      }
    };
    loadServices();
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!token || !user) {
      navigate("/login");
    } else if ((user as any).role !== "admin") {
      navigate("/dashboard");
    }
  }, [token, user, ready, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "cars" || tab === "notifications" || tab === "bookings") {
      setSelectedTab(tab);
    }
  }, [location.search]);

  const normalizeNumOrNull = (v: any) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number(s.replace(",", "."));
    return isNaN(n) ? null : n;
  };

  const todayCount = useMemo(() => {
    const todayLabel = new Date().toLocaleDateString("hu-HU");
    return bookings.filter((b) => String(formatBookingHu(b.date)).includes(todayLabel)).length;
  }, [bookings]);

  const inProgressCount = useMemo(() => {
    return bookings.filter((b) => String(b.status ?? "") !== "Kész").length;
  }, [bookings]);

  const weeklyRevenue = useMemo(() => {
    let sum = 0;
    bookings.forEach((b) => {
      const rawCost =
        b.cost !== undefined && b.cost !== null && String(b.cost).trim() !== ""
          ? b.cost
          : b.service_price ?? null;

      if (rawCost !== null && rawCost !== undefined && String(rawCost).trim() !== "") {
        const val = Number(String(rawCost).replace(",", "."));
        if (!isNaN(val)) sum += val;
      }
    });
    return sum;
  }, [bookings]);

  const getWorkCount = (b: BookingWithDetails) => {
    if (b.hours) {
      const hrs = Number(b.hours);
      if (!isNaN(hrs)) return Math.round(hrs);
    }
    if (!b.hours && b.service_work_hours !== undefined && b.service_work_hours !== null) {
      const sh = Number(b.service_work_hours);
      if (!isNaN(sh)) return Math.round(sh);
    }
    if (b.description) {
      const parts = String(b.description)
        .split(/[;,\n]/)
        .map((p) => p.trim())
        .filter((p) => p);
      if (parts.length > 0) return parts.length;
    }
    return 0;
  };

  const handleTabClick = (tab: "bookings" | "cars" | "notifications") => {
    setSelectedTab(tab);
    navigate(`/admin?tab=${tab}`);
  };

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        if (!bookingSearch.trim()) return true;
        const term = bookingSearch.toLowerCase();
        return (
          (b.user_name && b.user_name.toLowerCase().includes(term)) ||
          (b.license_plate && b.license_plate.toLowerCase().includes(term)) ||
          (b.car_type && b.car_type.toLowerCase().includes(term)) ||
          (b.status && b.status.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        const aDone = String(a.status ?? "") === "Kész";
        const bDone = String(b.status ?? "") === "Kész";
        if (aDone !== bDone) return aDone ? 1 : -1;
        return String(a.date ?? "").localeCompare(String(b.date ?? ""));
      });
  }, [bookings, bookingSearch]);

  const openBookingModal = (booking: BookingWithDetails) => {
    setBookingModal(booking);
    setStatusUpdate(booking.status);
    setEditHours(booking.hours != null ? String(booking.hours) : "");
    setEditCost(booking.cost != null ? String(booking.cost) : "");
    setEditDescription(booking.description || "");
    setEditNoteToClient(booking.noteToClient || "");
    setUpdateFeedback(null);

    const serviceId = (booking as any).service_id;
    if (serviceId && !booking.hours && !booking.cost && !booking.description) {
      const svc = services.find((s) => s.id === serviceId);
      if (svc) {
        setEditCost(String(svc.price));
        if (svc.work_hours !== undefined && svc.work_hours !== null) {
          setEditHours(String(svc.work_hours));
        }
        setEditDescription(svc.name);
      }
    }
  };

  const closeBookingModal = () => {
    setBookingModal(null);
    setStatusUpdate("");
  };

  const saveBookingChanges = async () => {
    if (!bookingModal) return;


    try {
      await apiPut(
        `/bookings/${bookingModal.id}`,
        {
          status: statusUpdate,
          hours: normalizeNumOrNull(editHours),
          cost: normalizeNumOrNull(editCost),
          description: String(editDescription ?? "").trim() ? editDescription : null,
          noteToClient: String(editNoteToClient ?? "").trim() ? editNoteToClient : null,
        },
        token
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingModal.id
            ? {
                ...b,
                status: statusUpdate,
                hours: normalizeNumOrNull(editHours) ?? undefined,
                cost: normalizeNumOrNull(editCost) ?? undefined,
                description: String(editDescription ?? "").trim() ? editDescription : "",
                noteToClient: String(editNoteToClient ?? "").trim() ? editNoteToClient : "",
              }
            : b
        )
      );

      await loadData();

      setCars((prevCars) =>
        prevCars.map((car) =>
          car.id === bookingModal.car_id ? { ...car, status: statusUpdate } : car
        )
      );

      setUpdateFeedback("Sikeresen frissítve");
      setTimeout(() => closeBookingModal(), 1200);
    } catch (err) {
      console.error(err);
      setUpdateFeedback((err as any)?.message || "Hiba a frissítés során");
    }
  };

  const deleteCompletedBooking = async (booking: BookingWithDetails) => {
    if (!token) return;
    if (String(booking.status ?? "") !== "Kész") {
      setUpdateFeedback("Csak a kész foglalások törölhetők.");
      setTimeout(() => setUpdateFeedback(null), 2000);
      return;
    }
    const ok = window.confirm(`Biztosan törlöd ezt a kész foglalást? (#${booking.id} - ${booking.license_plate})`);
    if (!ok) return;
    try {
      await apiDelete(`/bookings/${booking.id}`, token);
      setOpenMenuId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setUpdateFeedback("Nem sikerült törölni a foglalást.");
      setTimeout(() => setUpdateFeedback(null), 2000);
    }
  };

  const openCarModal = (car: CarWithOwner) => {
    setCarModal(car);
    setEditCarLicense(car.license_plate);
    setEditCarType(car.type);
    setEditCarStatus(car.status || "Nincs státusz");
    setUpdateFeedback(null);
  };

  const closeCarModal = () => setCarModal(null);

  const saveCarChanges = async () => {
    if (!carModal) return;
    try {
      await apiPut(
        `/cars/${carModal.id}`,
        { license_plate: editCarLicense, type: editCarType, status: editCarStatus },
        token
      );
      setCars((prev) =>
        prev.map((c) =>
          c.id === carModal.id
            ? { ...c, license_plate: editCarLicense, type: editCarType, status: editCarStatus }
            : c
        )
      );
      setUpdateFeedback("Sikeresen frissítve");
      setTimeout(() => closeCarModal(), 1200);
    } catch (err) {
      console.error(err);
      setUpdateFeedback("Hiba a frissítés során");
    }
  };

  const sendNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notificationUsers.length === 0 || !notificationType.trim() || !notificationMessage.trim()) {
      setNotifFeedback("Válassza ki a címzetteket, adjon meg típust és üzenetet");
      return;
    }
    try {
      await apiPost(
        "/notifications",
        { userIds: notificationUsers, type: notificationType, message: notificationMessage },
        token
      );
      setNotifFeedback("Értesítés elküldve");
      setNotificationUsers([]);
      setNotificationType("");
      setNotificationMessage("");
      setTimeout(() => setNotifFeedback(null), 2000);
    } catch (err) {
      console.error(err);
      setNotifFeedback("Hiba történt az értesítés küldésekor");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-6 py-6 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col items-center text-center">
            <CalendarTodayIcon className="text-black mb-1 w-7 h-7" />
            <p className="text-sm text-gray-600">Mai foglalások</p>
            <p className="text-3xl font-bold text-black mt-1">{todayCount}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col items-center text-center">
            <AccessTimeIcon className="text-black mb-1 w-7 h-7" />
            <p className="text-sm text-gray-600">Folyamatban</p>
            <p className="text-3xl font-bold text-black mt-1">{inProgressCount}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col items-center text-center">
            <PersonIcon className="text-black mb-1 w-6 h-6" />
            <p className="text-sm text-gray-600">Ügyfelek száma</p>
            <p className="text-3xl font-bold text-black mt-1">{users.length}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col items-center text-center">
            <AttachMoneyIcon className="text-black mb-1 w-6 h-6" />
            <p className="text-sm text-gray-600">Heti bevétel</p>
            <p className="text-3xl font-bold text-black mt-1">{weeklyRevenue.toLocaleString("hu-HU")} Ft</p>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden w-full max-w-2xl">
          <button
            onClick={() => handleTabClick("bookings")}
            className={`flex-1 py-2 text-sm sm:text-base font-medium transition-colors ${
              selectedTab === "bookings" ? "bg-white text-black" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Foglalások
          </button>
          <button
            onClick={() => handleTabClick("cars")}
            className={`flex-1 py-2 text-sm sm:text-base font-medium transition-colors ${
              selectedTab === "cars" ? "bg-white text-black" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Autók kezelése
          </button>
          <button
            onClick={() => handleTabClick("notifications")}
            className={`flex-1 py-2 text-sm sm:text-base font-medium transition-colors ${
              selectedTab === "notifications" ? "bg-white text-black" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Értesítések
          </button>
        </div>

        {loading ? (
          <p>Betöltés...</p>
        ) : (
          <>
            {selectedTab === "bookings" && (
              <>
                <div className="flex justify-end mb-2">
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Keresés..."
                    className="border border-gray-300 rounded-lg px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ügyfél</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rendszer</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Típus</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dátum</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Státusz</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Munka</th>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-700">Művelet</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {b.user_name}
                            <div className="text-xs text-gray-500">{b.user_phone}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{b.license_plate}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{b.car_type}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatBookingHu(b.date)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                String(b.status ?? "") === "Kész"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                            {getWorkCount(b)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}
                              className="p-2 rounded-full hover:bg-gray-200"
                            >
                              <MoreVertIcon />
                            </button>
                            {openMenuId === b.id && (
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    openBookingModal(b);
                                    setOpenMenuId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Részletek/Szerkesztés
                                </button>
                                <button
                                  onClick={() => {
                                    setNotificationUsers([b.user_id]);
                                    setSelectedTab("notifications");
                                    navigate("/admin?tab=notifications");
                                    setOpenMenuId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Értesítés küldése
                                </button>
                                {String(b.status ?? "") === "Kész" && (
                                  <button
                                    onClick={() => deleteCompletedBooking(b)}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    Törlés
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {selectedTab === "cars" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ügyfél</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rendszám</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Típus</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Státusz</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-700">Művelet</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cars.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {c.user_name}
                          <div className="text-xs text-gray-500">{c.user_phone}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.license_plate}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.type}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{c.status || "Nincs státusz"}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <button
                            type="button"
                            onClick={() => openCarModal(c)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md"
                          >
                            Kezelés
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedTab === "notifications" && (
              <div className="bg-white p-6 rounded-xl shadow w-full max-w-none">
                <h2 className="text-xl font-semibold mb-4">Értesítés küldése</h2>
                <form onSubmit={sendNotifications} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ügyfelek kiválasztása</label>
                    <div className="border rounded-lg px-4 py-2 max-h-40 overflow-y-auto space-y-1">
                      {users.map((u) => (
                        <label key={u.id} className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={u.id}
                              checked={notificationUsers.includes(u.id)}
                              onChange={() => {
                                if (notificationUsers.includes(u.id)) setNotificationUsers([]);
                                else setNotificationUsers([u.id]);
                              }}
                              className="form-checkbox h-4 w-4 text-black"
                            />
                            <span>{u.name}</span>
                          </span>
                          <span className="text-xs text-gray-500">({u.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Értesítés típusa</label>
                    <select
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    >
                      <option value="">Válasszon típust...</option>
                      <option value="status">Állapotfrissítés</option>
                      <option value="reminder">Emlékeztető</option>
                      <option value="thanks">Köszönő üzenet</option>
                      <option value="other">Egyéb</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Üzenet</label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black h-40 resize-y"
                      placeholder="Írja be az üzenetet az ügyfél számára..."
                    />
                  </div>

                  {notifFeedback && <p className="text-sm text-center text-red-600 lg:col-span-2">{notifFeedback}</p>}

                  <button type="submit" className="w-full bg-black lg:col-span-2 text-white py-2 rounded-lg hover:bg-gray-800">
                    Küldés
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {bookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <h2 className="text-2xl font-semibold mb-4">Foglalás részletei</h2>
              <p className="text-sm text-gray-500 mb-4">
                {bookingModal.license_plate} – {bookingModal.user_name}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <span className="font-medium">Ügyfél neve</span>
                  <p>{bookingModal.user_name}</p>
                </div>
                <div>
                  <span className="font-medium">Megjegyzés</span>
                  <p>{bookingModal.note || "-"}</p>
                </div>
                <div>
                  <span className="font-medium">Telefonszám</span>
                  <p>{bookingModal.user_phone}</p>
                </div>
                <div>
                  <span className="font-medium">Autó típusa</span>
                  <p>{bookingModal.car_type}</p>
                </div>
                <div>
                  <span className="font-medium">Rendszám</span>
                  <p>{bookingModal.license_plate}</p>
                </div>
                <div>
                  <span className="font-medium">Időpont</span>
                  <p>{formatBookingHu(bookingModal.date)}</p>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Státusz módosítása</label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                  >
                    <option value="Várakozik">Várakozik</option>
                    <option value="Folyamatban">Folyamatban</option>
                    <option value="Kész">Kész</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Munkaidő (óra)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Költség (Ft)</label>
                    <input
                      type="number"
                      min="0"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Munka leírása</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 h-20 focus:ring-2 focus:ring-black"
                    placeholder="Pl. Olajcsere, szűrőcsere"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Szerelői megjegyzés az ügyfél részére
                  </label>
                  <textarea
                    value={editNoteToClient}
                    onChange={(e) => setEditNoteToClient(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 h-16 focus:ring-2 focus:ring-black"
                    placeholder="Ez a megjegyzés megjelenik az ügyfél számára..."
                  />
                </div>

                {updateFeedback && <p className="text-center text-sm text-red-600">{updateFeedback}</p>}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <button
                  onClick={closeBookingModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Mégse
                </button>
                <button
                  onClick={saveBookingChanges}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                >
                  Mentés
                </button>
              </div>
            </div>
          </div>
        )}

        {carModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
              <h2 className="text-xl sm:text-2xl font-semibold mb-1">{carModal.license_plate} - Autó kezelése</h2>
              <p className="text-sm text-gray-500 mb-4">{carModal.type}</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveCarChanges();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block mb-1 text-gray-700">Státusz módosítása</label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    value={editCarStatus}
                    onChange={(e) => setEditCarStatus(e.target.value)}
                  >
                    <option value="Nincs státusz">Nincs státusz</option>
                    <option value="Várakozik">Várakozik</option>
                    <option value="Folyamatban">Folyamatban</option>
                    <option value="Kész">Kész</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block mb-1 text-gray-700">Rendszám</label>
                    <input
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                      value={editCarLicense}
                      onChange={(e) => setEditCarLicense(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-gray-700">Típus</label>
                    <input
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                      value={editCarType}
                      onChange={(e) => setEditCarType(e.target.value)}
                    />
                  </div>
                </div>

                {updateFeedback && <p className="text-center text-sm text-red-600">{updateFeedback}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeCarModal}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Mégse
                  </button>
                  <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900">
                    Mentés
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
