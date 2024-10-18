import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Public from './components/Public';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import DashLayout from './components/DashLayout';
import Welcome from './features/auth/Welcome';
import DriverList from './features/drivers/DriverList'; 
import EditDriverForm from './features/drivers/EditDriverForm';
import NewDriverForm from './features/drivers/NewDriverForm';
import VehicleList from './features/vehicles/VehicleList';
import EditVehicleForm from './features/vehicles/EditVehicleForm';
import NewVehicleForm from './features/vehicles/NewVehicleForm';
import AdminList from './features/users/AdminList';
import EditAdminForm from './features/users/EditAdminForm';
import NewAdminForm from './features/users/NewAdminForm';
import BookingList from './features/bookings/BookingList'; // Importing BookingList component
import NewBookingForm from './features/bookings/NewBookingForm';
import AdminDashboard from './features/users/AdminDashboard';
import BookingView from './features/bookings/BookingView';
import Profile from './components/Profile';
import Prefetch from './features/auth/Prefetch';
import PersistLogin from './features/auth/PersistLogin';
import RequireAuth from './features/auth/RequireAuth';
import { ROLES } from './config/roles';
import useTitle from './hooks/useTitle';
import { useGetUsersQuery } from './features/users/usersApiSlice';
import { useGetDriversQuery } from './features/drivers/driversApiSlice'; 
import { useGetVehiclesQuery } from './features/vehicles/vehiclesApiSlice';
import { useGetBookingsQuery } from './features/bookings/bookingsApiSlice'; // Importing useGetBookingsQuery
import useAuth from './hooks/useAuth'; // Importing useAuth for determining logged-in user roles

function App() {
  useTitle('Atlan Application');

  const { id, isDriver, isAdmin } = useAuth(); // Use useAuth to get logged-in user details

  const { data: usersResult, isSuccess: isUsersSuccess, isLoading: isUsersLoading } = useGetUsersQuery(undefined);
  const { data: driversResult, isSuccess: isDriversSuccess, isLoading: isDriversLoading } = useGetDriversQuery(undefined);
  const { data: vehiclesResult, isSuccess: isVehiclesSuccess, isLoading: isVehiclesLoading } = useGetVehiclesQuery(undefined);
  const { data: bookingsResult, isSuccess: isBookingsSuccess, isLoading: isBookingsLoading } = useGetBookingsQuery(undefined); // Fetch bookings

  const drivers = isUsersSuccess && isDriversSuccess && driversResult?.ids
    ? driversResult.ids
      .map((id) => {
        const driver = driversResult.entities[id];
        const user = usersResult?.entities[driver.userId];
        return { ...driver, user };
      })
    : [];

  const vehicles = isVehiclesSuccess && vehiclesResult?.ids
    ? vehiclesResult.ids.map((id) => vehiclesResult.entities[id])
    : [];

  const admins = isUsersSuccess && usersResult?.ids
    ? usersResult.ids
        .map((id) => usersResult.entities[id])
        .filter((user) => user.role === ROLES.Admin)
    : [];

  // Filter bookings to only include those made by the logged-in customer
  const customerBookings = isBookingsSuccess && bookingsResult?.ids && !isDriver && !isAdmin
    ? bookingsResult.ids
        .map((id) => bookingsResult.entities[id])
        .filter((booking) => booking.userId._id === id) // Filter bookings by logged-in customer
    : [];

  // Filter bookings to only include those for the logged-in driver
  const driverBookings = isBookingsSuccess && bookingsResult?.ids && isDriver
    ? bookingsResult.ids
        .map((id) => bookingsResult.entities[id])
        .filter((booking) => booking.driverId._id || booking.driverId.id === id) // Filter bookings by logged-in customer
    : [];

  if (isBookingsLoading || isDriversLoading || isUsersLoading || isVehiclesLoading)
    return <Spin tip="Loading content..." />;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        {/* Protected routes */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}>
            <Route element={<Prefetch />}>
              {/* Dashboard */}
              <Route path="atlan" element={<DashLayout />}>
                <Route index element={<Welcome />} />

                <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                  <Route path="analytics" element={<AdminDashboard />} />
                  <Route path="drivers">
                    <Route index element={<DriverList drivers={drivers} />} />
                    {drivers.map((driver) => (
                      <Route
                        key={driver.driverNum}
                        path={`/atlan/drivers/${driver.driverNum}`}
                        element={<EditDriverForm driver={driver} vehicles={vehicles} />}
                      />
                    ))}
                    <Route path="new" element={<NewDriverForm vehicles={vehicles}/>} />
                  </Route>

                  <Route path="admins">
                    <Route index element={<AdminList admins={admins} />} />
                    {admins.map((admin) => (
                      <Route
                        key={admin.username}
                        path={`/atlan/admins/${admin.username}`}
                        element={<EditAdminForm admin={admin} />}
                      />
                    ))}
                    <Route path="new" element={<NewAdminForm />} />
                  </Route>

                  <Route path="vehicles">
                    <Route index element={<VehicleList vehicles={vehicles} />} />
                    {vehicles.map((vehicle) => (
                      <Route
                        key={vehicle.licensePlate}
                        path={`/atlan/vehicles/${vehicle.licensePlate.split(' ').join('')}`}
                        element={<EditVehicleForm vehicle={vehicle} />}
                      />
                    ))}
                    <Route path="new" element={<NewVehicleForm />} />
                  </Route>
                </Route>

                {/* Customer Bookings */}
                <Route element={<RequireAuth allowedRoles={[ROLES.Customer, ROLES.Driver]} />}>
                  <Route path="bookings"> 
                    <Route index element={<BookingList bookings={isDriver ? driverBookings : customerBookings} />} />
                    {(isDriver ? driverBookings : customerBookings).map((booking) => (
                      <Route
                        key={booking.id || booking._id}
                        path={`/atlan/bookings/${booking.id || booking._id}`}
                        element={<BookingView booking={booking} />}
                      />
                    ))}
                  </Route>
                </Route>

                {/* Customer Bookings */}
                <Route element={<RequireAuth allowedRoles={[ROLES.Customer]} />}>
                  <Route path="bookings/new" element={<NewBookingForm drivers={drivers} />} />
                </Route>

                <Route path="profile" element={<Profile />} />
              </Route>
              {/* End dashboard */}
            </Route>
          </Route>
        </Route>
        {/* End protected routes */}
      </Route>
      {/* Public routes */}
    </Routes>
  );
}

export default App;
