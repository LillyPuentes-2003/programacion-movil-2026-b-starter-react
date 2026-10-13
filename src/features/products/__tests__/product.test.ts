import { describe, expect, it } from 'vitest';
import seedProducts from '../../../../server/data/products.json';
import {
  CATEGORIES,
  filterProducts,
  formatCOP,
  LOW_STOCK_THRESHOLD,
  toProductView,
  validateProduct,
  type Product,
  type ProductInput,
} from '../domain/product';

/**
 * Pruebas unitarias de EJEMPLO (ya vienen dadas) para que `npm test` corra desde el inicio.
 * Muestran el estilo esperado: describe / it / expect, sin red ni pantallas.
 */
describe('datos semilla de la API (ejemplo)', () => {
  it('trae 8 productos con ids 1 a 8', () => {
    expect(seedProducts).toHaveLength(8);
    expect(seedProducts.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('usa solo categorías permitidas y stock entero no negativo', () => {
    for (const item of seedProducts) {
      expect(CATEGORIES).toContain(item.category);
      expect(Number.isInteger(item.stock)).toBe(true);
      expect(item.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it('incluye productos agotados y con pocas unidades para probar las etiquetas', () => {
    expect(seedProducts.some((item) => item.stock === 0)).toBe(true);
    expect(seedProducts.some((item) => item.stock > 0 && item.stock < LOW_STOCK_THRESHOLD)).toBe(true);
  });
});

describe('formatCOP (ejemplo)', () => {
  it('separa los miles con punto y antepone el signo de pesos', () => {
    expect(formatCOP(1250000)).toBe('$ 1.250.000');
    expect(formatCOP(8500)).toBe('$ 8.500');
    expect(formatCOP(950)).toBe('$ 950');
  });
});

/**
 * Pruebas UNITARIAS propias (Parte 5) de las funciones del dominio.
 */
const VALID_INPUT: ProductInput = { name: 'Café molido 500 g', price: 15900, category: 'Bebidas', stock: 10 };

const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: 'Agua mineral 600 ml', price: 1800, category: 'Bebidas', stock: 120 },
  { id: 2, name: 'Jugo de naranja 1 L', price: 5200, category: 'Bebidas', stock: 35 },
  { id: 4, name: 'Papas fritas 150 g', price: 3900, category: 'Snacks', stock: 60 },
  { id: 6, name: 'Detergente líquido 1 L', price: 12500, category: 'Aseo', stock: 18 },
];

describe('validateProduct', () => {
  it('acepta un producto válido sin errores', () => {
    expect(validateProduct(VALID_INPUT)).toEqual({ isValid: true, errors: {} });
  });

  it('rechaza un nombre vacío, un precio menor o igual que 0 y una categoría no permitida', () => {
    const result = validateProduct({ name: '   ', price: 0, category: 'Ropa', stock: 3 });

    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual(['category', 'name', 'price']);
  });

  it('rechaza un nombre de más de 60 caracteres y un stock decimal o negativo', () => {
    const longName = validateProduct({ ...VALID_INPUT, name: 'x'.repeat(61) });
    expect(longName.errors.name).toBeDefined();

    expect(validateProduct({ ...VALID_INPUT, stock: 1.5 }).errors.stock).toBeDefined();
    expect(validateProduct({ ...VALID_INPUT, stock: -1 }).errors.stock).toBeDefined();
    expect(validateProduct({ ...VALID_INPUT, stock: 0 }).isValid).toBe(true);
  });
});

describe('toProductView', () => {
  it('formatea el precio en pesos y marca «Agotado» y «Pocas unidades»', () => {
    const outOfStock = toProductView({ id: 5, name: ' Galletas ', price: 1250000, category: 'Snacks', stock: 0 });
    expect(outOfStock).toMatchObject({
      name: 'Galletas',
      priceLabel: '$ 1.250.000',
      stockLabel: 'Agotado',
      isOutOfStock: true,
      isLowStock: false,
    });

    const lowStock = toProductView({ ...SAMPLE_PRODUCTS[0], stock: LOW_STOCK_THRESHOLD - 1 });
    expect(lowStock).toMatchObject({ stockLabel: 'Pocas unidades', isLowStock: true, isOutOfStock: false });
  });

  it('marca «Disponible» desde el umbral de pocas unidades', () => {
    const available = toProductView({ ...SAMPLE_PRODUCTS[0], stock: LOW_STOCK_THRESHOLD });
    expect(available).toMatchObject({ priceLabel: '$ 1.800', stockLabel: 'Disponible', isLowStock: false });
  });
});

describe('filterProducts', () => {
  it('filtra por texto sin distinguir mayúsculas y por categoría exacta', () => {
    expect(filterProducts(SAMPLE_PRODUCTS, { search: 'JUGO', category: '' }).map((item) => item.id)).toEqual([2]);
    expect(filterProducts(SAMPLE_PRODUCTS, { search: '', category: 'Bebidas' }).map((item) => item.id)).toEqual([1, 2]);
    expect(filterProducts(SAMPLE_PRODUCTS, { search: '1 l', category: 'Aseo' }).map((item) => item.id)).toEqual([6]);
  });

  it('no filtra con texto vacío y no modifica el arreglo original', () => {
    const result = filterProducts(SAMPLE_PRODUCTS, { search: '   ', category: '' });

    expect(result).toEqual(SAMPLE_PRODUCTS);
    expect(result).not.toBe(SAMPLE_PRODUCTS);
  });
});
