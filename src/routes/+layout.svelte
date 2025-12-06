<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import favicon from '$lib/assets/favicon.svg';
  import Toast from '$lib/components/Toast.svelte';
  import TopNav from '$lib/components/TopNav.svelte';
  import { page } from '$app/stores';
  import { settingsStore } from '$lib/stores/settingsStore';

  let { children } = $props();

  let isReaderPage = $derived($page.url.pathname === '/read');

  onMount(() => {
    settingsStore.init();
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
