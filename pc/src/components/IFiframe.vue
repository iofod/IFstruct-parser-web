<template>
  <div v-if="canRender()" class="U-iframe" :hid="hid" :clone="clone" :class="CLASS" :style="STYLE">
    <iframe :src="GET('src')" frameborder="0"></iframe>
  </div>
</template>