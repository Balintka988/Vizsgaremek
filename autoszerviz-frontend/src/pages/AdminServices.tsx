import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/api";

type Service = {
  id: number;
  name: string;
  price: number;
  work_hours: number;
};

export default function AdminServices() {
  const { token, user, ready } = useContext(AuthContext);
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [workHours, setWorkHours] = useState("");

  const resetForm = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setWorkHours("");
    setFeedback(null);
  };

  const load = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const data = await apiGet("/services", token);
      setServices(Array.isArray(data) ? (data as Service[]) : []);
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", text: "Nem sikerült lekérni a szolgáltatásokat." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    load();
  }, [token, user, ready, navigate]);

  const openEdit = (s: Service) => {
    setEditing(s);
    setName(s.name);
    setPrice(String(s.price));
    setWorkHours(String(s.work_hours));
    setFeedback(null);
  };

  const normalizeNumOrThrow = (raw: string, label: string) => {
    const n = Number(String(raw ?? "").trim().replace(",", "."));
    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`Hibás ${label}`);
    }
    return n;
  };

  const submit = async () => {
    if (!token) return;

    setFeedback(null);

    try {
      const nm = name.trim();
      if (!nm) {
        throw new Error("A név kötelező");
      }

      const p = normalizeNumOrThrow(price, "ár");
      const wh = normalizeNumOrThrow(workHours, "munkaóra");

      if (editing) {
        await apiPut(
          `/services/${editing.id}`,
          { name: nm, price: p, work_hours: wh },
          token
        );
        setFeedback({ type: "success", text: "Szolgáltatás frissítve." });
      } else {
        await apiPost(
          "/services",
          { name: nm, price: p, work_hours: wh },
          token
        );
        setFeedback({ type: "success", text: "Szolgáltatás hozzáadva." });
      }

      setEditing(null);
      setName("");
      setPrice("");
      setWorkHours("");

      await load();
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Hiba történt.",
      });
    }
  };

  const remove = async (id: number) => {
    if (!token) return;

    if (!window.confirm("Biztosan törlöd ezt a szolgáltatást?")) return;

    setFeedback(null);

    try {
      await apiDelete(`/services/${id}`, token);
      setFeedback({ type: "success", text: "Szolgáltatás törölve." });

      if (editing?.id === id) {
        resetForm();
      }

      await load();
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Nem sikerült törölni.",
      });
    }
  };

  const title = useMemo(
    () => (editing ? "Szolgáltatás szerkesztése" : "Új szolgáltatás hozzáadása"),
    [editing]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">Szolgáltatások kezelése</h1>
            <button
              type="button"
              onClick={() => navigate("/admin?tab=bookings")}
              className="text-gray-600 hover:underline"
            >
              &lt; Vissza az admin felületre
            </button>
          </div>

          {feedback && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1">Név</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Pl.: Olajcsere"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ár (Ft)</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="12000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Munkaóra</label>
                <input
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={submit}
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                {editing ? "Mentés" : "Hozzáadás"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border"
                >
                  Mégse
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-lg font-semibold">Jelenlegi szolgáltatások</h2>
            </div>

            {loading ? (
              <div className="p-5 text-gray-600">Betöltés...</div>
            ) : services.length === 0 ? (
              <div className="p-5 text-gray-600">Nincs még szolgáltatás rögzítve.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-600 px-5 py-3">Név</th>
                      <th className="text-left text-sm font-medium text-gray-600 px-5 py-3">Ár</th>
                      <th className="text-left text-sm font-medium text-gray-600 px-5 py-3">Munkaóra</th>
                      <th className="text-right text-sm font-medium text-gray-600 px-5 py-3">Művelet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="px-5 py-3">{s.name}</td>
                        <td className="px-5 py-3">
                          {Number(s.price).toLocaleString("hu-HU")} Ft
                        </td>
                        <td className="px-5 py-3">
                          {Number(s.work_hours).toLocaleString("hu-HU")}
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            className="px-3 py-1 rounded-lg border mr-2"
                          >
                            Szerkesztés
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(s.id)}
                            className="px-3 py-1 rounded-lg border text-red-600"
                          >
                            Törlés
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}