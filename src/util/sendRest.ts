import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Helper function to send http requests using Axis.
 * @private
 */
export function sendAxiosRequest<Req, Res>(
  requestUrl: string,
  params: Req,
  overrides?: AxiosRequestConfig
): Promise<AxiosResponse<Res>> {
  const config: AxiosRequestConfig = {
    ...overrides,
    headers: {
      ...overrides?.headers,
      ...({ 'Accept-Encoding': 'gzip' }),
    },
    method: overrides?.method ?? 'GET',
    url: requestUrl,
    params
  };
  return axios(config);
}