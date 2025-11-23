<script lang="ts">
    import { goto } from "$app/navigation";
    import { readerStore } from "$lib/stores/readerStore";
    import { libraryStore } from "$lib/stores/libraryStore";

    let title = $state("");
    let content = $state("");
    let showSuccess = $state(false);

    const handleReadNow = () => {
        if (!content.trim()) {
            alert("Please paste some text first");
            return;
        }
        readerStore.setCurrentText(title || "Untitled", content);
        goto("/read");
    };

    const handleSaveToLibrary = () => {
        if (!content.trim()) {
            alert("Please paste some text first");
            return;
        }
        libraryStore.addItem({
            title: title || "Untitled",
            content: content,
        });
        showSuccess = true;
        setTimeout(() => {
            showSuccess = false;
        }, 3000);
        title = "";
        content = "";
    };
</script>

<div
    class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
>
    <div class="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <!-- Header -->
        <div class="text-center mb-8 md:mb-12">
            <h1
                class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4"
            >
                SpeedyReader
            </h1>
            <p class="text-base md:text-lg text-gray-600 dark:text-gray-300">
                Read faster with RSVP technology
            </p>
        </div>

        <!-- Navigation -->
        <div class="flex gap-3 mb-6 md:mb-8 justify-center">
            <a
                href="/library"
                class="px-4 py-2 md:px-6 md:py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium shadow-md text-sm md:text-base"
            >
                Library
            </a>
        </div>

        <!-- Success Message -->
        {#if showSuccess}
            <div
                class="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center font-medium"
            >
                Saved to library successfully!
            </div>
        {/if}

        <!-- Main Content -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            <!-- Title Input -->
            <div class="mb-6">
                <label
                    for="title"
                    class="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Title (optional)
                </label>
                <input
                    id="title"
                    type="text"
                    bind:value={title}
                    placeholder="Enter a title for your text"
                    class="w-full px-4 py-3 md:py-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
                />
            </div>

            <!-- Content Textarea -->
            <div class="mb-6">
                <label
                    for="content"
                    class="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    Paste your text
                </label>
                <textarea
                    id="content"
                    bind:value={content}
                    placeholder="Paste the text you want to read..."
                    rows="12"
                    class="w-full px-4 py-3 md:py-3.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base md:text-lg"
                ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                    onclick={handleReadNow}
                    class="flex-1 px-6 py-3.5 md:py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    Read Now
                </button>
                <button
                    onclick={handleSaveToLibrary}
                    class="flex-1 px-6 py-3.5 md:py-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    Save to Library
                </button>
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Fast, simple, and private. All data stored locally.</p>
        </div>
    </div>
</div>
