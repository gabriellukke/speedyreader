<script lang="ts">
  let { icon, title, description, actionLabel, actionHref } = $props<{
    icon: string;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
  }>();
</script>

<div class="bg-card text-card-foreground rounded-lg border border-border p-12 text-center">
  <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
    {@html icon}
  </div>
  <h3 class="text-lg font-medium text-foreground mb-1">
    {title}
  </h3>
  {#if description}
    <p class="text-sm text-muted-foreground mb-6">
      {description}
    </p>
  {/if}
  {#if actionLabel && actionHref}
    <a
      href={actionHref}
      class="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
    >
      {actionLabel}
    </a>
  {/if}
</div>
