import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo-nobg.png";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const firstName = user?.role === "admin" ? "Admin" : user?.name?.split(" ")[0] ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Autószerviz logó"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
          <span className="font-bold text-lg sm:text-xl">
            Autószerviz
          </span>
        </Link>
        <div className="hidden md:flex gap-6">
          <Link
            to="/"
            className="hover:text-black text-gray-600 font-medium"
          >
            Főoldal
          </Link>
          <Link
            to="/services"
            className="hover:text-black text-gray-600 font-medium"
          >
            Szolgáltatások
          </Link>
          <Link
            to="/about"
            className="hover:text-black text-gray-600 font-medium"
          >
            Rólunk
          </Link>
          <Link
            to="/contact"
            className="hover:text-black text-gray-600 font-medium"
          >
            Kapcsolat
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4 relative" ref={menuRef}>
          {token && user ? (
            <>
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-black font-medium focus:outline-none"
              >
                {firstName}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white border shadow-lg rounded-md z-50 overflow-visible"
                >
                  {user.role === "admin" ? (
                    <>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin dashboard
                      </Link>
                      <Link
                        to="/admin?tab=bookings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Foglalások
                      </Link>
                      <Link
                        to="/admin?tab=cars"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Autók kezelése
                      </Link>
                      <Link
                        to="/admin?tab=notifications"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Értesítések
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Irányítópult
                      </Link>
                      <Link
                        to="/dashboard?tab=bookings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Foglalások
                      </Link>
                      <Link
                        to="/dashboard?tab=notifications"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Értesítések
                      </Link>
                      <Link
                        to="/dashboard?tab=profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profil
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Kijelentkezés
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium"
            >
              Bejelentkezés
            </Link>
          )}
        </div>
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="text-gray-600 hover:text-black focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden absolute right-0 top-full w-full bg-white border-t shadow-lg z-40">
          <div className="flex flex-col p-4 space-y-2">
            {/* Links visible to everyone */}
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Főoldal
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Szolgáltatások
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Rólunk
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Kapcsolat
            </Link>
            {token && user ? (
              <>
                {user.role === "admin" ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/admin");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Admin dashboard
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/admin?tab=bookings");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Foglalások
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/admin?tab=cars");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Autók kezelése
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/admin?tab=notifications");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Értesítések
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/dashboard");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Irányítópult
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/dashboard?tab=bookings");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Foglalások
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/dashboard?tab=notifications");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Értesítések
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/dashboard?tab=profile");
                      }}
                      className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Profil
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate("/");
                  }}
                  className="text-left text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Kijelentkezés
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
              >
                Bejelentkezés
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}