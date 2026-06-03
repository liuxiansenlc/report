<template>
  <div class="dashboard-body">
    <LeftPanel />
    <CenterMap />
    <RightPanel />
  </div>
</template>

<script setup>
import LeftPanel from '../components/LeftPanel.vue'
import CenterMap from '../components/CenterMap.vue'
import RightPanel from '../components/RightPanel.vue'
</script>

<style scoped>
.dashboard-body {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  gap: 20px;
  min-width: 0;
  min-height: 0;
}
</style>
