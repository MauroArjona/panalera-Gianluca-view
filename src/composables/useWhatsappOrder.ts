import type { CartItem } from '@/stores/cart'

interface WhatsappOrderOptions {
  phone: string
  items: CartItem[]
  shipping: number
  total: number
  productUrl: (item: CartItem) => string
}

function money(value: number) {
  return `$${value.toFixed(2)}`
}

export function buildWhatsappOrderMessage({
  items,
  shipping,
  total,
  productUrl,
}: WhatsappOrderOptions) {
  const lines = [
    '🛒 Nuevo pedido',
    '',
    ...items.map((item) => {
      const product = item.product

      return [
        product.name,
        `• Cantidad: ${item.quantity}`,
        item.selectedSize ? `• Talle: ${item.selectedSize}` : '',
        item.selectedColor?.name ? `• Color: ${item.selectedColor.name}` : '',
        `• Precio: ${money(product.price)}`,
        product.image ? `• Imagen: ${product.image}` : '',
        `• Producto: ${productUrl(item)}`,
      ].filter(Boolean).join('\n')
    }),
    '',
    '─────────────────',
    `🚚 Envío: ${shipping === 0 ? 'GRATIS' : money(shipping)}`,
    `💰 Total: ${money(total)}`,
  ]

  return lines.join('\n\n')
}

export function getWhatsappOrderUrl(options: WhatsappOrderOptions) {
  const phone = options.phone.replace(/\D/g, '')
  const message = buildWhatsappOrderMessage(options)

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
