import { PUBLIC_CMS_URL } from '$env/static/public';
import { authentication, createDirectus, realtime } from '@directus/sdk';
import { client as directus } from './client';
let client; // realtime client
export async function initializeRealTime(channelName, presenceKey, handlePresenceSync, handleRealtimeUpdate) {
  const url = new URL(PUBLIC_CMS_URL);
  url.pathname = '/websocket';
  url.protocol = 'wss';
  client = createDirectus(url.href)
    .with(authentication('json'))
    .with(realtime());
  const existingAuthToken = await directus.getToken();
  client.setToken(existingAuthToken);

  await client.connect();

  client.onWebSocket('open', function () {
    console.log({ event: 'onopen' });
  });

  const { subscription } = await client.subscribe('messages', {
    event: 'update',
    query: { fields: ['user', 'text'] },
  });
}

export function subscribeToRealtimeUpdates(channel, presenceKey, data) {
  console.log('we should subscribe to updates');
}

export function subscribeToSchemaChanges(tableName, filter, invalidate) {
  console.log('we should subscribe to schema changes');
}