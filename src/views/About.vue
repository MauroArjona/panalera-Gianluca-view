<template>
  <div>
    <!-- Hero -->
    <section class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Sobre <span class="text-brand">Calzados CR</span>
          </h1>
          <p class="text-gray-600 leading-relaxed mb-4">
            Somos un equipo apasionado por la moda, comprometido en ofrecerte la mejor selección
            de ropa, calzado y accesorios. Fundados en 2020, Calzados CR se convirtió en el destino
            ideal para quienes buscan productos de calidad a precios justos.
          </p>
          <p class="text-gray-600 leading-relaxed">
            Nuestra misión es simple: hacer que el buen estilo sea accesible para todos, con una
            experiencia de compra sin complicaciones, desde que navegás hasta que recibís tu pedido.
          </p>
        </div>
        <div class="flex-1">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
            alt="Sobre Calzados CR"
            class="rounded-xl shadow-lg w-full"
          />
        </div>
      </div>
    </section>

    <!-- Estadísticas -->
    <section class="py-14 bg-brand text-white">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div v-for="stat in [
          { value: '20K+',  label: 'Clientes satisfechos' },
          { value: '1000+', label: 'Productos' },
          { value: '98%',   label: 'Índice de satisfacción' },
          { value: '+10',   label: 'Años en el mercado' },          
        ]" :key="stat.label">
          <p class="text-4xl font-bold">{{ stat.value }}</p>
          <p class="text-brand-200 mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Equipo -->
    <section class="max-w-7xl mx-auto px-4 py-14">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-800">Nuestro equipo</h2>
        <p class="text-gray-500 mt-2">Las personas detrás de tu tienda favorita.</p>
      </div>
      <div class="flex justify-center gap-8">
        <div 
          v-for="member in [
            { name: 'David M', role: 'Fundador', avatar: 'https://ui-avatars.com/api/?name=David+M&background=28a745&color=fff&size=120' },
            { name: 'Miriam M', role: 'Atención al Cliente', avatar: 'https://ui-avatars.com/api/?name=Miriam+M&background=007bff&color=fff&size=120' },
            { name: 'Aide L', role: 'Atención al Cliente', avatar: 'https://ui-avatars.com/api/?name=Aide+L&background=6f42c1&color=fff&size=120' }
          ]" 
          :key="member.name"
          class="text-center"
        >
          <img :src="member.avatar" :alt="member.name" class="w-24 h-24 rounded-full mx-auto mb-3 shadow" />
          <p class="font-semibold text-gray-800">{{ member.name }}</p>
          <p class="text-sm text-gray-500">{{ member.role }}</p>
        </div>
      </div>
    </section>
  </div>
</template>