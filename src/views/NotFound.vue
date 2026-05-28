<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
    <p class="text-9xl font-black text-gray-200 select-none">404</p>
    <h1 class="text-2xl font-bold text-gray-800 -mt-4 mb-3">Página no encontrada</h1>
    <p class="text-gray-500 max-w-sm mb-8">
      La página que buscás no existe o fue movida.
    </p>
    <div class="flex gap-3">
      <router-link to="/" class="btn-primary">
        <i class="fa fa-home mr-2" /> Inicio
      </router-link>
      <router-link to="/shop" class="btn-outline">
        Ver productos
      </router-link>
    </div>
  </div>
</template>