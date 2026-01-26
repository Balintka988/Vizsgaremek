import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SpeedIcon from "@mui/icons-material/Speed";
import InfoIcon from "@mui/icons-material/Info";

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleAppointmentClick = () => {
    if (token) {
      navigate("/bookings/new");
    } else {
      navigate("/login");
    }
  };
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Professzionális autószerviz modern felszereléssel
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mb-8">
              Foglaljon időpontot online, kövesse nyomon autója javítását
              valós időben, és maradjon mindig naprakész a szerviz
              munkálatokról.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleAppointmentClick}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
              >
                Foglaljon időpontot
              </button>
              <Link
                to="/about"
                className="border border-black text-black px-6 py-3 rounded-lg hover:bg-gray-100"
              >
                Rólunk
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-5xl font-bold text-black">400+</p>
              <p className="text-gray-700 mt-2">Elégedett ügyfél</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-black">10+</p>
              <p className="text-gray-700 mt-2">Javított márka</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-black">8+</p>
              <p className="text-gray-700 mt-2">Év tapasztalat</p>
            </div>
          </div>
        </section>
        <section id="services" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-8">
              Szolgáltatásaink
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow">
                <BuildIcon
                  className="text-black mb-4"
                  fontSize="large"
                />
                <h3 className="font-semibold mb-2">Általános szerviz</h3>
                <p className="text-sm text-gray-600">
                  Olajcsere, fékcsere, futómű beállítás és egyéb alap
                  szerviz szolgáltatások.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow">
                <ShoppingCartIcon
                  className="text-black mb-4"
                  fontSize="large"
                />
                <h3 className="font-semibold mb-2">Alkatrész beszerzés</h3>
                <p className="text-sm text-gray-600">
                  Minőségi, megbízható alkatrészek rövid határidővel.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow">
                <SpeedIcon
                  className="text-black mb-4"
                  fontSize="large"
                />
                <h3 className="font-semibold mb-2">Diagnosztika</h3>
                <p className="text-sm text-gray-600">
                  Modern diagnosztikai eszközökkel pontos hibafeltárás.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow">
                <InfoIcon
                  className="text-black mb-4"
                  fontSize="large"
                />
                <h3 className="font-semibold mb-2">Információ</h3>
                <p className="text-sm text-gray-600">
                  Segítség és tanácsadás autója karbantartásához.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-8">Áraink</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Szolgáltatás</th>
                    <th className="px-4 py-2 text-left">Leírás</th>
                    <th className="px-4 py-2 text-left">Ár (Ft-tól)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      service: "Olajcsere",
                      desc: "Motorolaj és olajszűrő cseréje, ellenőrzés",
                      price: "12 000",
                    },
                    {
                      service: "Fékbetét csere (első)",
                      desc: "Fékbetétek cseréje, fékrendszer ellenőrzése",
                      price: "15 000",
                    },
                    {
                      service: "Féktárcsa csere (pár)",
                      desc: "Fékbetétek és tárcsák cseréje, bejáratás",
                      price: "25 000",
                    },
                    {
                      service: "Futómű beállítás",
                      desc: "Digitális futóműbeállítás, kormánygeometria",
                      price: "14 900",
                    },
                    {
                      service: "Diagnosztika",
                      desc: "Hibakód olvasás, törlés, alapbeállítások",
                      price: "6 000",
                    },
                    {
                      service: "Vásárlás előtti csomag",
                      desc: "Autó teljeskörű átvizsgálása",
                      price: "18 000",
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b last:border-none">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.service}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.desc}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.price} Ft
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Az árak tájékoztató jellegűek, és autótípusonként
                változhatnak. Az anyagköltség külön kerül
                felszámításra.
              </p>
            </div>
          </div>
        </section>
        <section id="about-preview" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-4">Rólunk</h2>
            <p className="text-gray-700 mb-4">
              Célunk, hogy ügyfeleink számára ne csak megoldásokat,
              hanem valódi értéket nyújtsunk. Szolgáltatásainkat úgy
              alakítottuk ki, hogy egyszerre legyenek hatékonyak,
              megbízhatók és személyre szabottak.
            </p>
            <Link
              to="/about"
              className="text-black font-medium hover:underline"
            >
              Tudjon meg többet rólunk &rarr;
            </Link>
          </div>
        </section>
        <section id="contact-preview" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-4">Kapcsolat</h2>
            <p className="text-gray-700">
              Kérdése van vagy időpontot szeretne foglalni? Vegye fel
              velünk a kapcsolatot!
            </p>
            <div className="mt-8 space-y-2">
              <p>
                <strong>Cím:</strong> 1234 Budapest, Példa utca 12.
              </p>
              <p>
                <strong>Telefon:</strong> +36 1 234 5678
              </p>
              <p>
                <strong>Email:</strong> info@autoszervizpro.hu
              </p>
              <p>
                <strong>Nyitvatartás:</strong> Hétfő - Péntek: 8:00 - 18:00 |
                Szombat - Vasárnap: Zárva
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}