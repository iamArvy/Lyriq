<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Search } from "lucide-vue-next";
const query = ref("");
const router = useRouter();
// const search = () => ;
</script>
<template>
  <div class="relative w-full max-w-sm items-center bg-primary-foreground">
    <Input
      id="search"
      type="text"
      placeholder="Search..."
      class="pl-10"
      v-model="query"
      @keydown.enter="router.push({ name: 'search', query: { q: query } })"
    />
    <span
      class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
    >
      <Search class="size-6 text-muted-foreground" />
    </span>
  </div>
</template>
