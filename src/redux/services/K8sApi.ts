import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const k8sApi = createApi({
  reducerPath: 'k8sAPI',
  baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:8001/'}),
  endpoints: builder => ({
    deleteNamespace: builder.mutation({
      query: ({namespace}) => ({
        url: `/api/v1/namespaces/${namespace}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {useDeleteNamespaceMutation} = k8sApi;
