<template>
  <div v-if="canRender()" class="U-mirror" :hid="hid" :clone="clone" :class="CLASS" :style="STYLE">
    <slot></slot>
  </div>
</template>