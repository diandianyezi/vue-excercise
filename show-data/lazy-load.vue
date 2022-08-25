
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
const getList = () => {
  // code as before
}
const container = ref<HTMLElement>() // container element
const blank = ref<HTMLElement>() // blank element
const list = ref<any>([])
const page = ref(1)
const limit = 200
const maxPage = computed(() => Math.ceil(list.value.length / limit))
// List of real presentations
const showList = computed(() => list.value.slice(0, page.value * limit))
const handleScroll = () => {
  if (page.value > maxPage.value) return
  const clientHeight = container.value?.clientHeight
  const blankTop = blank.value?.getBoundingClientRect().top
  if (clientHeight === blankTop) {
    // When the blank node appears in the viewport, the current page number is incremented by 1
    page.value++
  }
}
onMounted(async () => {
  const res = await getList()
  list.value = res
})
</script>

<template>
  <div id="container" @scroll="handleScroll" ref="container">
    <div class="sunshine" v-for="(item) in showList" :key="item.tid">
      <img :src="item.src" />
      <span>{{ item.text }}</span>
    </div>
    <div ref="blank"></div>
  </div>
</template>