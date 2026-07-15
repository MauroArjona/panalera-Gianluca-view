<template>
  <div>
    <section class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Sobre <span class="text-brand">Panalera Gianluca</span>
          </h1>
          <p class="text-gray-600 leading-relaxed mb-4">
            Somos una tienda familiar enfocada en productos para bebes, higiene, cuidado diario y accesorios
            practicos para acompañar a cada familia.
          </p>
          <p class="text-gray-600 leading-relaxed">
            Nuestra prioridad es ofrecer productos utiles, precios claros y una experiencia de compra simple,
            desde que elegis el producto hasta que coordinamos tu pedido.
          </p>
        </div>
        <div class="flex-1">
          <img
            src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop"
            alt="Panalera Gianluca"
            class="rounded-xl shadow-lg w-full"
          />
        </div>
      </div>
    </section>

    <section class="py-14 bg-brand text-white">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div
          v-for="stat in [
            { value: '100%', label: 'Atencion cercana' },
            { value: '+500', label: 'Productos vendidos' },
            { value: '24 hs', label: 'Respuesta rapida' },
            { value: 'Local', label: 'Compra de confianza' },
          ]"
          :key="stat.label"
        >
          <p class="text-4xl font-bold">{{ stat.value }}</p>
          <p class="text-brand-200 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
