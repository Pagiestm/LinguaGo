<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import USelect from '@nuxt/ui/components/Select.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import UTextarea from '@nuxt/ui/components/Textarea.vue';
import { useToast } from '@nuxt/ui/composables';
import { useQuery, useQueryCache } from '@pinia/colada';
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { admin, type ExerciseInput } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import type { ExerciseType, LevelCode, SeriesType } from '@/shared/api/types';
import PageHeader from '@/shared/ui/PageHeader.vue';

const props = defineProps<{ id: number | null }>();
const router = useRouter();
const toast = useToast();
const cache = useQueryCache();

const { data: detail, status } = useQuery({
  key: () => ['admin', 'series-detail', props.id ?? 0],
  query: () => (props.id ? admin.seriesDetail(props.id) : Promise.resolve(null)),
});

const form = reactive({
  title: '',
  description: '',
  levelCode: 'A1' as LevelCode,
  type: 'DEFAULT' as SeriesType,
});
const drafts = ref<(ExerciseInput & { id?: number; choicesText: string })[]>([]);
const saving = ref(false);

watch(
  detail,
  (value) => {
    if (!value) return;
    form.title = value.title;
    form.description = value.description ?? '';
    form.levelCode = value.level.code;
    form.type = value.type;
    drafts.value = value.exercises.map((e) => ({ ...e, choicesText: e.choices.join(' | ') }));
  },
  { immediate: true },
);

const levelOptions = (['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((code) => ({
  label: code,
  value: code,
}));
const typeOptions = [
  { label: "S'exercer", value: 'DEFAULT' },
  { label: 'Parler', value: 'TALK' },
];
const exerciseTypes: { label: string; value: ExerciseType }[] = [
  { label: 'Choix multiple', value: 'MULTIPLE_CHOICE' },
  { label: 'Vrai ou faux', value: 'TRUE_FALSE' },
  { label: 'Traduction', value: 'TRANSLATION' },
  { label: 'Texte à trous', value: 'FILL_BLANK' },
  { label: 'Remise dans l’ordre', value: 'ORDER' },
  { label: 'Dictée', value: 'DICTATION' },
  { label: 'Prononciation', value: 'TALK' },
];

const toInput = (draft: (typeof drafts.value)[number]): ExerciseInput => ({
  question: draft.question.trim(),
  answer: draft.answer.trim(),
  type: draft.type,
  choices:
    draft.type === 'MULTIPLE_CHOICE'
      ? draft.choicesText
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean)
      : [],
});

const valid = computed(
  () =>
    form.title.trim().length >= 2 &&
    drafts.value.every((d) => d.question.trim() && d.answer.trim()),
);

function addDraft(type: ExerciseType = 'MULTIPLE_CHOICE') {
  drafts.value.push({ question: '', answer: '', type, choices: [], choicesText: '' });
}

async function removeDraft(index: number) {
  const draft = drafts.value[index];
  if (!draft) return;
  if (draft.id) {
    await admin.deleteExercise(draft.id);
    await cache.invalidateQueries({ key: ['admin'] });
  }
  drafts.value.splice(index, 1);
}

