import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-semibold mb-4">Kapcsolat</h1>
          <p className="mb-8 text-gray-700">
            Vegye fel velünk a kapcsolatot az alábbi elérhetőségek egyikén, vagy
            látogasson el szervizünkbe. Szívesen segítünk minden kérdésben.
          </p>
          <div className="space-y-2 mb-8">
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
      </main>
      <Footer />
    </div>
  );
}