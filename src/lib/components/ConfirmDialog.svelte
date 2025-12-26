<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';

  let {
    open = $bindable(false),
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    destructive = false
  } = $props<{
    open?: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    destructive?: boolean;
  }>();
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <button
        onclick={() => (open = false)}
        class="px-4 py-2 rounded-lg border border-border bg-card text-card-foreground
          hover:bg-accent transition-colors text-sm font-medium cursor-pointer"
      >
        {cancelLabel}
      </button>
      <button
        onclick={onConfirm}
        class="px-4 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer
          {destructive
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'}"
      >
        {confirmLabel}
      </button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
