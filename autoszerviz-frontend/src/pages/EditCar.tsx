import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiGet, apiPut } from "../api/api";

export default function EditCar() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [license, setLicense] = useState("");
  const [type, setType] = useState("");

  const [original, setOriginal] = useState({ license: "", type: "" });

  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await apiGet(`/cars/${id}`, token);

        setLicense(data.license_plate);
        setType(data.type);
        setOriginal({
          license: data.license_plate,
          type: data.type,
        });
      } catch {
        setMessage({
          type: "error",
          text: "Nem sikerült betölteni az adatokat.",
        });
      }
    };

    load();
  }, [id, token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (license.length === 0 || type.length === 0) {
      setMessage({
        type: "error",
        text: "Minden mező kitöltése kötelező!",
      });
      return;
    }

    if (license === original.license && type === original.type) {
      setMessage({
        type: "error",
        text: "Nem történt változtatás.",
      });
      return;
    }

    try {
      await apiPut(
        `/cars/${id}`,
        { license_plate: license, type },
        token
      );

      setMessage({
        type: "success",
        text: "Sikeres szerkesztés!",
      });

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Mentési hiba:", err);
      setMessage({
        type: "error",
        text: "Nem sikerült menteni a módosítást.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:underline mb-4 inline-block"
        >
          &lt; Vissza
        </button>

        <h2 className="text-2xl font-semibold mb-6">Autó szerkesztése</h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-gray-700 mb-1 block">Rendszám</label>
            <input
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-700 mb-1 block">Típus</label>
            <input
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          {message && (
            <p
              className={`text-center py-2 rounded-lg ${
                message.type === "error"
                  ? "text-red-700 bg-red-100"
                  : "text-green-700 bg-green-100"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition mt-2"
          >
            Mentés
          </button>
        </form>
      </div>
    </div>
  );
}
