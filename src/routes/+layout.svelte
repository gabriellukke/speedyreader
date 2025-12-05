<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Toast from '$lib/components/Toast.svelte';
  import TopNav from '$lib/components/TopNav.svelte';
  import { page } from '$app/stores';

  let { children } = $props();

  let isReaderPage = $derived($page.url.pathname === '/read');
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
  {#if !isReaderPage}
    <TopNav />
  {/if}
  {@render children()}
</div>

<Toast />
