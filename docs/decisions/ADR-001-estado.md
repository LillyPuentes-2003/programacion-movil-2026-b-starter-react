# ADR-001 — Manejo del estado de las pantallas

- **ID:** ADR-001
- **Date:** 2026-10-12
- **Status:** Accepted
- **Authors:** Lilly Puentes

---

## Context

La app de catálogo tiene cuatro pantallas (lista, detalle, crear y editar) que leen y escriben productos contra la API Express. Cada pantalla necesita saber si está cargando, si hubo error, qué datos mostrar y, en el formulario, qué errores de validación tiene cada campo. Hay que decidir dónde vive ese estado antes de escribir las pantallas, porque cambia cómo se estructuran los componentes y cómo se prueban.

**Known constraints:**
- Parcial individual con 6 a 8 horas de trabajo; solo lo visto en las semanas 6 a 9 (React con hooks, Ionic React).
- No hay datos compartidos entre pantallas que deban mantenerse sincronizados en memoria: cada pantalla puede volver a pedir lo que necesita a la API.
- Ionic mantiene las páginas en memoria al navegar, así que la lista debe recargarse al volver (`useIonViewWillEnter`).

---

## Decision

**We decided:** manejar el estado de forma local en cada página con `useState` y `useEffect` (más `useIonViewWillEnter` en la lista), sin un store global.

**Justification:**
El estado de cada pantalla es pequeño y no se comparte: la API es la única fuente de verdad, y cada página la consulta al abrirse. `useState`/`useEffect` es el patrón visto en clase, no agrega dependencias y deja el flujo de datos fácil de leer y de explicar. La lógica que sí conviene reutilizar y probar (validar, filtrar y preparar la vista) se saca a funciones puras de `domain/`, así la página solo coordina.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| `useState` + `useEffect` por página — chosen | Simple, sin dependencias, visto en clase, fácil de probar con funciones puras | Algo de código repetido (cargando/error) en cada página; los datos se vuelven a pedir al navegar | — (chosen) |
| Hook propio por pantalla (`useProductList`, etc.) | Separa la lógica de la vista; reutilizable | Más archivos para una app de 4 pantallas | Aporta poco con este tamaño; queda como mejora si crece |
| Store global (Context API, Zustand o Redux) | Un solo lugar para los productos; caché entre pantallas | Más complejidad, invalidación de caché, dependencia extra | Exceso para el alcance; no hay estado compartido real |

---

## Consequences

**Positive:**
- Cada pantalla es independiente y se entiende leyendo un solo archivo.
- Los datos siempre están frescos: se piden a la API al abrir o volver a la pantalla.
- Las reglas de negocio quedan en `domain/` y se prueban sin React.

**Negative / Trade-offs:**
- Se repite el patrón `status: 'loading' | 'ready' | 'error'` en lista, detalle y formulario.
- Más peticiones a la API (no hay caché entre pantallas).

**Impact on the system:**
- Affected features/screens: lista, detalle y formulario de productos.
- Documents to update: `features/productos.md` (sección State) y el README (sección «State management decision»).

---

## References

- Mobile Governance Framework — `01-architecture/layers-and-state.md`.
- React docs: `useState`, `useEffect`. Ionic React: ciclo de vida `useIonViewWillEnter`.
- Related to: [ADR-002 — Consumo de la API](./ADR-002-consumo-api.md).
