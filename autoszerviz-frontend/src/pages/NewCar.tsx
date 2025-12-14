import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiPost } from "../api/api";
import { useNavigate } from "react-router";

export default function NewCar() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [licensePlate, setLicensePlate] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {}, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!licensePlate || !type) {
    setError("Minden mező kitöltése kötelező!");
    return;
  }

  try {
    await apiPost(
      "/cars",
      { license_plate: licensePlate, type },
      token
    );

    navigate("/dashboard");
  } catch (err) {
    console.error("Autó hozzáadás hiba:", err);
    setError("Nem sikerült csatlakozni a szerverhez.");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:underline mb-6 inline-block"
        >
          &lt; Vissza az irányítópultra
        </button>

        <h2 className="text-2xl font-semibold mb-6">Új autó hozzáadása</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700">Rendszám</label>
            <input
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="pl. ABC-123"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Típus</label>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="pl. Opel Astra 1.6"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition"
          >
            Mentés
          </button>
        </form>
      </div>
    </div>
  );
}