async function save() {
  saving.value = true;
  try {
    if (props.id) {
      await admin.updateSeries(props.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        levelCode: form.levelCode,
        type: form.type,
      });
      for (const draft of drafts.value) {
        if (draft.id) await admin.updateExercise(draft.id, toInput(draft));
        else await admin.addExercise(props.id, toInput(draft));
      }
      toast.add({ title: 'Série enregistrée', icon: 'i-lucide-circle-check', color: 'success' });
    } else {
      const created = await admin.createSeries({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        levelCode: form.levelCode,
        type: form.type,
        exercises: drafts.value.map(toInput),
      });
      toast.add({ title: 'Série créée', icon: 'i-lucide-circle-check', color: 'success' });
      await router.replace({ name: 'admin-series', params: { id: created.id } });
    }
    await cache.invalidateQueries({ key: ['admin'] });
    await cache.invalidateQueries({ key: ['catalog'] });
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

async function remove() {
  if (!props.id) return;
  saving.value = true;
  try {
    await admin.deleteSeries(props.id);
    await cache.invalidateQueries({ key: ['admin'] });
    await cache.invalidateQueries({ key: ['catalog'] });
    toast.add({ title: 'Série supprimée', icon: 'i-lucide-trash-2' });
    await router.replace({ name: 'admin' });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <UButton
      :to="{ name: 'admin' }"
      variant="link"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="-ml-2 mb-4"
      >Catalogue</UButton
    >
    <PageHeader
      eyebrow="Administration"
      :title="id ? 'Modifier la série' : 'Nouvelle série'"
      description="Les réponses sont normalisées à l'enregistrement. Pour accepter plusieurs formulations, séparez-les par | : « the bill | the check »."
    />

    <div v-if="id && status === 'pending' && !detail" class="space-y-4">
      <USkeleton class="h-12 rounded-2xl" />
      <USkeleton class="h-64 rounded-2xl" />
    </div>

    <form v-else class="space-y-8" @submit.prevent="save">
      <section class="rounded-2xl border-2 border-default p-5">
        <h2 class="text-lg">La série</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <UFormField label="Titre" name="title" required class="sm:col-span-2">
            <UInput v-model="form.title" size="lg" class="w-full" maxlength="120" />
          </UFormField>
          <UFormField label="Description" name="description" class="sm:col-span-2">
            <UTextarea v-model="form.description" :rows="2" autoresize class="w-full" />
          </UFormField>
          <UFormField label="Niveau" name="level">
            <USelect v-model="form.levelCode" :items="levelOptions" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Type" name="type">
            <USelect v-model="form.type" :items="typeOptions" size="lg" class="w-full" />
          </UFormField>
        </div>
      </section>

      <section class="rounded-2xl border-2 border-default p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg">Exercices ({{ drafts.length }})</h2>
          <UButton
            variant="outline"
            color="neutral"
            icon="i-lucide-plus"
            class="font-bold"
            @click="addDraft(form.type === 'TALK' ? 'TALK' : 'MULTIPLE_CHOICE')"
            >Ajouter</UButton
          >
        </div>
        <p v-if="drafts.length === 0" class="mt-4 text-sm text-muted">
          Aucun exercice pour l’instant. Ajoutez-en avec le bouton ci-dessus.
        </p>
        <ol class="mt-4 space-y-4" role="list">
          <li
            v-for="(draft, index) in drafts"
            :key="draft.id ?? `new-${index}`"
            class="rounded-2xl border-2 border-dashed border-default p-4"
          >
            <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
              <USelect
                v-model="draft.type"
                :items="exerciseTypes"
                size="md"
                class="w-full sm:w-56"
                :aria-label="`Type de l'exercice ${index + 1}`"
              />
              <UButton
                variant="ghost"
                color="error"
                icon="i-lucide-trash-2"
                :aria-label="`Supprimer l'exercice ${index + 1}`"
                @click="removeDraft(index)"
              />
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <UFormField label="Consigne ou question" :name="`q-${index}`" class="sm:col-span-2">
                <UTextarea v-model="draft.question" :rows="2" autoresize class="w-full" />
              </UFormField>
              <UFormField label="Réponse attendue" :name="`a-${index}`">
                <UInput
                  v-model="draft.answer"
                  class="w-full"
                  placeholder="i am a student | i'm a student"
                />
              </UFormField>
              <UFormField
                v-if="draft.type === 'MULTIPLE_CHOICE'"
                label="Choix, séparés par |"
                :name="`c-${index}`"
              >
                <UInput
                  v-model="draft.choicesText"
                  class="w-full"
                  placeholder="Hello | Goodbye | Thank you"
                />
              </UFormField>
            </div>
          </li>
        </ol>
      </section>

      <div class="flex flex-wrap items-center gap-3">
        <UButton
          type="submit"
          size="lg"
          class="btn-pop font-extrabold"
          :loading="saving"
          :disabled="!valid"
          >{{ id ? 'Enregistrer' : 'Créer la série' }}</UButton
        >
        <UButton
          v-if="id"
          variant="soft"
          color="error"
          icon="i-lucide-trash-2"
          class="font-bold"
          :disabled="saving"
          @click="remove"
          >Supprimer la série</UButton
        >
      </div>
    </form>
  </div>
</template>
