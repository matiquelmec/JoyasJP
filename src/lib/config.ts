import { NavLink } from './types';

export const siteConfig = {
  name: "Joyas JP",
  url: "https://joyasjp.com", // Asumiendo un dominio, se puede cambiar luego
  description: "Alta joyería para la escena urbana. Descubre piezas únicas que definen tu estilo.",
  author: "Joyas JP",
  links: {
    instagram: "https://instagram.com/joyasjp",
    tiktok: "https://tiktok.com/@joyasjp"
  },
};

export const navLinks: NavLink[] = [
  { href: '/shop', label: 'Productos' },
  { href: '/services', label: 'Servicios' },
  { href: '/about', label: 'Nosotros' },
  { href: '/contact', label: 'Contacto' },
];
