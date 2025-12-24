<script lang="ts">
  import { t } from '$lib/i18n';

  let {
    title = $bindable(''),
    content = $bindable(''),
    disabled = false
  } = $props<{
    title?: string;
    content?: string;
    disabled?: boolean;
  }>();
</script>

<div class="space-y-4">
  <div>
    <label for="title" class="block text-sm font-medium text-foreground mb-1.5">
      {$t('home.titleLabel')}
    </label>
    <input
      id="title"
      type="text"
      bind:value={title}
      placeholder={$t('home.titlePlaceholder')}
      class="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
      {disabled}
    />
  </div>

  <div>
    <label for="content" class="block text-sm font-medium text-foreground mb-1.5">
      {$t('home.contentLabel')}
    </label>
    <textarea
      id="content"
      bind:value={content}
      placeholder={$t('home.inputPlaceholder')}
      rows="8"
      class="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
      {disabled}
    ></textarea>
  </div>
</div>
