import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const driversAdapter = createEntityAdapter({
    sortComparer: (a, b) => a.driverNum.localeCompare(b.driverNum)
})

const initialState = driversAdapter.getInitialState()

export const driversApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getDrivers: builder.query({
            query: () => ({
                url: '/drivers',
                validateStatus: (response, result) => response.status === 200 && !result.isError,
            }),
            transformResponse: responseData => {
                const loadedDrivers = responseData.map(driver => {
                    driver.id = driver._id;
                    return driver;
                });
                return driversAdapter.setAll(initialState, loadedDrivers);
            },
            providesTags: (result, error, arg) => 
                result?.ids
                ? [{ type: 'Driver', id: 'LIST' }, ...result.ids.map(id => ({ type: 'Driver', id }))]
                : [{ type: 'Driver', id: 'LIST' }]
        }),
        addNewDriver: builder.mutation({
            query: initialDriver => ({
                url: '/drivers',
                method: 'POST',
                body: { ...initialDriver }
            }),
            invalidatesTags: [{ type: 'Driver', id: 'LIST' }]
        }),
        updateDriver: builder.mutation({
            query: initialDriver => ({
                url: `/drivers`,
                method: 'PATCH',
                body: { ...initialDriver }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Driver', id: arg.id }]
        }),
        deleteDriver: builder.mutation({
            query: ({ id }) => ({
                url: `/drivers`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Driver', id: arg.id }]
        })
    })
})

export const {
    useGetDriversQuery,
    useAddNewDriverMutation,
    useUpdateDriverMutation,
    useDeleteDriverMutation,
} = driversApiSlice

export const selectDriversResult = driversApiSlice.endpoints.getDrivers.select();

const selectDriversData = createSelector(
    selectDriversResult,
    driversResult => driversResult.data ?? initialState
)

export const {
    selectAll: selectAllDrivers,
    selectById: selectDriverById,
    selectIds: selectDriverIds
} = driversAdapter.getSelectors(state => selectDriversData(state));
