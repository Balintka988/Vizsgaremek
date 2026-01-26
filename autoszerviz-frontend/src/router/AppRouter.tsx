import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NewCar from "../pages/NewCar";
import EditCar from "../pages/EditCar";
import CarStatus from "../pages/CarStatus";
import NewBooking from "../pages/NewBooking";
import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import AdminDashboard from "../pages/AdminDashboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings/new" element={<NewBooking />} />
      <Route path="/cars/new" element={<NewCar />} />
      <Route path="/cars/:id/edit" element={<EditCar />} />
      <Route path="/cars/:id/status" element={<CarStatus />} />
      <Route path="/admin" element={<AdminDashboard />} />
</>
  )
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
