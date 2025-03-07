import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log("Backend URL:", backendUrl);

const baseQuery = fetchBaseQuery({
  baseUrl: backendUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const userInfo = getState().auth?.userInfo;

    if (userInfo?.token) {
      headers.set("Authorization", `Bearer ${userInfo.token}`);
      console.log("Sending request with token:", userInfo.token);
    } else {
      console.warn(" No token found in Redux state.");
    }

    return headers;
  },
});

const baseQueryWithInterceptor = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error) {
    console.error(" API Error:", result.error);

    if (result.error.data) {
      const { success, message, errors } = result.error.data;

      result.error = {
        status: result.error.status,
        message: errors?.length
          ? errors.join(", ")
          : message || "An error occurred",
      };
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ["User", "RequestedProduct", "Sale", "Purchase"],
  endpoints: (builder) => ({}),
});
