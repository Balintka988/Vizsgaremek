import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-semibold mb-4">Adatvédelem</h1>
          <p className="text-gray-700">
            Az adatvédelmi tájékoztató fejlesztés alatt áll. A jelen honlap
            használata során a bejelentkezéshez szükséges adatok kerülnek
            megadásra, amelyeket bizalmasan kezelünk.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}