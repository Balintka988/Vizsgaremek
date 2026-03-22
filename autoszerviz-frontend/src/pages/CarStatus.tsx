import { useParams, useNavigate } from "react-router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiGet } from "../api/api";

interface Car {
  id: number;
  license_plate: string;
  type: string;
  status: string;
}

export default function CarStatus() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || !token) return;
      try {
        const carData = await apiGet(`/cars/${id}`, token);
        setCar(carData);
        const bookings: any = await apiGet("/bookings", token);
        if (Array.isArray(bookings)) {
          const carBookings = bookings.filter(
            (b: any) => b.car_id === Number(id)
          );
          if (carBookings.length > 0) {
            carBookings.sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setBookingStatus(carBookings[0].status);
          } else {
            setBookingStatus(null);
          }
        } else {
          setBookingStatus(null);
        }
      } catch (err) {
        console.error("Hiba az autó vagy foglalások betöltésekor:", err);
      }
    };
    load();
  }, [id, token]);

  if (!car)
    return (
      <p className="text-center mt-20 text-gray-600 text-lg">Betöltés…</p>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex flex-col">

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-gray-600 hover:underline w-fit"
      >
        &lt; Vissza
      </button>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto">

        <h1 className="text-3xl font-semibold mb-4">Státusz megtekintése</h1>

        <p className="text-xl font-medium">{car.license_plate}</p>
        <p className="text-gray-700">{car.type}</p>

        <div className="mt-6">
          <p className="text-lg font-semibold">Aktuális státusz:</p>
          {(() => {
            const s = String(bookingStatus || car.status || "Nincs státusz");
            const badge =
              s === "Kész"
                ? "bg-green-100 text-green-800"
                : s === "Folyamatban"
                ? "bg-yellow-100 text-yellow-800"
                : s === "Várakozik"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700";
            return (
              <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium ${badge}`}>{s}</span>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
