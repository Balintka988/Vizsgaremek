import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiPost } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo-nobg.png";

export default function Login() {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

try {
      const res = await apiPost("/auth/login", { email, password });

    if (!res.token) {
      setError(res.message || "Hibás bejelentkezés");
      return;
    }

    setToken(res.token);
    navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      setError("Nem sikerült csatlakozni a szerverhez.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

      {/* Központi fehér kártya */}
      <div className="
        bg-white shadow-xl rounded-2xl 
        w-full max-w-4xl 
        grid grid-cols-1 md:grid-cols-2
        overflow-hidden
      ">

        {/* Bal oldal – LOGÓ + szöveg */}
        <div className="flex flex-col items-center justify-center bg-gray-100 p-8 sm:p-10">

          <img
            src={logo}
            alt="Autószerviz logó"
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain mb-6"
          />

          <h1 className="text-xl sm:text-2xl font-semibold text-center leading-tight">
            Jelentkezzen be <br /> saját fiókjába
          </h1>
        </div>

        {/* Jobb oldal – FORM */}
        <div className="p-8 sm:p-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">Bejelentkezés</h2>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block mb-1 text-gray-700">Email cím</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Jelszó</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Bejelentkezés
            </button>

            <p className="text-center mt-4 text-gray-600">
              Nincs fiókja?{" "}
              <Link to="/register" className="text-black font-medium hover:underline">
                Regisztráljon!
              </Link>
            </p>

          </form>
        </div>

      </div>
    </div>
  );
}
