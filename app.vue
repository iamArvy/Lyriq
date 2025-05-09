<template>
  <div class="w-full flex flex-col h-screen min-h-screen">
    <header class="bg-primary sticky">
      <AppHeader class="container" />
    </header>
    <main class="flex-1">
      <NuxtPage />
    </main>
    <footer class="bg-primary">
      <AppFooter class="container" />
    </footer>
  </div>
</template>
