<script>
  import { PrimoPage, locked_blocks } from '@primocms/builder'
  import { browser } from '$app/environment'
  import { invalidate } from '$app/navigation'
  import { createUniqueID } from '$lib/utils'
  import {
    initializeRealTime,
    subscribeToRealtimeUpdates,
    subscribeToSchemaChanges,
  } from '$lib/cmsprovider/realtime.js'

  export let data

  const presence_key = createUniqueID()

  const handlePresenceSync = (state) => {
    $locked_blocks = Object.entries(state)
      .map(([key, value]) => ({
        key,
        block_id: value[0]['active_block'],
        user: value[0]['user'],
      }))
      .filter((block) => block.key !== presence_key)
  }

  const channel = initializeRealTime(
    'locked-blocks',
    presence_key,
    handlePresenceSync,
    subscribeToRealtimeUpdates,
  )

  subscribeToRealtimeUpdates(channel, presence_key, data)

  if (browser) {
    subscribeToSchemaChanges('sections', data.page.id, invalidate)
  }
</script>

<PrimoPage
  page={{
    ...data.page,
    sections: data.sections,
  }}
/>
