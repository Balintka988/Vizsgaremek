import { useState } from "react";
import { apiPost } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo-nobg.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const res = await apiPost("/auth/register", form);
    console.log("Backend válasza:", res);

    if (res.message && typeof res.message === "string") {
      if (res.message.includes("Duplicate entry")) {
        setError("Ezzel az email címmel már létezik felhasználó.");
        return;
      }
    }

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.message && res.message !== "Sikeres regisztráció") {
      setError(res.message);
      return;
    }

if (res.message === "Sikeres regisztráció") {
  setError("Sikeres regisztráció! Átirányítás...");

  setTimeout(() => {
    navigate("/login");
  }, 2000);

  return;
}

    setError("Ismeretlen hiba történt.");
    
  } catch (err) {
    console.error(err);
    setError("Nem sikerült csatlakozni a szerverhez.");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
    <Link
      to="/"
      className="
        absolute top-6 left-6
        flex items-center gap-2
        text-gray-700 hover:text-black
        transition
      "
    >
      <ArrowBackIcon fontSize="small" />
      <span className="text-sm font-medium">Vissza a főoldalra</span>
    </Link>

      <div className="
        bg-white shadow-xl rounded-2xl 
        w-full max-w-4xl 
        grid grid-cols-1 md:grid-cols-2
        overflow-hidden
      ">

        <div className="flex flex-col items-center justify-center bg-gray-100 p-8 sm:p-10">
          <img
            src={logo}
            alt="Autószerviz logó"
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain mb-6"
          />

          <h1 className="text-xl sm:text-2xl font-semibold text-center leading-tight">
            Hozzon létre egy <br /> új fiókot
          </h1>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">Regisztráció</h2>

          <form onSubmit={handleRegister} className="space-y-5">

            <div>
              <label className="block mb-1 text-gray-700">Név</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="pl. Teszt Elek"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="pl. teszt@email.hu"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Telefonszám</label>
              <input
                name="phone"
                type="text"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="pl. +36 30 123 4567"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Jelszó</label>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Jelszó"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Regisztráció
            </button>

            <p className="text-center mt-4 text-gray-600">
              Van már fiókja?{" "}
              <Link to="/login" className="text-black font-medium hover:underline">
                Jelentkezzen be!
              </Link>
            </p>

          </form>
        </div>

      </div>
    </div>
  );
}
