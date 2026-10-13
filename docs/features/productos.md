# Feature — Catálogo de productos

- **Owner:** Lilly Puentes
- **Status:** In progress
- **Related stories:** HU-PROD-001 (listar y buscar), HU-PROD-002 (ver detalle), HU-PROD-003 (crear), HU-PROD-004 (editar), HU-PROD-005 (eliminar)

---

## Purpose

Permitir que la persona encargada de una tienda consulte, busque, cree, edite y elimine los productos del catálogo (nombre, precio, categoría y stock) desde una app móvil Ionic, viendo de un vistazo qué productos están agotados o con pocas unidades.

---

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Lista de productos | `/productos` | Ver todos los productos, buscar por nombre y filtrar por categoría |
| Detalle de producto | `/productos/:id` | Ver todos los campos de un producto; ir a editar o eliminarlo |
| Formulario (crear) | `/productos/nuevo` | Registrar un producto nuevo con validación en línea |
| Formulario (editar) | `/productos/:id/editar` | Cambiar los datos de un producto existente (misma pantalla que crear) |

> Especificación de cada pantalla en [`../screens/`](../screens/): `lista-productos.md`, `detalle-producto.md` y `formulario-producto.md`.

---

## State

- **Pattern:** estado local por página con hooks de React (`useState` + `useEffect`); ver [ADR-001](../decisions/ADR-001-estado.md).
- **State object(s):**
  - Lista: `products: Product[]`, `status: 'loading' | 'ready' | 'error'`, `errorMessage`, `search`, `category`.
  - Detalle: `product: Product | null`, `status`, `errorMessage`, `isConfirmingDelete`, `isDeleting`.
  - Formulario: `name`, `price`, `category`, `stock`, `fieldErrors`, `serverError`, `serverDetails`, `isSaving`, `status` (al editar).
- **Key transitions:**
  - Lista: `loading → ready` (con datos, vacío o sin resultados según filtros) · `loading → error → (Reintentar) → loading`.
  - Detalle: `loading → ready` · `loading → error` (404 = «no encontrado») · `ready → confirmando eliminación → eliminado → /productos`.
  - Formulario: `editando → validación local (errores en línea) → guardando → /productos` · `guardando → error del servidor (mensaje + details)`.

---

## Data

- **Use cases:** listar productos, filtrar productos (`filterProducts`), ver producto, crear producto, actualizar producto, eliminar producto, validar producto (`validateProduct`), preparar producto para la vista (`toProductView`).
- **Repositories:** módulo `data/products-api.ts` (`getProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`).
- **Remote sources / endpoints:** API Express propia en `server/` (ver [`../api/products-endpoints.md`](../api/products-endpoints.md)):
  - `GET /api/products?search=&category=`
  - `GET /api/products/:id`
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
- **Local persistence:** N/A. La app no guarda datos localmente; la API los guarda en memoria y se reinician al reiniciar el servidor.

---

## Edge cases & states

- [x] Loading — texto «Cargando…» mientras llega la respuesta.
- [x] Empty — la API devuelve un arreglo vacío: «No hay productos» con botón para crear.
- [x] Sin resultados — hay productos pero la búsqueda/filtro no encuentra ninguno: mensaje y botón «Limpiar filtros».
- [x] Error / retry — red caída o 500: mensaje de `getErrorMessage` y botón «Reintentar».
- [x] No encontrado — `GET /api/products/:id` responde 404: «No encontramos ese producto».
- [x] Validación — datos inválidos: mensaje junto a cada campo (cliente) o `details` del servidor (400).
- [ ] Offline — no hay modo sin conexión; se trata igual que un error de red.
- [ ] Permission denied — N/A (la API no tiene autenticación).

---

## Decisions

- [ADR-001 — Manejo del estado](../decisions/ADR-001-estado.md)
- [ADR-002 — Consumo de la API](../decisions/ADR-002-consumo-api.md)

---

## Tests

- Unit: `validateProduct` (campos vacíos, precio ≤ 0, categoría no permitida, stock decimal), `toProductView` (precio en COP y etiquetas «Agotado» / «Pocas unidades» / «Disponible»), `filterProducts` (texto sin mayúsculas y categoría exacta).
- API (Vitest + `startTestServer()`): POST inválido → 400 con `details`; GET de id inexistente → 404; GET con id no numérico → 400; filtros de la lista; crear, actualizar y eliminar.
- Integration/E2E: prueba manual del flujo crear → ver detalle → editar → eliminar con `npm run server` + `npm run dev`.
