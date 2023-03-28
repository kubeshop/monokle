import {BaseQueryFn, FetchArgs, createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

import {RootState} from '@shared/models/rootState';

const dynamicBaseQuery: BaseQueryFn<string | FetchArgs, unknown> = async (args, WebApi, extraOptions) => {
  const proxyPort = (WebApi.getState() as RootState).config.clusterProxyPort;
  const baseUrl = `http://localhost:${proxyPort}/`;
  return fetchBaseQuery({
    baseUrl,
  })(args, WebApi, extraOptions);
};

export const k8sApi = createApi({
  reducerPath: 'k8sAPI',
  baseQuery: dynamicBaseQuery,
  endpoints: builder => ({
    getNamespaces: builder.query({
      query: () => '/api/v1/namespaces',
    }),
    getNamespace: builder.query({
      query: ({namespace}) => `/api/v1/namespaces/${namespace}`,
    }),
    deleteNamespace: builder.mutation({
      query: ({namespace}) => ({
        url: `/api/v1/namespaces/${namespace}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {useGetNamespaceQuery, useGetNamespacesQuery, useDeleteNamespaceMutation} = k8sApi;
