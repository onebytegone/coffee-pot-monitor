import { getContext, setContext } from 'svelte';
import type { StatusAPI } from './StatusAPI';

enum ContextKey {
   StatusAPI = 'status-api',
}

export function setStatusAPI(api: StatusAPI) {
   setContext(ContextKey.StatusAPI, api);
}

export function getStatusAPI(): StatusAPI {
   return getContext(ContextKey.StatusAPI);
}
