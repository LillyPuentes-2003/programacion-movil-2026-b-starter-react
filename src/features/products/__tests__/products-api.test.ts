// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startTestServer } from './test-server';

/**
 * Prueba de la API de EJEMPLO (ya viene dada). Patrón que se espera en las pruebas de la API:
 *  1. `startTestServer()` levanta la API en un puerto libre antes de cada prueba.
 *  2. `fetch` (el de Node, sin dependencias extra) llama a la API como lo haría la app.
 *  3. Se comprueba el código de estado y el cuerpo.
 *  4. `close()` cierra el servidor al terminar.
 */
let baseUrl = '';
let close: () => Promise<void>;

beforeEach(async () => {
  ({ baseUrl, close } = await startTestServer());
});

afterEach(async () => {
  await close();
});

const VALID_PRODUCT = { name: 'Café molido 500 g', price: 15900, category: 'Bebidas', stock: 10 };

/** Envía un cuerpo JSON con el método indicado. */
function sendJson(path: string, method: 'POST' | 'PUT', body: unknown) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('API de productos (ejemplo)', () => {
  it('arranca y responde 404 con el formato de error en una ruta desconocida', async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: expect.any(String), details: expect.any(Array) });
  });
});

describe('GET /api/products', () => {
  it('responde 200 con los 8 productos semilla', async () => {
    const response = await fetch(`${baseUrl}/api/products`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(8);
  });

  it('filtra por search (sin distinguir mayúsculas) y por category exacta', async () => {
    const bySearch = await (await fetch(`${baseUrl}/api/products?search=JUGO`)).json();
    expect(bySearch.map((item: { id: number }) => item.id)).toEqual([2]);

    const byCategory = await (await fetch(`${baseUrl}/api/products?category=Aseo`)).json();
    expect(byCategory.map((item: { id: number }) => item.id)).toEqual([6, 7]);

    const both = await (await fetch(`${baseUrl}/api/products?search=a&category=Snacks`)).json();
    expect(both.every((item: { category: string }) => item.category === 'Snacks')).toBe(true);
  });
});

describe('GET /api/products/:id', () => {
  it('responde 200 con el producto cuando existe', async () => {
    const response = await fetch(`${baseUrl}/api/products/1`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ id: 1, name: 'Agua mineral 600 ml' });
  });

  it('responde 404 cuando el producto no existe', async () => {
    const response = await fetch(`${baseUrl}/api/products/999`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Producto no encontrado', details: [expect.any(String)] });
  });

  it('responde 400 cuando el id no es numérico', async () => {
    const response = await fetch(`${baseUrl}/api/products/abc`);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: expect.any(String), details: expect.any(Array) });
  });
});

describe('POST /api/products', () => {
  it('responde 400 con { error, details } cuando los datos no validan', async () => {
    const response = await sendJson('/api/products', 'POST', {
      name: '   ',
      price: 0,
      category: 'Ropa',
      stock: 1.5,
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    // Un mensaje por cada problema: name, price, category y stock.
    expect(body.details).toHaveLength(4);
  });

  it('responde 201 con el producto creado y un id incremental', async () => {
    const response = await sendJson('/api/products', 'POST', VALID_PRODUCT);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ id: 9, ...VALID_PRODUCT });
  });

  it('responde 400 cuando el cuerpo no es un JSON válido (manejador central de errores)', async () => {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ esto no es json',
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'El cuerpo no es un JSON válido', details: [] });
  });
});

describe('PUT /api/products/:id', () => {
  it('responde 200 con el producto actualizado', async () => {
    const response = await sendJson('/api/products/3', 'PUT', { ...VALID_PRODUCT, stock: 0 });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 3, ...VALID_PRODUCT, stock: 0 });
  });

  it('responde 404 si no existe y 400 si los datos no validan', async () => {
    const notFound = await sendJson('/api/products/999', 'PUT', VALID_PRODUCT);
    expect(notFound.status).toBe(404);

    const invalid = await sendJson('/api/products/1', 'PUT', { ...VALID_PRODUCT, price: -5 });
    expect(invalid.status).toBe(400);
    expect((await invalid.json()).details).toEqual(['price debe ser un número mayor que 0']);
  });
});

describe('DELETE /api/products/:id', () => {
  it('responde 204 sin cuerpo y luego el producto ya no existe', async () => {
    const response = await fetch(`${baseUrl}/api/products/1`, { method: 'DELETE' });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');

    const after = await fetch(`${baseUrl}/api/products/1`);
    expect(after.status).toBe(404);
  });

  it('responde 404 cuando el producto no existe', async () => {
    const response = await fetch(`${baseUrl}/api/products/999`, { method: 'DELETE' });
    expect(response.status).toBe(404);
  });
});
