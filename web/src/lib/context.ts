import { getContext, setContext } from 'svelte';
import type { StatusAPI } from './StatusAPI';
import type { HistoryAPI } from './HistoryAPI';

enum ContextKey {
   StatusAPI = 'status-api',
   HistoryAPI = 'history-api',
}

export function setStatusAPI(api: StatusAPI) {
   setContext(ContextKey.StatusAPI, api);
}

export function getStatusAPI(): StatusAPI {
   return getContext(ContextKey.StatusAPI);
}

export function setHistoryAPI(api: HistoryAPI) {
   setContext(ContextKey.HistoryAPI, api);
}

export function getHistoryAPI(): HistoryAPI {
   return getContext(ContextKey.HistoryAPI);
}
