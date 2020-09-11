<template>
  <div v-if="canRender()" class="wrap" :hid="hid" :clone="clone">
    <slot></slot>
  </div>
</template>
<script>
export default {
  mounted() {
    let el = document.querySelector('[hid="' + this.hid + '"]')
    // 这里需要构造 e
    this.$emit('ready', {
      target: el,
      currentTarget: el
    })
  }
}
</script>
