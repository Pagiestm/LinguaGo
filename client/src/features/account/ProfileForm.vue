<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import { useToast } from '@nuxt/ui/composables';
import { useQuery } from '@pinia/colada';
import { computed, ref, watch } from 'vue';
import { account } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import { useSessionStore } from '@/shared/stores/session';
import AvatarImage from '@/shared/ui/AvatarImage.vue';
import SettingsCard from './SettingsCard.vue';

const session = useSessionStore();
const toast = useToast();
const { data: avatars } = useQuery({
  key: ['avatars'],
  query: account.avatars,
  staleTime: Infinity,
});

const pseudo = ref(session.user?.pseudo ?? '');
const avatarId = ref<number | null>(session.user?.avatar?.id ?? null);
const saving = ref(false);

watch(
  () => session.user,
  (user) => {
    pseudo.value = user?.pseudo ?? '';
    avatarId.value = user?.avatar?.id ?? null;
  },
);

const dirty = computed(
  () =>
    pseudo.value.trim() !== session.user?.pseudo ||
    avatarId.value !== (session.user?.avatar?.id ?? null),
);

async function save() {
  saving.value = true;
  try {
    const updated = await account.update({
      pseudo: pseudo.value.trim() !== session.user?.pseudo ? pseudo.value.trim() : undefined,
      avatarId:
        avatarId.value !== (session.user?.avatar?.id ?? null) && avatarId.value !== null
          ? avatarId.value
          : undefined,
    });
    session.setUser(updated);
    toast.add({ title: 'Profil enregistré', icon: 'i-lucide-circle-check', color: 'success' });
  } catch (error) {
    toast.add({
      title: error instanceof ApiError ? error.message : 'Enregistrement impossible',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <SettingsCard title="Profil" :description="`Connecté avec ${session.user?.email}`">
    <form class="space-y-6" @submit.prevent="save">
      <UFormField label="Pseudo" name="pseudo" required>
        <UInput
          id="pseudo"
          v-model="pseudo"
          maxlength="40"
          size="lg"
          class="w-full sm:max-w-sm"
          autocomplete="nickname"
        />
      </UFormField>
      <fieldset>
        <legend class="text-sm font-bold">Avatar</legend>
        <div class="mt-3 flex flex-wrap gap-3">
          <button
            v-for="avatar in avatars ?? []"
            :key="avatar.id"
            type="button"
            class="flex size-[4.75rem] items-center justify-center rounded-full border-[3px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="
              avatarId === avatar.id
                ? 'border-primary'
                : 'border-transparent opacity-70 hover:opacity-100'
            "
            :aria-pressed="avatarId === avatar.id"
            :aria-label="`Avatar ${avatar.id}`"
            @click="avatarId = avatar.id"
          >
            <AvatarImage :avatar="avatar" :name="pseudo" size="lg" />
          </button>
        </div>
      </fieldset>
      <UButton
        type="submit"
        class="btn-pop font-extrabold"
        :loading="saving"
        :disabled="!dirty || pseudo.trim().length < 2"
        >Enregistrer</UButton
      >
    </form>
  </SettingsCard>
</template>
