# Screen — Detalle de producto

- **Route:** `/productos/:id`
- **Feature:** [Catálogo de productos](../features/productos.md)
- **Design reference:** N/A (componentes estándar de Ionic)

---

## Purpose

Ver todos los datos de un producto (id, nombre, categoría, precio, stock y su etiqueta) y, desde ahí, editarlo o eliminarlo.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonBackButton` + `IonTitle` | Botón atrás hacia `/productos`; título «Detalle del producto» |
| Body | `IonList` con un `IonItem` por campo | Id, nombre, categoría, precio (`formatCOP`), stock y etiqueta de stock |
| Footer / CTA | `IonButton` «Editar» y `IonButton` «Eliminar» (color `danger`) | «Eliminar» abre la confirmación en pantalla |
| Confirmación | Bloque con texto «¿Eliminar este producto?» + «Confirmar» y «Cancelar» | Se muestra con la variable booleana `isConfirmingDelete` |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | `getProduct(id)` en curso | Texto «Cargando producto…» |
| Loaded | La API respondió 200 | Campos del producto y botones |
| No encontrado | La API respondió 404 | `EmptyState` «No encontramos ese producto» + botón «Volver a la lista» |
| Error | Red caída / 500 | `EmptyState` con el mensaje + botón «Reintentar» |
| Confirmando | Toca «Eliminar» | Texto de confirmación con «Confirmar» y «Cancelar» |
| Eliminando | Toca «Confirmar» | Botones deshabilitados; al terminar vuelve a `/productos` |
| Offline | Sin conexión | Igual que Error |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Tocar «Editar» | Navega a `/productos/:id/editar` | — |
| Tocar «Eliminar» | Muestra la confirmación en pantalla | — |
| Tocar «Confirmar» | Elimina y regresa a la lista | `deleteProduct` |
| Tocar «Cancelar» | Oculta la confirmación | — |
| Tocar «Reintentar» | Vuelve a pedir el producto | `getProduct` |

---

## Accessibility

- [x] All interactive elements have accessible labels.
- [x] Touch targets ≥ 44×44 pt / 48×48 dp.
- [x] Text scales with OS font-size setting.
- [x] Contrast meets WCAG AA.
