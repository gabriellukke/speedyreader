<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import favicon from '$lib/assets/favicon.svg';
  import Toast from '$lib/components/Toast.svelte';
  import TopNav from '$lib/components/TopNav.svelte';
  import { page } from '$app/stores';
  import { settingsStore } from '$lib/stores/settingsStore';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { isNativePlatform } from '$lib/utils/capacitorUtils';

  let { children } = $props();

  let isReaderPage = $derived($page.url.pathname === '/read');

  onMount(async () => {
    settingsStore.init();

    if (isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#030712' });
      } catch (error) {
        console.error('StatusBar error:', error);
      }
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if !isReaderPage}
  <TopNav />
{/if}
{@render children()}

<Toast />
