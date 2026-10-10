<script setup lang="ts">
import InstallCard from '@/pwa/InstallCard.vue';
import PageHeader from '@/shared/ui/PageHeader.vue';
import DangerZone from './DangerZone.vue';
import ExportCard from './ExportCard.vue';
import GoalCard from './GoalCard.vue';
import NotificationSettings from './NotificationSettings.vue';
import PasswordForm from './PasswordForm.vue';
import ProfileForm from './ProfileForm.vue';
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader
      eyebrow="Mon compte"
      title="Profil et préférences"
      description="Votre pseudo et votre avatar sont visibles dans le classement de la semaine."
    />
    <div class="space-y-6">
      <ProfileForm />
      <GoalCard />
      <InstallCard />
      <NotificationSettings />
      <PasswordForm />
      <ExportCard />
      <DangerZone />
    </div>
  </div>
</template>
