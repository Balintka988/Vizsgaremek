import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="bg-gray-50 py-16 flex-grow">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-semibold mb-4">Rólunk</h1>
          <p className="mb-4 text-gray-700">
            Professzionális autószerviz szolgáltatást nyújtunk 2009 óta,
            modern felszereléssel és tapasztalt szakemberekkel. Több
            mint egy évtized alatt több ezer autó karbantartásában és
            javításában segítettünk.
          </p>
          <p className="mb-4 text-gray-700">
            Célunk, hogy ügyfeleink számára ne csak megoldásokat,
            hanem valódi értéket nyújtsunk. Szolgáltatásainkat úgy
            alakítottuk ki, hogy egyszerre legyenek hatékonyak,
            megbízhatók és személyre szabottak. Legyen szó
            olajcseréről, alkatrész beszerzésről, diagnosztikáról
            vagy általános karbantartásról, ránk számíthat.
          </p>
          <p className="mb-4 text-gray-700">
            Folyamatosan fejlesztjük szervizünket, hogy minden
            autómárka és modell számára a legjobb szolgáltatást
            biztosítsuk. Ügyfeleink elégedettsége számunkra a
            legfontosabb, ezért kiemelten figyelünk a minőségre,
            pontosságra és átláthatóságra.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}