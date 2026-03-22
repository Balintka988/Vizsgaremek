import { useState, useEffect, useContext, useMemo } from "react";
import type { FormEvent } from "react";
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
  note_to_client?: string;
  service_names?: string;
  service_description?: string;
  service_total_hours?: number;
  service_total_price?: number;
}

interface CarWithOwner {
  id: number;
  owner_id: number;
  license_plate: string;
  type: string;
  brand_group?: string;
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

type SortDir = "asc" | "desc";
type BookingSortKey = "user" | "plate" | "type" | "date" | "status" | "work";
type CarSortKey = "user" | "plate" | "type" | "group" | "status";
type ServiceSortKey = "name" | "price" | "work_hours";

export default function AdminDashboard() {
  const { token, user, ready } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState<"bookings" | "cars" | "services" | "notifications">(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "cars" || tab === "services" || tab === "notifications" || tab === "bookings") return tab;
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
  const [editCarBrandGroup, setEditCarBrandGroup] = useState<string>("atlagos");

  const [notificationUsers, setNotificationUsers] = useState<number[]>([]);
  const [notificationCarId, setNotificationCarId] = useState<number | "">("");
  const [notificationType, setNotificationType] = useState<string>("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const [serviceSearch, setServiceSearch] = useState<string>("");
  const [serviceModal, setServiceModal] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState<string>("");
  const [servicePrice, setServicePrice] = useState<string>("");
  const [serviceWorkHours, setServiceWorkHours] = useState<string>("");

  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceSuccess, setServiceSuccess] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [bookingSearch, setBookingSearch] = useState<string>("");
  const [bookingSearchField, setBookingSearchField] = useState<
    "all" | "user" | "plate" | "type" | "date" | "status" | "work"
  >("all");

  const [carSearch, setCarSearch] = useState<string>("");
  const [carSearchField, setCarSearchField] = useState<
    "all" | "user" | "plate" | "type" | "group" | "status"
  >("all");
  const [showCompletedBookings, setShowCompletedBookings] = useState<boolean>(false);

  const [serviceSearchField, setServiceSearchField] = useState<
    "all" | "name" | "price" | "work_hours"
  >("all");

  const [bookingSort, setBookingSort] = useState<{ key: BookingSortKey | null; dir: SortDir }>({
    key: null,
    dir: "asc",
  });

  const [carSort, setCarSort] = useState<{ key: CarSortKey | null; dir: SortDir }>({
    key: null,
    dir: "asc",
  });

  const [serviceSort, setServiceSort] = useState<{ key: ServiceSortKey | null; dir: SortDir }>({
    key: null,
    dir: "asc",
  });

  const sortArrow = (active: boolean, dir: SortDir) => (active ? (dir === "asc" ? " ▲" : " ▼") : "");

  const isCompletedStatus = (statusRaw: string) => {
    const s = String(statusRaw ?? "").trim().toLowerCase();
    return s === "kész" || s === "kesz" || s.includes("kész") || s.includes("kesz");
  };

  const isInProgressStatus = (statusRaw: string) => {
    const s = String(statusRaw ?? "").trim().toLowerCase();
    return s === "folyamatban";
  };

  const statusBadgeClasses = (statusRaw: string) => {
    const status = String(statusRaw || "").trim();
    if (!status || status === "Nincs státusz") return "bg-gray-100 text-gray-700";
    if (isCompletedStatus(status)) return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  const brandGroupLabel = (raw: unknown) => {
    const v = String(raw ?? "atlagos").trim().toLowerCase();
    if (v === "atlagos") return "Átlagos";
    if (v === "nemet") return "Német";
    if (v === "olcso") return "Olcsó";
    return v;
  };

const toggleSort = <K extends string>(
  prev: { key: K | null; dir: SortDir },
  key: K
): { key: K; dir: SortDir } => {
  if (prev.key === key) {
    return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
  }
  return { key, dir: "asc" };
};

  const toggleBookingSort = (key: BookingSortKey) => setBookingSort((prev) => toggleSort(prev, key));
  const toggleCarSort = (key: CarSortKey) => setCarSort((prev) => toggleSort(prev, key));
  const toggleServiceSort = (key: ServiceSortKey) => setServiceSort((prev) => toggleSort(prev, key));

  const normalizeNumOrNull = (v: unknown) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number(s.replace(",", "."));
    return isNaN(n) ? null : n;
  };

  const normalizePositiveNumOrThrow = (raw: string, label: string) => {
    const n = Number(String(raw ?? "").trim().replace(",", "."));
    if (!Number.isFinite(n) || n < 0) throw new Error(`Hibás ${label}`);
    return n;
  };

  const isSameDay = (dateStr: string, compareDate: Date) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;

    return (
      d.getFullYear() === compareDate.getFullYear() &&
      d.getMonth() === compareDate.getMonth() &&
      d.getDate() === compareDate.getDate()
    );
  };

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;

    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - diffToMonday);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return d >= start && d < end;
  };

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
    if (!token) return;
    loadData();

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
        console.error("Nem sikerült lekérni a szolgáltatásokat:", err);
      }
    };
    loadServices();
  }, [token]);

  const reloadServices = async () => {
    if (!token) return;
    try {
      const data = await apiGet("/services", token);
      if (Array.isArray(data)) setServices(data as Service[]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!ready) return;
    if (!token || !user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [token, user, ready, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "cars" || tab === "services" || tab === "notifications" || tab === "bookings") {
      setSelectedTab(tab);
    }
  }, [location.search]);

  const filteredServices = useMemo(() => {
    const term = serviceSearch.trim().toLowerCase();
    const list = Array.isArray(services) ? services : [];

    const filtered = !term
      ? list.slice()
      : list.filter((s) => {
          const name = String(s.name ?? "").toLowerCase();
          const price = String(s.price ?? "").toLowerCase();
          const wh = String(s.work_hours ?? "").toLowerCase();

          if (serviceSearchField === "name") return name.includes(term);
          if (serviceSearchField === "price") return price.includes(term);
          if (serviceSearchField === "work_hours") return wh.includes(term);
          return name.includes(term) || price.includes(term) || wh.includes(term);
        });

    const dirMul = serviceSort.dir === "asc" ? 1 : -1;

    if (!serviceSort.key) {
      return filtered.sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? ""), "hu", { sensitivity: "base" })
      );
    }

    return filtered.sort((a, b) => {
      let c = 0;

      if (serviceSort.key === "name") {
        c = String(a.name ?? "").localeCompare(String(b.name ?? ""), "hu", { sensitivity: "base" });
      } else if (serviceSort.key === "price") {
        c = Number(a.price ?? 0) - Number(b.price ?? 0);
      } else if (serviceSort.key === "work_hours") {
        c = Number(a.work_hours ?? 0) - Number(b.work_hours ?? 0);
      }

      if (c !== 0) return c * dirMul;
      return String(a.name ?? "").localeCompare(String(b.name ?? ""), "hu", { sensitivity: "base" });
    });
  }, [services, serviceSearch, serviceSearchField, serviceSort.key, serviceSort.dir]);

  const openServiceModal = (service?: Service) => {
    if (service) {
      setServiceModal(service);
      setServiceName(service.name ?? "");
      setServicePrice(service.price != null ? String(service.price) : "");
      setServiceWorkHours(service.work_hours != null ? String(service.work_hours) : "");
    } else {
      setServiceModal({ id: 0, name: "", price: 0, work_hours: 0 });
      setServiceName("");
      setServicePrice("");
      setServiceWorkHours("");
    }

    setServiceError(null);
    setServiceSuccess(null);
  };

  const closeServiceModal = () => {
    setServiceModal(null);
    setServiceError(null);
    setServiceSuccess(null);
  };

  const saveService = async () => {
    if (!token || !serviceModal) return;

    try {
      setServiceError(null);
      setServiceSuccess(null);

      const nm = serviceName.trim();
      if (!nm) throw new Error("A név kötelező");

      const p = normalizePositiveNumOrThrow(servicePrice, "ár");
      const wh = normalizePositiveNumOrThrow(serviceWorkHours, "munkaóra");

      if (serviceModal.id && serviceModal.id !== 0) {
        await apiPut(`/services/${serviceModal.id}`, { name: nm, price: p, work_hours: wh }, token);
        setServiceSuccess("Szolgáltatás frissítve");
      } else {
        await apiPost("/services", { name: nm, price: p, work_hours: wh }, token);
        setServiceSuccess("Szolgáltatás hozzáadva");
      }

      await reloadServices();
      setTimeout(() => closeServiceModal(), 900);
    } catch (err) {
      console.error(err);
      setServiceError(err instanceof Error ? err.message : "Hiba a mentés során");
    }
  };

  const deleteService = async (service: Service) => {
    if (!token) return;

    const ok = window.confirm(`Biztosan törlöd ezt a szolgáltatást? (${service.name})`);
    if (!ok) return;

    try {
      setServiceError(null);
      setServiceSuccess(null);

      await apiDelete(`/services/${service.id}`, token);
      await reloadServices();
      setServiceSuccess("Szolgáltatás törölve");
      setTimeout(() => setServiceSuccess(null), 2000);
    } catch (err) {
      console.error(err);
      setServiceError("Nem sikerült törölni a szolgáltatást.");
      setTimeout(() => setServiceError(null), 2000);
    }
  };

  const todayCount = useMemo(() => {
    const today = new Date();
    return bookings.filter((b) => isSameDay(b.date, today)).length;
  }, [bookings]);

  const inProgressCount = useMemo(() => {
    return bookings.filter((b) => isInProgressStatus(b.status)).length;
  }, [bookings]);

  const weeklyRevenue = useMemo(() => {
    let sum = 0;
    bookings.forEach((b) => {
      if (!isCompletedStatus(b.status)) return;
      if (!isThisWeek(b.date)) return;

      const rawCost =
        b.cost !== undefined && b.cost !== null && String(b.cost).trim() !== ""
          ? b.cost
          : b.service_total_price ?? null;

      if (rawCost !== null && rawCost !== undefined && String(rawCost).trim() !== "") {
        const val = Number(String(rawCost).replace(",", "."));
        if (!isNaN(val)) sum += val;
      }
    });
    return sum;
  }, [bookings]);

  const getWorkCount = (b: BookingWithDetails) => {
    if (b.hours !== undefined && b.hours !== null) {
      const hrs = Number(b.hours);
      if (!isNaN(hrs)) return Math.round(hrs);
    }

    if ((b.hours === undefined || b.hours === null) && b.service_total_hours !== undefined && b.service_total_hours !== null) {
      const sh = Number(b.service_total_hours);
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

  const handleTabClick = (tab: "bookings" | "cars" | "services" | "notifications") => {
    setSelectedTab(tab);
    navigate(`/admin?tab=${tab}`);
  };

  const bookingFieldLabel = (f: typeof bookingSearchField) => {
    switch (f) {
      case "user":
        return "Ügyfél";
      case "plate":
        return "Rendszám";
      case "type":
        return "Típus";
      case "date":
        return "Dátum";
      case "status":
        return "Státusz";
      case "work":
        return "Munka";
      default:
        return "Bármi";
    }
  };

  const carFieldLabel = (f: typeof carSearchField) => {
    switch (f) {
      case "user":
        return "Ügyfél";
      case "plate":
        return "Rendszám";
      case "type":
        return "Típus";
      case "group":
        return "Csoport";
      case "status":
        return "Státusz";
      default:
        return "Bármi";
    }
  };

  const serviceFieldLabel = (f: typeof serviceSearchField) => {
    switch (f) {
      case "name":
        return "Név";
      case "price":
        return "Ár";
      case "work_hours":
        return "Munkaóra";
      default:
        return "Bármi";
    }
  };

  const quickFilterBooking = (field: typeof bookingSearchField, value: string) => {
    setBookingSearchField(field);
    setBookingSearch(value);
  };

  const quickFilterCar = (field: typeof carSearchField, value: string) => {
    setCarSearchField(field);
    setCarSearch(value);
  };

  const quickFilterService = (field: typeof serviceSearchField, value: string) => {
    setServiceSearchField(field);
    setServiceSearch(value);
  };

  const filteredBookings = useMemo(() => {
    const list = bookings.filter((b) => {
      if (!showCompletedBookings && isCompletedStatus(b.status)) return false;

      const raw = bookingSearch.trim();
      if (!raw) return true;
      const term = raw.toLowerCase();

      const userName = String(b.user_name ?? "").toLowerCase();
      const plate = String(b.license_plate ?? "").toLowerCase();
      const type = String(b.car_type ?? "").toLowerCase();
      const status = String(b.status ?? "").toLowerCase();
      const date = String(formatBookingHu(b.date) ?? "").toLowerCase();
      const work = String(getWorkCount(b) ?? "").toLowerCase();

      if (bookingSearchField === "user") return userName.includes(term);
      if (bookingSearchField === "plate") return plate.includes(term);
      if (bookingSearchField === "type") return type.includes(term);
      if (bookingSearchField === "date") return date.includes(term);
      if (bookingSearchField === "status") return status.includes(term);
      if (bookingSearchField === "work") return work.includes(term);

      return (
        userName.includes(term) ||
        plate.includes(term) ||
        type.includes(term) ||
        date.includes(term) ||
        status.includes(term) ||
        work.includes(term)
      );
    });

    const dirMul = bookingSort.dir === "asc" ? 1 : -1;
    const getStr = (v: unknown) => String(v ?? "");
    const cmpStr = (a: string, b: string) => a.localeCompare(b, "hu", { sensitivity: "base" });

    if (!bookingSort.key) {
      return list.sort((a, b) => {
        const aDone = isCompletedStatus(a.status);
        const bDone = isCompletedStatus(b.status);
        if (aDone !== bDone) return aDone ? 1 : -1;
        return String(a.date ?? "").localeCompare(String(b.date ?? ""));
      });
    }

    return list.sort((a, b) => {
      let c = 0;

      if (bookingSort.key === "user") c = cmpStr(getStr(a.user_name), getStr(b.user_name));
      else if (bookingSort.key === "plate") c = cmpStr(getStr(a.license_plate), getStr(b.license_plate));
      else if (bookingSort.key === "type") c = cmpStr(getStr(a.car_type), getStr(b.car_type));
      else if (bookingSort.key === "status") c = cmpStr(getStr(a.status), getStr(b.status));
      else if (bookingSort.key === "date") c = String(a.date ?? "").localeCompare(String(b.date ?? ""));
      else if (bookingSort.key === "work") c = getWorkCount(a) - getWorkCount(b);

      if (c !== 0) return c * dirMul;
      return String(a.date ?? "").localeCompare(String(b.date ?? ""));
    });
  }, [bookings, bookingSearch, bookingSearchField, bookingSort.key, bookingSort.dir, showCompletedBookings]);

  const openBookingModal = (booking: BookingWithDetails) => {
    setBookingModal(booking);
    setStatusUpdate(booking.status);
    setEditHours(booking.hours != null ? String(booking.hours) : "");
    setEditCost(booking.cost != null ? String(booking.cost) : "");
    setEditDescription(booking.description || "");
    setEditNoteToClient(String(booking.noteToClient ?? booking.note_to_client ?? ""));
    setUpdateError(null);
    setUpdateSuccess(null);

    if (
      booking.hours == null &&
      booking.cost == null &&
      !String(booking.description ?? "").trim()
    ) {
      if (booking.service_total_price !== undefined && booking.service_total_price !== null) {
        setEditCost(String(booking.service_total_price));
      }
      if (booking.service_total_hours !== undefined && booking.service_total_hours !== null) {
        setEditHours(String(booking.service_total_hours));
      }
      if (booking.service_description) {
        setEditDescription(String(booking.service_description));
      } else if (booking.service_names) {
        setEditDescription(String(booking.service_names).split(", ").join("\n"));
      }
    }
  };

  const filteredCars = useMemo(() => {
    const list = cars.filter((c) => {
      const raw = carSearch.trim();
      if (!raw) return true;
      const term = raw.toLowerCase();

      const userName = String(c.user_name ?? "").toLowerCase();
      const plate = String(c.license_plate ?? "").toLowerCase();
      const type = String(c.type ?? "").toLowerCase();
      const groupRaw = String(c.brand_group ?? "atlagos").toLowerCase();
      const groupLabel = brandGroupLabel(c.brand_group).toLowerCase();
      const status = String(c.status ?? "").toLowerCase();

      if (carSearchField === "user") return userName.includes(term);
      if (carSearchField === "plate") return plate.includes(term);
      if (carSearchField === "type") return type.includes(term);
      if (carSearchField === "group") return groupRaw.includes(term) || groupLabel.includes(term);
      if (carSearchField === "status") return status.includes(term);

      return (
        userName.includes(term) ||
        plate.includes(term) ||
        type.includes(term) ||
        groupRaw.includes(term) ||
        groupLabel.includes(term) ||
        status.includes(term)
      );
    });

    const dirMul = carSort.dir === "asc" ? 1 : -1;
    const cmpStr = (a: string, b: string) => a.localeCompare(b, "hu", { sensitivity: "base" });

    if (!carSort.key) {
      return list.sort((a, b) => cmpStr(String(a.license_plate ?? ""), String(b.license_plate ?? "")));
    }

    return list.sort((a, b) => {
      let c = 0;
      if (carSort.key === "user") c = cmpStr(String(a.user_name ?? ""), String(b.user_name ?? ""));
      else if (carSort.key === "plate") c = cmpStr(String(a.license_plate ?? ""), String(b.license_plate ?? ""));
      else if (carSort.key === "type") c = cmpStr(String(a.type ?? ""), String(b.type ?? ""));
      else if (carSort.key === "group") c = cmpStr(brandGroupLabel(a.brand_group), brandGroupLabel(b.brand_group));
      else if (carSort.key === "status") c = cmpStr(String(a.status ?? ""), String(b.status ?? ""));

      if (c !== 0) return c * dirMul;
      return cmpStr(String(a.license_plate ?? ""), String(b.license_plate ?? ""));
    });
  }, [cars, carSearch, carSearchField, carSort.key, carSort.dir]);

  const closeBookingModal = () => {
    setBookingModal(null);
    setStatusUpdate("");
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const saveBookingChanges = async () => {
    if (!bookingModal || !token) return;

    try {
      setUpdateError(null);
      setUpdateSuccess(null);

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

      setUpdateSuccess("Sikeresen frissítve");
      setTimeout(() => closeBookingModal(), 1200);
    } catch (err) {
      console.error(err);
      setUpdateError(err instanceof Error ? err.message : "Hiba a frissítés során");
    }
  };

  const deleteCompletedBooking = async (booking: BookingWithDetails) => {
    if (!token) return;

    if (!isCompletedStatus(booking.status)) {
      setUpdateError("Csak a kész foglalások törölhetők.");
      setTimeout(() => setUpdateError(null), 2000);
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
      setUpdateError("Nem sikerült törölni a foglalást.");
      setTimeout(() => setUpdateError(null), 2000);
    }
  };

  const openCarModal = (car: CarWithOwner) => {
    setCarModal(car);
    setEditCarLicense(car.license_plate);
    setEditCarType(car.type);
    setEditCarBrandGroup(String(car.brand_group ?? "atlagos"));
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const closeCarModal = () => {
    setCarModal(null);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const saveCarChanges = async () => {
    if (!carModal || !token) return;

    try {
      setUpdateError(null);
      setUpdateSuccess(null);

      await apiPut(
        `/cars/${carModal.id}`,
        { license_plate: editCarLicense, type: editCarType, brand_group: editCarBrandGroup },
        token
      );

      setCars((prev) =>
        prev.map((c) =>
          c.id === carModal.id
            ? { ...c, license_plate: editCarLicense, type: editCarType, brand_group: editCarBrandGroup }
            : c
        )
      );

      setUpdateSuccess("Sikeresen frissítve");
      setTimeout(() => closeCarModal(), 1200);
    } catch (err) {
      console.error(err);
      setUpdateError(err instanceof Error ? err.message : "Hiba a frissítés során");
    }
  };

  const sendNotifications = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) return;

    setNotifError(null);
    setNotifSuccess(null);

    if (notificationUsers.length === 0 || !notificationType.trim() || !notificationMessage.trim()) {
      setNotifError("Válassza ki a címzetteket, adjon meg típust és üzenetet");
      return;
    }

    const plateForMsg =
      notificationCarId !== ""
        ? String(cars.find((c) => c.id === Number(notificationCarId))?.license_plate ?? "").trim()
        : "";

    const finalMessage = plateForMsg ? `[${plateForMsg}] ${notificationMessage}` : notificationMessage;

    try {
      await apiPost(
        "/notifications",
        { userIds: notificationUsers, type: notificationType, message: finalMessage },
        token
      );

      setNotifSuccess("Értesítés elküldve");
      setNotificationUsers([]);
      setNotificationCarId("");
      setNotificationType("");
      setNotificationMessage("");
      setTimeout(() => setNotifSuccess(null), 2000);
    } catch (err) {
      console.error(err);
      setNotifError("Hiba történt az értesítés küldésekor");
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
            onClick={() => handleTabClick("services")}
            className={`flex-1 py-2 text-sm sm:text-base font-medium transition-colors ${
              selectedTab === "services" ? "bg-white text-black" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Szolgáltatások
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={showCompletedBookings}
                      onChange={(e) => setShowCompletedBookings(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Kész státuszú foglalásokat is mutassa
                  </label>
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder={`Keresés (${bookingFieldLabel(bookingSearchField)})...`}
                    className="border border-gray-300 rounded-lg px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th
                          onClick={() => toggleBookingSort("user")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            bookingSearchField === "user" ? "underline" : ""
                          }`}
                          title="Rendezés: Ügyfél"
                        >
                          Ügyfél{sortArrow(bookingSort.key === "user", bookingSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleBookingSort("plate")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            bookingSearchField === "plate" ? "underline" : ""
                          }`}
                          title="Rendezés: Rendszám"
                        >
                          Rendszám{sortArrow(bookingSort.key === "plate", bookingSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleBookingSort("type")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            bookingSearchField === "type" ? "underline" : ""
                          }`}
                          title="Rendezés: Típus"
                        >
                          Típus{sortArrow(bookingSort.key === "type", bookingSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleBookingSort("date")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            bookingSearchField === "date" ? "underline" : ""
                          }`}
                          title="Rendezés: Dátum"
                        >
                          Dátum{sortArrow(bookingSort.key === "date", bookingSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleBookingSort("status")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            bookingSearchField === "status" ? "underline" : ""
                          }`}
                          title="Rendezés: Státusz"
                        >
                          Státusz{sortArrow(bookingSort.key === "status", bookingSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleBookingSort("work")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            bookingSearchField === "work" ? "underline" : ""
                          }`}
                          title="Rendezés: Munka"
                        >
                          Munka{sortArrow(bookingSort.key === "work", bookingSort.dir)}
                        </th>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-700">Művelet</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="text-left hover:underline"
                              onClick={() => quickFilterBooking("user", String(b.user_name ?? ""))}
                              title="Szűrés erre az ügyfélre"
                            >
                              {b.user_name}
                            </button>
                            <div className="text-xs text-gray-500">{b.user_phone}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => quickFilterBooking("plate", String(b.license_plate ?? ""))}
                              title="Szűrés erre a rendszámra"
                            >
                              {b.license_plate}
                            </button>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => quickFilterBooking("type", String(b.car_type ?? ""))}
                              title="Szűrés erre a típusra"
                            >
                              {b.car_type}
                            </button>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => quickFilterBooking("date", String(formatBookingHu(b.date) ?? ""))}
                              title="Szűrés erre a dátumra"
                            >
                              {formatBookingHu(b.date)}
                            </button>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClasses(
                                String(b.status ?? "")
                              )}`}
                            >
                              <button
                                type="button"
                                className="hover:underline"
                                onClick={() => quickFilterBooking("status", String(b.status ?? ""))}
                                title="Szűrés erre a státuszra"
                              >
                                {b.status}
                              </button>
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => quickFilterBooking("work", String(getWorkCount(b) ?? ""))}
                              title="Szűrés erre a munkaszámra"
                            >
                              {getWorkCount(b)}
                            </button>
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
                                    setNotificationCarId(b.car_id);
                                    setSelectedTab("notifications");
                                    navigate("/admin?tab=notifications");
                                    setOpenMenuId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Értesítés küldése
                                </button>
                                {isCompletedStatus(b.status) && (
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
              <>
                <div className="flex justify-end mb-2">
                  <input
                    type="text"
                    value={carSearch}
                    onChange={(e) => setCarSearch(e.target.value)}
                    placeholder={`Keresés (${carFieldLabel(carSearchField)})...`}
                    className="border border-gray-300 rounded-lg px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th
                          onClick={() => toggleCarSort("user")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            carSearchField === "user" ? "underline" : ""
                          }`}
                          title="Rendezés: Ügyfél"
                        >
                          Ügyfél{sortArrow(carSort.key === "user", carSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleCarSort("plate")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            carSearchField === "plate" ? "underline" : ""
                          }`}
                          title="Rendezés: Rendszám"
                        >
                          Rendszám{sortArrow(carSort.key === "plate", carSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleCarSort("type")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            carSearchField === "type" ? "underline" : ""
                          }`}
                          title="Rendezés: Típus"
                        >
                          Típus{sortArrow(carSort.key === "type", carSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleCarSort("group")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            carSearchField === "group" ? "underline" : ""
                          }`}
                          title="Rendezés: Csoport"
                        >
                          Csoport{sortArrow(carSort.key === "group", carSort.dir)}
                        </th>
                        <th
                          onClick={() => toggleCarSort("status")}
                          className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                            carSearchField === "status" ? "underline" : ""
                          }`}
                          title="Rendezés: Státusz"
                        >
                          Státusz{sortArrow(carSort.key === "status", carSort.dir)}
                        </th>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-700">Művelet</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCars.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="text-left hover:underline"
                              onClick={() => quickFilterCar("user", String(c.user_name ?? ""))}
                              title="Szűrés erre az ügyfélre"
                            >
                              {c.user_name}
                            </button>
                            <div className="text-xs text-gray-500">{c.user_phone}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => quickFilterCar("plate", String(c.license_plate ?? ""))}
                              title="Szűrés erre a rendszámra"
                            >
                              {c.license_plate}
                            </button>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => quickFilterCar("type", String(c.type ?? ""))}
                              title="Szűrés erre a típusra"
                            >
                              {c.type}
                            </button>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => quickFilterCar("group", String(brandGroupLabel(c.brand_group) ?? ""))}
                              title="Szűrés erre a csoportra"
                            >
                              {brandGroupLabel(c.brand_group)}
                            </button>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClasses(
                                String(c.status || "Nincs státusz")
                              )}`}
                            >
                              <button
                                type="button"
                                className="hover:underline"
                                onClick={() => quickFilterCar("status", String(c.status || "Nincs státusz"))}
                                title="Szűrés erre a státuszra"
                              >
                                {c.status || "Nincs státusz"}
                              </button>
                            </span>
                          </td>
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
              </>
            )}

            {selectedTab === "notifications" && (
              <div className="bg-white p-6 rounded-xl shadow w-full max-w-none">
                <h2 className="text-xl font-semibold mb-4">Értesítés küldése</h2>
                <form onSubmit={sendNotifications} className="grid grid-cols-1 gap-4">
                  <div>
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
                                if (notificationUsers.includes(u.id)) {
                                  setNotificationUsers([]);
                                  setNotificationCarId("");
                                } else {
                                  setNotificationUsers([u.id]);
                                  const firstCar = cars.find((c) => c.owner_id === u.id);
                                  setNotificationCarId(firstCar ? firstCar.id : "");
                                }
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Melyik autó miatt?</label>
                    <select
                      value={notificationCarId}
                      onChange={(e) => setNotificationCarId(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={notificationUsers.length === 0}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black disabled:bg-gray-100"
                    >
                      <option value="">(Nincs megadva)</option>
                      {notificationUsers.length > 0 &&
                        cars
                          .filter((c) => c.owner_id === notificationUsers[0])
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.license_plate} — {c.type}
                            </option>
                          ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Ha választ autót, a rendszám automatikusan bekerül az üzenet elejére.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Értesítés típusa</label>
                    <select
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    >
                      <option value="">Válasszon típust...</option>
                      <option value="status">Állapotváltozás</option>
                      <option value="reminder">Emlékeztető</option>
                      <option value="thanks">Köszönő üzenet</option>
                      <option value="other">Egyéb</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Üzenet</label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black h-40 resize-y"
                      placeholder="Írja be az üzenetet az ügyfél számára..."
                    />
                  </div>

                  {notifError && <p className="text-sm text-center text-red-600">{notifError}</p>}
                  {notifSuccess && <p className="text-sm text-center text-green-600">{notifSuccess}</p>}

                  <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800">
                    Küldés
                  </button>
                </form>
              </div>
            )}

            {selectedTab === "services" && (
              <div className="bg-white p-6 rounded-xl shadow w-full max-w-none">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-semibold">Szolgáltatások</h2>
                  <button
                    type="button"
                    onClick={() => openServiceModal()}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    + Új
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 mb-3">
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder={`Keresés (${serviceFieldLabel(serviceSearchField)})...`}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {serviceError && <p className="text-sm text-center text-red-600 mb-3">{serviceError}</p>}
                {serviceSuccess && <p className="text-sm text-center text-green-600 mb-3">{serviceSuccess}</p>}

                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[520px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th
                            onClick={() => toggleServiceSort("name")}
                            className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                              serviceSearchField === "name" ? "underline" : ""
                            }`}
                            title="Rendezés: Név"
                          >
                            Név{sortArrow(serviceSort.key === "name", serviceSort.dir)}
                          </th>
                          <th
                            onClick={() => toggleServiceSort("price")}
                            className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                              serviceSearchField === "price" ? "underline" : ""
                            }`}
                            title="Rendezés: Ár"
                          >
                            Ár{sortArrow(serviceSort.key === "price", serviceSort.dir)}
                          </th>
                          <th
                            onClick={() => toggleServiceSort("work_hours")}
                            className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none ${
                              serviceSearchField === "work_hours" ? "underline" : ""
                            }`}
                            title="Rendezés: Munkaóra"
                          >
                            Munkaóra{sortArrow(serviceSort.key === "work_hours", serviceSort.dir)}
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Művelet</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredServices.length === 0 ? (
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-600" colSpan={4}>
                              Nincs találat.
                            </td>
                          </tr>
                        ) : (
                          filteredServices.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                <button
                                  type="button"
                                  className="text-left hover:underline"
                                  onClick={() => quickFilterService("name", String(s.name ?? ""))}
                                  title="Szűrés erre a névre"
                                >
                                  {s.name}
                                </button>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                <button
                                  type="button"
                                  className="hover:underline"
                                  onClick={() => quickFilterService("price", String(s.price ?? ""))}
                                  title="Szűrés erre az árra"
                                >
                                  {Number(s.price).toLocaleString("hu-HU")} Ft
                                </button>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                <button
                                  type="button"
                                  className="hover:underline"
                                  onClick={() => quickFilterService("work_hours", String(s.work_hours ?? ""))}
                                  title="Szűrés erre a munkaórára"
                                >
                                  {Number(s.work_hours ?? 0).toLocaleString("hu-HU")}
                                </button>
                              </td>
                              <td className="px-4 py-2 text-sm text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => openServiceModal(s)}
                                  className="px-3 py-1 rounded-md border mr-2 hover:bg-gray-50"
                                >
                                  Szerkesztés
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteService(s)}
                                  className="px-3 py-1 rounded-md border text-red-600 hover:bg-red-50"
                                >
                                  Törlés
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
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

                {updateError && <p className="text-center text-sm text-red-600">{updateError}</p>}
                {updateSuccess && <p className="text-center text-sm text-green-600">{updateSuccess}</p>}
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

        {serviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <h2 className="text-2xl font-semibold mb-2">
                {serviceModal.id && serviceModal.id !== 0 ? "Szolgáltatás szerkesztése" : "Új szolgáltatás"}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {serviceModal.id && serviceModal.id !== 0 ? `#${serviceModal.id}` : ""}
              </p>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Név</label>
                  <input
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    placeholder="Pl. Olajcsere"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ár (Ft)</label>
                    <input
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                      placeholder="12000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Munkaóra</label>
                    <input
                      value={serviceWorkHours}
                      onChange={(e) => setServiceWorkHours(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                      placeholder="1.0"
                    />
                  </div>
                </div>

                {serviceError && <p className="text-center text-sm text-red-600">{serviceError}</p>}
                {serviceSuccess && <p className="text-center text-sm text-green-600">{serviceSuccess}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveService}
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                >
                  Mentés
                </button>
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
                >
                  Mégse
                </button>
              </div>

              <button
                onClick={closeServiceModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
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
                  <label className="block mb-1 text-gray-700">Státusz</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClasses(
                        String(carModal.status || "Nincs státusz")
                      )}`}
                    >
                      {carModal.status || "Nincs státusz"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    A kocsi státusza automatikusan a hozzá tartozó foglalás státuszát követi.
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">Márka csoport</label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
                    value={editCarBrandGroup}
                    onChange={(e) => setEditCarBrandGroup(e.target.value)}
                  >
                    <option value="atlagos">Átlagos (alapár)</option>
                    <option value="nemet">Német csoport (drágább)</option>
                    <option value="olcso">Dacia / Suzuki (olcsóbb)</option>
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

                {updateError && <p className="text-center text-sm text-red-600">{updateError}</p>}
                {updateSuccess && <p className="text-center text-sm text-green-600">{updateSuccess}</p>}

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
