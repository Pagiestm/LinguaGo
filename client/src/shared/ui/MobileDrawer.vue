<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { nextTick, onBeforeUnmount, useTemplateRef, watch } from 'vue';
import { usePrefersReducedMotion } from '@/shared/composables/usePrefersReducedMotion';
import AppLogo from './AppLogo.vue';

const props = withDefaults(defineProps<{ hideFrom?: 'md' | 'lg'; label?: string }>(), {
  hideFrom: 'lg',
  label: 'Menu',
});
const open = defineModel<boolean>('open', { default: false });

const reduced = usePrefersReducedMotion();
const closeButton = useTemplateRef<{ $el?: HTMLElement }>('closeButton');
const hidden = { md: 'md:hidden', lg: 'lg:hidden' };

const motion = (classes: string) => (reduced.value ? 'duration-0' : classes);

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false;
}

watch(open, async (value) => {
  document.body.style.overflow = value ? 'hidden' : '';
  if (value) {
    document.addEventListener('keydown', onKeydown);
    await nextTick();
    closeButton.value?.$el?.focus?.();
  } else {
    document.removeEventListener('keydown', onKeydown);
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      :enter-active-class="motion('transition-opacity duration-300 ease-out')"
      :leave-active-class="motion('transition-opacity duration-200 ease-in')"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        :class="hidden[props.hideFrom]"
        aria-hidden="true"
        @click="open = false"
      />
    </Transition>
    <Transition
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
      :enter-active-class="motion('transition-transform duration-300 ease-out')"
      :leave-active-class="motion('transition-transform duration-200 ease-in')"
    >
      <aside
        v-if="open"
        class="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col border-r-2 border-default bg-default shadow-[8px_0_0_0_rgba(0,0,0,0.25)]"
        :class="hidden[props.hideFrom]"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
      >
        <div class="flex h-16 shrink-0 items-center justify-between px-4">
          <AppLogo />
          <UButton
            ref="closeButton"
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            aria-label="Fermer le menu"
            @click="open = false"
          />
        </div>
        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <slot />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
