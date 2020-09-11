<template>
  <section v-if="canRender()" class="U-container" :hid="hid" :clone="clone" :class="CLASS" :style="STYLE">
    <slot></slot>
  </section>
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
