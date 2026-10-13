# ADR-002 — Consumo de la API de productos

- **ID:** ADR-002
- **Date:** 2026-10-12
- **Status:** Accepted
- **Authors:** Lilly Puentes

---

## Context

La app Ionic debe hacer CRUD contra la API Express propia (`server/`). Hay que decidir cómo se hacen las peticiones HTTP, de dónde sale la dirección de la API y, sobre todo, cómo se distinguen y traducen los errores para que la interfaz muestre mensajes comprensibles. Si cada pantalla llamara a `fetch` por su cuenta, los errores se manejarían de forma distinta en cada una.

**Known constraints:**
- La API corre en `http://localhost:3000` y la app en `http://localhost:5173` (orígenes distintos → CORS).
- Todo error de la API usa el formato `{ "error": "mensaje", "details": ["..."] }`; el 204 de DELETE no trae cuerpo.
- Regla del framework: los errores de bajo nivel se mapean a errores de dominio en la capa `data` antes de llegar a la interfaz.

---

## Decision

**We decided:** centralizar todas las llamadas en `data/products-api.ts` con `fetch` nativo y una sola función `request()`, leer la dirección base de `API_URL` (`data/config.ts`, variable `VITE_API_URL`) y convertir todo fallo en un `ApiError` que las pantallas traducen con `getErrorMessage()`.

**Justification:**
`fetch` viene en el navegador y en Node, así que no agrega dependencias. Con una única función `request()`:
1. Si `fetch` lanza una excepción, la API no respondió → `ApiError` de red (`status = null`, `isNetworkError = true`).
2. Si la respuesta no es `ok` (400, 404, 500…), se lee el cuerpo `{ error, details }` → `ApiError` con `status` y `details`.
3. Si es 204, devuelve `undefined` (DELETE).

Las funciones `getProducts`, `getProduct`, `createProduct`, `updateProduct` y `deleteProduct` solo arman la ruta, el método y el cuerpo. Las páginas nunca ven un `Response`: reciben datos de dominio (`Product`) o un `ApiError`.

Del lado del servidor, `express.json()` convierte el cuerpo en `req.body`, `cors()` permite el origen de la app, `parseId()` hace que un `:id` no numérico responda 400, el manejador 404 responde a rutas desconocidas y el manejador central (de cuatro parámetros) convierte un JSON malformado en 400 y cualquier excepción en 500, siempre con el mismo formato de error.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| `fetch` + `request()` + `ApiError` — chosen | Sin dependencias; un solo lugar para errores; fácil de probar | Hay que manejar a mano JSON, headers y 204 | — (chosen) |
| Axios | Interceptores, JSON automático, timeouts | Dependencia extra; no visto en el alcance | No aporta lo suficiente para 5 endpoints |
| `fetch` directo en cada página | Rápido de escribir | Errores tratados distinto en cada pantalla; rompe las capas | Viola la separación data / presentation |

---

## Consequences

**Positive:**
- La interfaz distingue «no hay conexión» (`isNetworkError`), «no encontrado» (404) y «datos inválidos» (400 con `details`).
- Cambiar la dirección de la API solo requiere `.env` (`VITE_API_URL`), sin tocar código.
- Las pruebas de la API usan el mismo `fetch` que la app (`startTestServer()`).

**Negative / Trade-offs:**
- Sin reintentos automáticos ni caché: el reintento lo hace la persona con el botón «Reintentar».
- Las respuestas se tipan con `as T`; no hay validación del esquema de respuesta en el cliente.

**Impact on the system:**
- Affected features/screens: lista, detalle y formulario de productos.
- Documents to update: `api/products-endpoints.md` y el README (sección «API error handling»).

---

## References

- Mobile Governance Framework — `03-api-and-data/`.
- MDN: Fetch API. Express 5: manejo de errores.
- Related to: [ADR-001 — Manejo del estado](./ADR-001-estado.md).
