# Endpoint Integration — Productos (`/api/products`)

- **Feature:** [Catálogo de productos](../features/productos.md)
- **Base URL:** `API_URL` (`VITE_API_URL`, por defecto `http://localhost:3000`)
- **Auth required:** No
- **Cliente en la app:** `src/features/products/data/products-api.ts`

Este documento cubre los **5 endpoints** del recurso. Todos los errores usan el mismo formato:

```json
{ "error": "mensaje", "details": ["un mensaje por cada problema"] }
```

---

## 1. `GET /api/products` — listar (con filtros)

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `search` | query | string | No | El nombre **contiene** el texto, sin distinguir mayúsculas |
| `category` | query | string | No | Categoría **exacta** (`Bebidas`, `Snacks`, `Aseo`, `Hogar`) |

**Body:** ninguno.

### Response

**Success (200):** arreglo (puede estar vacío).
```json
[{ "id": 1, "name": "Agua mineral 600 ml", "price": 1800, "category": "Bebidas", "stock": 120 }]
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| — | No define errores propios | — |
| Red / 500 | API caída o fallo inesperado | Estado de error con «Reintentar» |

**Cliente:** `getProducts(query?)`. La lista pide todos y filtra en memoria con `filterProducts` para responder al instante.

---

## 2. `GET /api/products/:id` — detalle

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos; si no, 400 |

### Response

**Success (200):** el producto `{ id, name, price, category, stock }`.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | `id` no numérico (`parseId` devuelve `null`) | Mensaje del servidor |
| 404 | No existe un producto con ese id | «No encontramos ese producto» + volver a la lista |
| Red / 500 | Fallo de conexión o del servidor | Mensaje + «Reintentar» |

**Cliente:** `getProduct(id)` (detalle y precarga del formulario de edición).

---

## 3. `POST /api/products` — crear

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `name` | body | string | Yes | No vacío (sin contar espacios), máximo 60 caracteres |
| `price` | body | number | Yes | Mayor que 0 |
| `category` | body | string | Yes | Una de `Bebidas`, `Snacks`, `Aseo`, `Hogar` |
| `stock` | body | integer | Yes | Entero ≥ 0 |

**Body:**
```json
{ "name": "Café molido 500 g", "price": 15900, "category": "Bebidas", "stock": 10 }
```

### Response

**Success (201):** el producto creado con `id` incremental (máximo id actual + 1).
```json
{ "id": 9, "name": "Café molido 500 g", "price": 15900, "category": "Bebidas", "stock": 10 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Datos inválidos: `details` trae un mensaje por campo | Muestra `error` y la lista de `details` bajo el formulario |
| 400 | Cuerpo con JSON malformado (manejador central) | Mensaje del servidor |

**Cliente:** `createProduct(input)`. Antes de llamar, el formulario valida con `validateProduct` (mismas reglas).

---

## 4. `PUT /api/products/:id` — actualizar

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos |
| `name`, `price`, `category`, `stock` | body | — | Yes | Mismas reglas que POST (reemplazo completo) |

### Response

**Success (200):** el producto actualizado (el `id` no cambia).

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | `id` no numérico o datos inválidos (`details`) | Mensaje + `details` en el formulario |
| 404 | No existe el producto | «No encontramos ese producto» |

**Cliente:** `updateProduct(id, input)`.

---

## 5. `DELETE /api/products/:id` — eliminar

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos |

### Response

**Success (204):** sin cuerpo (`res.status(204).end()`). `request()` devuelve `undefined`.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | `id` no numérico | Mensaje en el detalle |
| 404 | No existe el producto | Mensaje en el detalle |

**Cliente:** `deleteProduct(id)`; después de eliminar, la app vuelve a `/productos`.

---

## Rutas desconocidas y errores inesperados

| Status | Cuándo | Respuesta |
|--------|--------|-----------|
| 404 | Cualquier ruta no declarada (p. ej. `GET /api/no-existe`) | `{ "error": "Ruta no encontrada", "details": ["GET /api/no-existe"] }` |
| 500 | Una ruta lanza una excepción | `{ "error": "Error interno del servidor", "details": [] }` |

---

## DTO → domain mapping

| DTO field | Domain field | Transform |
|-----------|--------------|-----------|
| `id`, `name`, `category`, `stock` | `Product` | Sin cambios |
| `price` | `ProductView.priceLabel` | `formatCOP(price)` → `"$ 1.800"` |
| `stock` | `ProductView.stockLabel` | 0 → «Agotado» · < 5 → «Pocas unidades» · otro → «Disponible» |

---

## Caching / offline

- **Strategy:** online-only.
- **Cached entity:** N/A (ver [`product-entity.md`](./product-entity.md)).
- **TTL / invalidation:** N/A; la lista se vuelve a pedir cada vez que se entra a la pantalla.
