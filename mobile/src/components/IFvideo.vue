<template>
<video v-if="canRender()" class="U-video" :src="GET('url')" :hid="hid" :clone="clone" :class="CLASS" :style="STYLE" :controls="GET('controls')" :autoplay="GET('autoplay')" :loop="GET('loop')"></video>
</template>
