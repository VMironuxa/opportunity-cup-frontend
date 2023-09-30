import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { toast } from 'react-toastify';

const mutex = new Mutex();
const baseQueryDefault = fetchBaseQuery({
  baseUrl: 'https://magicowgs.geryon.space/api_dev/',
  credentials: 'include',
  prepareHeaders: async headers => {
    const token = localStorage.getItem('accessToken');
    const lang = localStorage.getItem('lang')?.toLowerCase();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('language', lang != null ? lang : 'ru');
    headers.set('accept', 'application/json');
    headers.set('Sec-Fetch-Site', 'cross-site');
    headers.set('credentials', 'includes');

    return headers;
  },
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  await mutex.waitForUnlock();
  let result = await baseQueryDefault(args, api, extraOptions);
  const message = (result.data as any)?.message || (result.error?.data as any)?.message;
  if (
    result.error &&
    (result.error.status.toString().startsWith('2') || result.error.status.toString().startsWith('4'))
  ) {
    toast.error(message);
  }
  if (!result.error) {
    toast.success(message);
  }

  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQueryDefault('auth/refresh', api, extraOptions);
        if ((refreshResult.data as any)?.accessToken) {
          localStorage.setItem('accessToken', (refreshResult.data as any)?.accessToken);
          // retry the initial query
          result = await baseQueryDefault(args, api, extraOptions);
        } else {
          localStorage.removeItem('accessToken');
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQueryDefault(args, api, extraOptions);
    }
  }
  return result;
};