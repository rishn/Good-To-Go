import { store } from '../../app/store'
import { bookingsApiSlice } from '../bookings/bookingsApiSlice';
import { vehiclesApiSlice } from '../vehicles/vehiclesApiSlice';
import { driversApiSlice } from '../drivers/driversApiSlice';
import { usersApiSlice } from '../users/usersApiSlice';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const Prefetch = () => {
    useEffect(() => {
        store.dispatch(bookingsApiSlice.util.prefetch('getBookings', 'bookingsList', { force: true }))
        store.dispatch(vehiclesApiSlice.util.prefetch('getVehicles', 'vehiclesList', { force: true }))
        store.dispatch(driversApiSlice.util.prefetch('getDrivers', 'driversList', { force: true }))
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true }))
    }, [])

    return <Outlet />
}

export default Prefetch
