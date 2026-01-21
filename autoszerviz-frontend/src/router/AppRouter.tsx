import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NewCar from "../pages/NewCar";
import EditCar from "../pages/EditCar";
import CarStatus from "../pages/CarStatus";
import NewBooking from "../pages/NewBooking";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings/new" element={<NewBooking />} />
      <Route path="/cars/new" element={<NewCar />} />
      <Route path="/cars/:id/edit" element={<EditCar />} />
      <Route path="/cars/:id/status" element={<CarStatus />} />
</>
  )
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
