import type { HttpMethod } from '@ghostapi/types';
import type { RequestTab, ResponseTab } from './types';

export const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];

export const REQUEST_TABS: RequestTab[] = ['Params', 'Headers', 'Body', 'Auth', 'Mock'];
export const RESPONSE_TABS: ResponseTab[] = ['Response', 'Headers', 'Timeline'];
