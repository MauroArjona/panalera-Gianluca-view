import type { Product, User } from '@/types'

export const MOCK_PRODUCTS: Product[] = []
export const MOCK_USERS: User[] = []

export const MOCK_HERO_SLIDES = [
  {
    id: 'panales',
    title: 'Todo para el cambio diario',
    subtitle: 'Pañales y cuidado',
    description: 'Productos prácticos para acompañar cada etapa del bebé.',
    image: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=900&q=80',
    ctaLabel: 'Ver productos',
    ctaLink: '/shop',
  },
  {
    id: 'higiene',
    title: 'Higiene y bienestar',
    subtitle: 'Cuidado diario',
    description: 'Elegí artículos de higiene, limpieza y cuidado para tu familia.',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=900&q=80',
    ctaLabel: 'Comprar ahora',
    ctaLink: '/shop?category=Higiene',
  },
]
