# Screen — Formulario de producto (crear / editar)

- **Route:** `/productos/nuevo` (crear) y `/productos/:id/editar` (editar)
- **Feature:** [Catálogo de productos](../features/productos.md)
- **Design reference:** N/A (componentes estándar de Ionic)

---

## Purpose

Registrar un producto nuevo o modificar uno existente con una sola pantalla. Los datos se validan antes de enviarlos (mismas reglas que la API) y, si el servidor los rechaza, se muestran sus mensajes.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonBackButton` + `IonTitle` | «Nuevo producto» o «Editar producto» según la ruta |
| Body | 3 `IonInput` (nombre, precio, stock) + 4 `IonButton` de categoría | Debajo de cada campo, el mensaje de error en rojo (`IonText color="danger"`) |
| Error del servidor | `IonText` + lista de `details` | Solo si la API responde 400 u otro error |
| Footer / CTA | `IonButton` «Guardar» | Deshabilitado mientras guarda |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Modo editar: `getProduct(id)` en curso | Texto «Cargando producto…» |
| Loaded | Formulario listo (vacío al crear, precargado al editar) | Campos editables |
| Error de carga | Modo editar: 404 / red | `EmptyState` con el mensaje + «Volver a la lista» |
| Inválido | `validateProduct` devuelve errores al tocar «Guardar» | Mensaje junto a cada campo; no se llama a la API |
| Guardando | `createProduct` / `updateProduct` en curso | Botón «Guardando…» deshabilitado |
| Rechazado | `ApiError` 400 | Mensaje del servidor y lista de `details` |
| Offline | Sin conexión | Mensaje de error de red; los datos escritos se conservan |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Escribir en un campo | Se actualiza el estado; el error de ese campo se recalcula si ya se intentó guardar | `validateProduct` |
| Tocar una categoría | Queda seleccionada (botón relleno) | — |
| Tocar «Guardar» (crear) | Valida; si es válido, crea y vuelve a `/productos` | `createProduct` |
| Tocar «Guardar» (editar) | Valida; si es válido, actualiza y vuelve a `/productos` | `updateProduct` |
| Tocar atrás | Vuelve sin guardar | — |

---

## Accessibility

- [x] All interactive elements have accessible labels (`label` en cada `IonInput`).
- [x] Touch targets ≥ 44×44 pt / 48×48 dp.
- [x] Text scales with OS font-size setting.
- [x] Contrast meets WCAG AA (los errores se escriben en texto, no solo con color).
