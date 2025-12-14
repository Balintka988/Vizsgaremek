import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiGet } from "../api/api";
import { useNavigate } from "react-router";

interface Car {
  id: number;
  license_plate: string;
  type: string;
  status: string;
}

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchCars = async () => {
    try {
      const res = await apiGet("/cars", token);

      if (!Array.isArray(res)) {
        console.warn("A backend nem tömböt küldött vissza:", res);
        setCars([]);
        return;
      }

      setCars(res);
    } catch (error) {
      console.error("Hiba az autók lekérésekor:", error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  fetchCars();
}, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Üdvözöljük az ügyfél felületen!</h1>

      <div className="bg-white shadow rounded-xl p-6 max-w-md">
        <p className="text-gray-700 text-lg">Autóinak száma</p>
        <p className="text-4xl font-bold mt-2">{cars.length}</p>

        <button
          onClick={() => navigate("/cars/new")}
          className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          Új autó hozzáadása
        </button>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Saját járművek:</h2>

        {loading ? (
          <p>Betöltés...</p>
        ) : cars.length === 0 ? (
          <p>Még nincs regisztrált autó.</p>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white shadow rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold">{car.license_plate}</h3>
                  <p className="text-gray-700">{car.type}</p>
                  <p className="text-gray-500 mt-2">
                    Státusz:{" "}
                    <span className="font-medium">
                      {car.status || "Nincs státusz"}
                    </span>
                  </p>
                </div>

                <button className="mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition">
                  Státusz megtekintése
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
