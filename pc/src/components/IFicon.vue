<template>
  <div v-if="canRender()" class="U-icon" :hid="hid" :clone="clone" :class="CLASS" :style="STYLE">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="VB"
    >
      <path v-for="(p, i) in d" :key="i" :d="p" />
    </svg>
  </div>
</template>

<script>
export default {
  computed: {
    VB() {
      return this.GET('viewBox') || '0 0 48 48'
    },
    d() {
      return this.GET('d').split('|')
    }
  }
}
</script>
