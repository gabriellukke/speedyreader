<script lang="ts">
  import TextInputForm from '$lib/components/TextInputForm.svelte';
  import HomeActions from '$lib/components/home/HomeActions.svelte';
  import OCRUploader from '$lib/components/home/OCRUploader.svelte';
  import { t } from '$lib/i18n';

  let title = $state('');
  let content = $state('');

  const handleTextExtracted = (extractedText: string, shouldAppend: boolean) => {
    if (shouldAppend && content) {
      content = content + '\n\n' + extractedText;
    } else {
      content = extractedText;
    }
    if (!title) {
      title = 'Image Text';
    }
  };

  const clearForm = () => {
    title = '';
    content = '';
  };
</script>

<div class="min-h-screen container mx-auto px-4 py-8 max-w-2xl safe-area-content">
  <div class="text-center mb-8">
    <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-2">
      {$t('home.title')}
    </h1>
    <p class="text-muted-foreground">
      {$t('home.subtitle')}
    </p>
  </div>

  <div class="space-y-6">
    <div class="bg-card text-card-foreground rounded-lg border border-border p-5">
      <TextInputForm bind:title bind:content />
      <HomeActions {title} {content} onClearForm={clearForm} />
    </div>

    {#if false}
      <OCRUploader onTextExtracted={handleTextExtracted} />
    {/if}
  </div>

  <p class="text-center text-xs text-muted-foreground mt-8">
    {$t('home.footer')}
  </p>
</div>
