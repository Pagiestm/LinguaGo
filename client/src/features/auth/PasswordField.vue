<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import { computed, ref } from 'vue';

const model = defineModel<string>({ default: '' });
const props = withDefaults(
  defineProps<{ id: string; autocomplete?: string; placeholder?: string; showRules?: boolean }>(),
  { autocomplete: 'current-password', placeholder: '••••••••••', showRules: false },
);

const visible = ref(false);

const rules = computed(() => [
  { label: '10 caractères minimum', ok: model.value.length >= 10 },
  { label: 'Une majuscule', ok: /[A-Z]/.test(model.value) },
  { label: 'Un chiffre', ok: /\d/.test(model.value) },
  { label: 'Un caractère spécial', ok: /[^A-Za-z0-9]/.test(model.value) },
]);
</script>

<template>
  <div>
    <UInput
      :id="props.id"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :autocomplete="props.autocomplete"
      :placeholder="props.placeholder"
      class="w-full"
      size="lg"
      :ui="{ trailing: 'pe-1' }"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          :aria-pressed="visible"
          @click="visible = !visible"
        />
      </template>
    </UInput>
    <ul
      v-if="props.showRules"
      class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs"
      aria-live="polite"
    >
      <li
        v-for="rule in rules"
        :key="rule.label"
        class="flex items-center gap-1.5"
        :class="rule.ok ? 'text-success' : 'text-muted'"
      >
        <span
          :class="rule.ok ? 'i-lucide-circle-check' : 'i-lucide-circle'"
          class="size-3.5"
          aria-hidden="true"
        />
        {{ rule.label }}
      </li>
    </ul>
  </div>
</template>
