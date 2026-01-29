import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Services() {
  const rows = [
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
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="bg-white py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-semibold text-center mb-8">
            Szolgáltatásaink
          </h1>
          <p className="text-center text-gray-700 mb-10 max-w-3xl mx-auto">
            Válasszon az általános szerviz, alkatrész beszerzés, diagnosztika
            vagy tanácsadás szolgáltatásaink közül. Modern műszereink és
            képzett szerelőink garantálják a minőségi munkát.
          </p>
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
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-none"
                  >
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
              változhatnak. Az anyagköltség külön kerül felszámításra.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}