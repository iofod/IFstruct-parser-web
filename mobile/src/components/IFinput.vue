<template>
  <input v-if="canRender()"
    class="U-input"
    :hid="hid"
    :clone="clone"
    :class="CLASS"
    :style="STYLE"
    :type="GET('type') || 'text'"
    :placeholder="GET('placeholder')"
    :disabled="!!GET('disabled')"
    :readonly="!!GET('readonly')"
    :maxlength="GET('maxlength')"
    :value="GET('value')"
    :autofocus="!!GET('autofocus')"
    :autocomplete="!!GET('autocomplete')"
    @input="input"
    @change="change"
  />
</template>
<script>
export default {
  methods: {
    input(e) {
      this.UPDATE("value", e.target.value)

      this.$emit("input", e)
    },
    change(e) {
      this.UPDATE("value", e.target.value)
    }
  },
};
</script>
