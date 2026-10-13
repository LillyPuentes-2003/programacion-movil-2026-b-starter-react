# Screen — Lista de productos

- **Route:** `/productos`
- **Feature:** [Catálogo de productos](../features/productos.md)
- **Design reference:** N/A (componentes estándar de Ionic)

---

## Purpose

Ver el catálogo completo, buscar un producto por su nombre, filtrar por categoría y entrar al detalle o al formulario de creación.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonToolbar` + `IonTitle` | Título «Productos» y botón «Nuevo» que lleva a `/productos/nuevo` |
| Filtros | `IonInput` (buscador) + 5 `IonButton` | «Todas», «Bebidas», «Snacks», «Aseo», «Hogar»; el botón activo se ve relleno (`fill="solid"`) |
| Body | `IonList` con un `ProductCard` por producto | Nombre, categoría, precio en COP y etiqueta de stock con color de aviso |
| Estados | `EmptyState` | Vacío, sin resultados y error con botón |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | `getProducts()` en curso | Texto «Cargando productos…» |
| Loaded | La API respondió con productos y los filtros encuentran alguno | Lista de `ProductCard` |
| Empty | La API respondió un arreglo vacío | `EmptyState` «No hay productos» + botón «Crear producto» |
| Sin resultados | Hay productos, pero `filterProducts` devuelve vacío | `EmptyState` «Sin resultados» + botón «Limpiar filtros» |
| Error | `ApiError` de red o 500 | `EmptyState` «No se pudo cargar» con el mensaje y botón «Reintentar» |
| Offline | Sin conexión | Igual que Error (no hay caché) |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Escribir en el buscador | La lista se filtra por nombre (sin distinguir mayúsculas) | `filterProducts` |
| Tocar un botón de categoría | La lista muestra solo esa categoría («Todas» quita el filtro) | `filterProducts` |
| Tocar un producto | Navega a `/productos/:id` | — |
| Tocar «Nuevo» | Navega a `/productos/nuevo` | — |
| Tocar «Reintentar» | Vuelve a pedir la lista | `getProducts` |
| Volver desde otra pantalla | La lista se recarga (`useIonViewWillEnter`) | `getProducts` |

---

## Accessibility

- [x] All interactive elements have accessible labels (texto visible en botones y `label` en el buscador).
- [x] Touch targets ≥ 44×44 pt / 48×48 dp (tamaño por defecto de `IonButton` e `IonItem`).
- [x] Text scales with OS font-size setting.
- [x] Contrast meets WCAG AA (colores del tema de Ionic; la etiqueta de stock usa texto, no solo color).
