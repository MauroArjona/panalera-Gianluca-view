<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from '@/composables/useToast'

const { show } = useToast()

const form = reactive({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)

async function submit() {
  submitting.value = true
  await new Promise((r) => setTimeout(r, 800)) // mock delay

  const mensaje = encodeURIComponent(
    `Mensaje: ${form.message}\n\nEnviado desde el formulario de contacto de la web.`,
  )

  const numero = '5492975381382' // número destino
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')

  show('¡Mensaje enviado por WhatsApp!', 'success')
  Object.assign(form, {message: '' })
  submitting.value = false
}

</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-14">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-800">Contactanos</h1>
      <p class="text-gray-500 mt-2 max-w-md mx-auto">
        ¿Tenés preguntas, sugerencias o simplemente querés saludarnos? Con gusto te escuchamos.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-14">

      <!-- Info de contacto -->
      <div>
        <div class="space-y-6">
          <div
            v-for="item in [
              { icon: 'fa-map-marker-alt', title: 'Dirección', text: 'Belgrano 855 | Monseñor Enrique Angelelli 2860, Comodoro Rivadavia' },
              { icon: 'fa-phone',          title: 'Teléfono',  text: '+54 9 297 538-1382' },
              { icon: 'fa-envelope',       title: 'Email',     text: 'Elvissscabj1223@gmail.com' },
              { icon: 'fa-clock',          title: 'Horario',   text:  'Lun–Vie 9hs – 21hs -- Sáb 10hs – 21hs , Domingos online (solo entregas)'  },
            ]" :key="item.title"
            class="flex gap-4 items-start"
          >
            <div class="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center shrink-0">
              <i :class="['fa', item.icon, 'text-brand']" />
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ item.title }}</p>
              <p class="text-gray-500 text-sm">{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de contacto -->
      <div class="bg-white rounded-xl shadow-sm p-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input v-model="form.name" class="input" placeholder="Tu nombre" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="form.email" type="email" class="input" placeholder="vos@ejemplo.com" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
            <input v-model="form.subject" class="input" placeholder="¿De qué se trata?" />
          </div> -->
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
            <textarea
              v-model="form.message"
              rows="5"
              class="input resize-none"
              placeholder="Tu mensaje..."
            />
          </div>
        </div>
        <button
          :disabled="submitting || !form.message"
          class="btn-primary w-full mt-5 py-3 text-base"
          @click="submit"
        >
          <i :class="['fa mr-2', submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane']" />
          {{ submitting ? 'Enviando...' : 'Enviar mensaje' }}
        </button>
      </div>
    </div>
  </div>
</template>
