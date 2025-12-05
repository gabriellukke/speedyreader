<script lang="ts">
	import { toastStore, type Toast } from '$lib/stores/toastStore';
	import { fade, fly } from 'svelte/transition';

	let toasts = $state<Toast[]>([]);

	toastStore.subscribe((value) => {
		toasts = value;
	});

	function getIcon(type: Toast['type']) {
		switch (type) {
			case 'success':
				return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
			case 'error':
				return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
			case 'warning':
				return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
			case 'info':
				return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;
		}
	}

	function getColors(type: Toast['type']) {
		switch (type) {
			case 'success':
				return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
			case 'error':
				return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
			case 'warning':
				return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
			case 'info':
				return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
		}
	}
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
	{#each toasts as toast (toast.id)}
		<div
			transition:fly={{ y: -20, duration: 300 }}
			class="pointer-events-auto rounded-lg border shadow-lg p-4 {getColors(toast.type)}"
		>
			<div class="flex items-start gap-3">
				<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{@html getIcon(toast.type)}
				</svg>
				<p class="flex-1 text-sm font-medium">{toast.message}</p>
				<button
					onclick={() => toastStore.dismiss(toast.id)}
					class="flex-shrink-0 hover:opacity-70 transition-opacity"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>
