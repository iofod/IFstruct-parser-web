<template>
  <p v-if="canRender()" class="U-text" :hid="hid" :clone="clone" :class="CLASS" :style="STYLE">
    {{ GET('msg') }}
  </p>
</template>