<template>
  <transition name="notification">
    <div v-if="visible" class="notification" :class="type">
      <div class="notification-content">
        <Icon :icon="type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'" />
        <span>{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    message: String,
    type: {
      type: String,
      default: 'info'
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      visible: false
    }
  },
  mounted() {
    this.visible = true
    setTimeout(() => {
      this.visible = false
    }, this.duration)
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.notification.success {
  background-color: #57b049;
  color: white;
}

.notification.error {
  background-color: #f87171;
  color: white;
}

.notification.info {
  background-color: #5475f6;
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.notification-enter-to,
.notification-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
</style>