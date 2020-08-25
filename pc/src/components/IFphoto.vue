<template>
  <div v-if="canRender()" class="U-photo" :hid="hid" :clone="clone" :class="CLASS" :style="STYLE">
    <img :src="GET('url')" :alt="GET('alt')" />
  </div>
</template>