import type { CartItem } from '@/types'

interface WhatsappOrderOptions {
  phone?: string
  items: CartItem[]
  shipping: number
  total: number
  productUrl: (item: CartItem) => string
}

function money(value: number) {
  return `$${value.toFixed(0)}`
}

function getPublicProductImage(item: CartItem) {
  const image = item.product.image?.trim()
    || item.product.images?.find((url) => url.trim().length > 0)?.trim()
    || ''

  return image.startsWith('http') ? image : ''
}


export function buildWhatsappOrderMessage({
  items,
  shipping,
  total,
  productUrl,
}: WhatsappOrderOptions) {
  const lines = [
    'Hola! Pedido Web:',
    '',
    ...items.map((item) => {
      const product = item.product
      const image = getPublicProductImage(item)
      const details = [
        item.selectedSize ? `Talle: ${item.selectedSize}` : '',
        item.selectedColor?.name ? `Color: ${item.selectedColor.name}` : '',
      ].filter(Boolean)

      return [
        `(Cantidad: ${item.quantity}) ${product.name} - ${money(product.price)}`,
        details.length ? details.join(' - ') : '',
        image ? `Ver foto: ${image}` : `Ver producto: ${productUrl(item)}`,
      ].filter(Boolean).join('\n')
    }),
    '',
    shipping > 0 ? `Envio: ${money(shipping)}` : '',
    `Total: ${money(total)}`,
  ]

  return lines.join('\n\n')
}

export function getWhatsappOrderUrl(options: WhatsappOrderOptions) {
  const phone = (options.phone ?? '').replace(/\D/g, '')
  const message = buildWhatsappOrderMessage(options)

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
