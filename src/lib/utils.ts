import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const colorMap: { [key: string]: string } = {
  pleteado: 'plateado',
  plateada: 'plateado',
  // Agrega aquí otras posibles variaciones que encuentres en el futuro
};

export function normalizeColor(color: string): string {
  const lowerColor = color.toLowerCase();
  return colorMap[lowerColor] || lowerColor;
}
