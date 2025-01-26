import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const vehiclesAdapter = createEntityAdapter({
    sortComparer: (a, b) => a.type.localeCompare(b.type)
})

const initialState = vehiclesAdapter.getInitialState()

export const vehiclesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getVehicles: builder.query({
            query: () => ({
                url: '/vehicles',
                validateStatus: (response, result) => response.status === 200 && !result.isError,
            }),
            transformResponse: responseData => {
                const loadedVehicles = responseData.map(vehicle => {
                    vehicle.id = vehicle._id;
                    return vehicle;
                });
                return vehiclesAdapter.setAll(initialState, loadedVehicles);
            },
            providesTags: (result, error, arg) => 
                result?.ids
                ? [{ type: 'Vehicle', id: 'LIST' }, ...result.ids.map(id => ({ type: 'Vehicle', id }))]
                : [{ type: 'Vehicle', id: 'LIST' }]
        }),
        addNewVehicle: builder.mutation({
            query: initialVehicle => ({
                url: '/vehicles',
                method: 'POST',
                body: { ...initialVehicle }
            }),
            invalidatesTags: [{ type: 'Vehicle', id: 'LIST' }]
        }),
        updateVehicle: builder.mutation({
            query: initialVehicle => ({
                url: `/vehicles`,
                method: 'PATCH',
                body: { ...initialVehicle }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Vehicle', id: arg.id }]
        }),
        deleteVehicle: builder.mutation({
            query: ({ id }) => ({
                url: `/vehicles`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Vehicle', id: arg.id }]
        })
    })
})

export const {
    useGetVehiclesQuery,
    useAddNewVehicleMutation,
    useUpdateVehicleMutation,
    useDeleteVehicleMutation,
} = vehiclesApiSlice

export const selectVehiclesResult = vehiclesApiSlice.endpoints.getVehicles.select();

const selectVehiclesData = createSelector(
    selectVehiclesResult,
    vehiclesResult => vehiclesResult.data
)

export const {
    selectAll: selectAllVehicles,
    selectById: selectVehicleById,
    selectIds: selectVehicleIds
} = vehiclesAdapter.getSelectors(state => selectVehiclesData(state));
