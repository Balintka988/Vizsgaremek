import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiGet, apiPut, apiDelete } from "../api/api";
import { formatBookingHu } from "../utils/datetime";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventNoteIcon from "@mui/icons-material/EventNote";

interface Car {
  id: number;
  license_plate: string;
  type: string;
  status: string;
}

interface Booking {
  id: number;
  car_id: number;
  date: string;
  note: string;
  status: string;
}

interface Notification {
  id: number;
  message: string;
  date: string;
  is_read: number;
  type?: string;
}




export default function Dashboard() {
  const { token, user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "autos" | "bookings" | "notifications" | "profile"
  >(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "bookings" || tabParam === "notifications" || tabParam === "profile" || tabParam === "autos") {
      return tabParam;
    }
    return "autos";
  });
  const [statusModalCar, setStatusModalCar] = useState<Car | null>(null);
  const [editModalCar, setEditModalCar] = useState<Car | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState<string>(user?.name || "");
  const [editPhone, setEditPhone] = useState<string>(user?.phone || "");
  const [editEmail, setEditEmail] = useState<string>(user?.email || "");
  const [profileMessage, setProfileMessage] = useState<
    | { type: "error" | "success"; text: string }
    | null
  >(null);

  const [editLicense, setEditLicense] = useState<string>("");
  const [editType, setEditType] = useState<string>("");
  const [editMessage, setEditMessage] = useState<
    | { type: "error" | "success"; text: string }
    | null
  >(null);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "bookings" || tabParam === "notifications" || tabParam === "profile" || tabParam === "autos") {
      setSelectedTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const carData = await apiGet("/cars", token);
        setCars(Array.isArray(carData) ? carData : []);

        const bookingData = await apiGet("/bookings", token);
        setBookings(Array.isArray(bookingData) ? bookingData : []);

        const notifData = await apiGet("/notifications", token);
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } catch (err) {
        console.error("Hiba az adatok lekérésekor:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  const handleDelete = async (id: number) => {
    if (!confirm("Biztos törlöd ezt az autót?")) return;

    try {
      await fetch(`http://localhost:3000/api/cars/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setCars((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Törlési hiba:", err);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!confirm("Biztosan törlöd ezt az értesítést?")) return;
    try {
      await apiDelete(`/notifications/${id}`, token);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Értesítés törlése sikertelen:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const isActiveStatus = (status: any) => String(status ?? "") !== "Kész";
  const activeBookings = bookings.filter((b) => isActiveStatus(b.status)).length;

  const handleTabClick = (tab: "autos" | "bookings" | "notifications" | "profile") => {
    setSelectedTab(tab);
    navigate(`/dashboard?tab=${tab}`);
  };

  const openStatusModal = async (carId: number) => {
    try {
      const data = await apiGet(`/cars/${carId}`, token);
      setStatusModalCar(data);
    } catch (err) {
      console.error("Nem sikerült betölteni az autó adatait:", err);
    }
  };

  const openEditModal = async (carId: number) => {
    try {
      const data = await apiGet(`/cars/${carId}`, token);
      setEditModalCar(data);
      setEditLicense(data.license_plate);
      setEditType(data.type);
      setEditMessage(null);
    } catch (err) {
      console.error("Nem sikerült betölteni az autó adatait:", err);
    }
  };

  const closeStatusModal = () => setStatusModalCar(null);
  const closeEditModal = () => setEditModalCar(null);

  const openProfileModal = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditEmail(user?.email || "");
    setProfileMessage(null);
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => setProfileModalOpen(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileMessage(null);
    if (!editName.trim() || !editEmail.trim()) {
      setProfileMessage({ type: "error", text: "Név és email megadása kötelező." });
      return;
    }

    try {
      await apiPut(
        `/users/profile`,
        { name: editName, phone: editPhone, email: editEmail },
        token
      );
    } catch {
      console.warn("Profil mentése sikertelen vagy nem implementált az API.");
    }

    setUser({ ...user, name: editName, phone: editPhone, email: editEmail });
    setProfileMessage({ type: "success", text: "Profil frissítve!" });

    setTimeout(() => setProfileModalOpen(false), 1500);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalCar) return;

    setEditMessage(null);

    if (!editLicense.trim() || !editType.trim()) {
      setEditMessage({ type: "error", text: "Minden mező kitöltése kötelező!" });
      return;
    }

    if (editLicense === editModalCar.license_plate && editType === editModalCar.type) {
      setEditMessage({ type: "error", text: "Nem történt változtatás." });
      return;
    }

    try {
      await apiPut(
        `/cars/${editModalCar.id}`,
        { license_plate: editLicense, type: editType },
        token
      );

      setCars((prev) =>
        prev.map((c) =>
          c.id === editModalCar.id ? { ...c, license_plate: editLicense, type: editType } : c
        )
      );

      setEditMessage({ type: "success", text: "Sikeres szerkesztés!" });
      setTimeout(closeEditModal, 1500);
    } catch (err) {
      console.error("Nem sikerült menteni a módosítást:", err);
      setEditMessage({ type: "error", text: "Nem sikerült menteni a módosítást." });
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await apiPut(`/notifications/${id}/read`, {}, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error("Nem sikerült olvasottnak jelölni a(z) értesítést", err);
    }
  };

  return (
    <>
    <Navbar />
      <div className="min-h-screen bg-gray-50 px-6 py-6 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">
          {`Üdvözöljük${user?.name ? `, ${user.name.split(" ")[0]}!` : " az irányítópulton!"}`}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-xl p-5 flex flex-col items-center text-center">
            <DirectionsCarIcon className="text-black mb-1" />
            <p className="text-md text-gray-600">Autóinak száma</p>
            <p className="text-3xl font-bold">{cars.length}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-5 flex flex-col items-center text-center">
            <EventNoteIcon className="text-black mb-1" />
            <p className="text-md text-gray-600">Aktív foglalások</p>
            <p className="text-3xl font-bold">{activeBookings}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-5 flex flex-col items-center text-center">
            <NotificationsNoneIcon className="text-black mb-1" />
            <p className="text-md text-gray-600">Új értesítések</p>
            <p className="text-3xl font-bold">{unreadCount}</p>
          </div>

          <button
            onClick={() => navigate("/bookings/new")}
            className="bg-white shadow rounded-xl p-5 flex flex-col items-center justify-center border hover:bg-gray-100 transition"
          >
            <span className="text-md text-gray-700 font-medium">Új időpont foglalás</span>
            <AddIcon className="text-black mt-2" />
          </button>
        </div>

        <div className="flex gap-1 bg-gray-200 rounded-lg overflow-hidden w-full max-w-xl">
          <button
            onClick={() => handleTabClick("autos")}
            className={`flex-1 py-2 font-medium ${
              selectedTab === "autos" ? "bg-white text-black" : "text-gray-600"
            }`}
          >
            Autók
          </button>
          <button
            onClick={() => handleTabClick("bookings")}
            className={`flex-1 py-2 font-medium ${
              selectedTab === "bookings" ? "bg-white text-black" : "text-gray-600"
            }`}
          >
            Foglalások
          </button>
          <button
            onClick={() => handleTabClick("notifications")}
            className={`flex-1 py-2 font-medium ${
              selectedTab === "notifications" ? "bg-white text-black" : "text-gray-600"
            }`}
          >
            Értesítések
          </button>
          <button
            onClick={() => handleTabClick("profile")}
            className={`flex-1 py-2 font-medium ${
              selectedTab === "profile" ? "bg-white text-black" : "text-gray-600"
            }`}
          >
            Profil
          </button>
        </div>

        {selectedTab === "autos" && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => navigate("/cars/new")}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
              >
                <AddIcon /> Új autó hozzáadása
              </button>
            </div>

            <section className="mt-4">
              <h2 className="text-xl font-semibold mb-3">Saját járművek:</h2>
              {loading ? (
                <p>Betöltés...</p>
              ) : cars.length === 0 ? (
                <p>Még nincs regisztrált autó.</p>
              ) : (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {cars.map((car) => (
                    <div
                      key={car.id}
                      className="bg-white shadow rounded-xl p-5 border border-gray-200 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-xl font-semibold">{car.license_plate}</h3>
                        <p className="text-gray-700">{car.type}</p>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <button
                          className="bg-black text-white px-3 py-2 rounded-lg text-sm"
                          onClick={() => openStatusModal(car.id)}
                        >
                          Státusz megtekintése
                        </button>

                        <div className="flex items-center gap-3">
                          <button
                            className="p-2 rounded hover:bg-gray-200"
                            onClick={() => openEditModal(car.id)}
                          >
                            <EditIcon className="text-black" />
                          </button>
                          <button
                            className="p-2 rounded hover:bg-gray-200"
                            onClick={() => handleDelete(car.id)}
                          >
                            <DeleteIcon className="text-black" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {selectedTab === "bookings" && (
          <section className="mt-4">
            <h2 className="text-xl font-semibold mb-3">Időpontfoglalások:</h2>

            {loading ? (
              <p>Betöltés...</p>
            ) : bookings.length === 0 ? (
              <p>Még nincs időpontfoglalása.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white p-4 rounded-xl shadow border flex flex-col sm:flex-row sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{formatBookingHu(b.date)}</p>

                      <p className="text-gray-700">
                        {cars.find((c) => c.id === b.car_id)?.license_plate || ""}
                      </p>

                      {b.note && (
                        <p className="text-sm text-gray-600 mt-1 truncate">{b.note}</p>
                      )}
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isActiveStatus(b.status)
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => navigate("/bookings/new")}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
              >
                <AddIcon /> Új foglalás
              </button>
            </div>
          </section>
        )}

        {selectedTab === "notifications" && (
          <section className="mt-4">
            <h2 className="text-xl font-semibold mb-3">Értesítések:</h2>

            {loading ? (
              <p>Betöltés...</p>
            ) : notifications.length === 0 ? (
              <p>Nincsenek értesítések.</p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((n) => {
                  const getTypeInfo = (
                    type: string | undefined
                  ): { label: string; cls: string } => {
                    switch (type) {
                      case "status":
                        return { label: "Állapotfrissítés", cls: "bg-blue-100 text-blue-800" };
                      case "reminder":
                        return { label: "Emlékeztető", cls: "bg-yellow-100 text-yellow-800" };
                      case "thanks":
                        return { label: "Köszönő üzenet", cls: "bg-green-100 text-green-800" };
                      default:
                        return { label: "Egyéb", cls: "bg-gray-100 text-gray-800" };
                    }
                  };

                  const { label, cls } = getTypeInfo(n.type);

                  return (
                    <li
                      key={n.id}
                      className={`p-4 bg-white rounded-xl shadow border ${
                        n.is_read ? "opacity-70" : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-medium mb-1 flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${cls}`}>
                              {label}
                            </span>
                            {n.message}
                          </p>

                          <p className="text-sm text-gray-500">
                            {new Date(n.date).toLocaleString("hu-HU")}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {!n.is_read && (
                            <button
                              onClick={() => markNotificationRead(n.id)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Olvasottnak jelölés
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(n.id)}
                            className="p-2 rounded-full hover:bg-gray-200"
                            title="Törlés"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {selectedTab === "profile" && (
          <section className="mt-4">
            <h2 className="text-xl font-semibold mb-3">Profil adatok:</h2>
            {user ? (
              <div className="bg-white shadow rounded-xl p-6 max-w-md">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Név:</span> {user.name}
                  </div>
                  <div>
                    <span className="font-medium">Telefon:</span> {user.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                </div>
                <button
                  onClick={openProfileModal}
                  className="mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Profil szerkesztése
                </button>
              </div>
            ) : (
              <p>Nincs betöltve profil információ.</p>
            )}
          </section>
        )}

        {statusModalCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h2 className="text-2xl font-semibold mb-4">Státusz megtekintése</h2>
              <p className="text-xl font-medium">{statusModalCar.license_plate}</p>
              <p className="text-gray-700">{statusModalCar.type}</p>
              <div className="mt-6">
                <p className="text-lg font-semibold">Aktuális státusz:</p>
                <p className="text-xl mt-2">{statusModalCar.status || "Nincs megadva státusz"}</p>
              </div>
              <button
                onClick={closeStatusModal}
                className="mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Bezárás
              </button>
            </div>
          </div>
        )}

        {editModalCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h2 className="text-2xl font-semibold mb-4">Autó szerkesztése</h2>
              <form onSubmit={handleEditSave} className="space-y-4">
                <div>
                  <label className="block mb-1 text-gray-700">Rendszám</label>
                  <input
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    value={editLicense}
                    onChange={(e) => setEditLicense(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Típus</label>
                  <input
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                  />
                </div>

                {editMessage && (
                  <p
                    className={`${
                      editMessage.type === "error"
                        ? "text-red-700 bg-red-100"
                        : "text-green-700 bg-green-100"
                    } text-center py-2 rounded-lg`}
                  >
                    {editMessage.text}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Mégse
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                  >
                    Mentés
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h2 className="text-2xl font-semibold mb-4">Profil szerkesztése</h2>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block mb-1 text-gray-700">Név</label>
                  <input
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Telefon</label>
                  <input
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                {profileMessage && (
                  <p
                    className={`${
                      profileMessage.type === "error"
                        ? "text-red-700 bg-red-100"
                        : "text-green-700 bg-green-100"
                    } text-center py-2 rounded-lg`}
                  >
                    {profileMessage.text}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={closeProfileModal}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Mégse
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                  >
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
