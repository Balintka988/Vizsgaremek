import { Link } from "react-router-dom";


export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Autószerviz</h3>
          <p className="text-sm mb-4">
            Professzionális autószerviz szolgáltatás 2009 óta.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Navigáció</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/" className="hover:underline">
                Főoldal
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:underline">
                Szolgáltatások
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                Rólunk
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Kapcsolat
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Elérhetőség</h4>
          <p className="text-sm">1234 Budapest, Példa utca 12.</p>
          <p className="text-sm">Telefon: +36 1 234 5678</p>
          <p className="text-sm">Email: info@autoszervizpro.hu</p>
          <p className="text-sm">Nyitvatartás: Hétfő - Péntek: 8:00 - 18:00</p>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs">
        <Link to="/terms" className="hover:underline mr-4">
          ÁSZF
        </Link>
        <Link to="/privacy" className="hover:underline">
          Adatvédelem
        </Link>
      </div>
    </footer>
  );
}