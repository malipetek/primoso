import { PUBLIC_CMS_TYPE } from '$env/static/public';
import * as supabaseRealtime from './providers/supabase/realtime';
import * as directusRealtime from './providers/directus/realtime';

let realtimeClient;

if (PUBLIC_CMS_TYPE === 'supabase') {
  realtimeClient = supabaseRealtime;
} else if (PUBLIC_CMS_TYPE === 'directus') {
  realtimeClient = directusRealtime;
}

export function initializeRealTime(channelName, presenceKey, handlePresenceSync, handleRealtimeUpdate) {
  return realtimeClient.initializeRealTime(channelName, presenceKey, handlePresenceSync, handleRealtimeUpdate);
}

export function subscribeToRealtimeUpdates(channel, presenceKey, data) {
  return realtimeClient.subscribeToRealtimeUpdates(channel, presenceKey, data);
}

export function subscribeToSchemaChanges(tableName, filter, invalidate) {
  return realtimeClient.subscribeToSchemaChanges(tableName, filter, invalidate);
}