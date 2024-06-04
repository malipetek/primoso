import { client as supabase } from './client';

export function initializeRealTime(channelName, presenceKey, handlePresenceSync, handleRealtimeUpdate) {
  const channel = supabase.channel(channelName, {
    config: { presence: { key: presenceKey } },
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      channel.track({
        active_block: null,
      });
    }
  });

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    handlePresenceSync(state);
  });

  return channel;
}

export function subscribeToRealtimeUpdates(channel, presenceKey, data) {
  channel.track({
    ...data,
    presence_key: presenceKey,
    user: {
      email: data.user.email,
    },
  });
}

export function subscribeToSchemaChanges(tableName, page_id, invalidate) {
  return supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: tableName,
        filter: `page=eq.${page_id}`,
      },
      () => {
        invalidate('app:data');
      }
    )
    .subscribe();
}