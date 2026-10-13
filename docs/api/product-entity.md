# Entity — Product

- **Store:** N/A (almacenamiento en memoria en la API: un arreglo dentro de `createApp()`, copiado de `server/data/products.json`)
- **Table/collection:** `products` (arreglo en memoria; se reinicia con el servidor)
- **Schema version introduced:** 1

---

## Fields

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | integer | No | Clave primaria; la asigna la API de forma incremental (máximo id + 1); no se envía al crear |
| `name` | string | No | Obligatorio; no puede quedar vacío ni ser solo espacios; máximo 60 caracteres; se guarda sin espacios sobrantes (`trim`) |
| `price` | number | No | Número finito mayor que 0 (pesos colombianos) |
| `category` | string | No | Obligatoria; una de `Bebidas`, `Snacks`, `Aseo`, `Hogar` (coincidencia exacta) |
| `stock` | integer | No | Entero mayor o igual que 0 (en Kotlin, `Int?` para practicar el manejo de `null`: «Sin dato») |
| `created_at` / `updated_at` | — | — | N/A (almacenamiento en memoria; no se registran fechas) |

**Reglas derivadas (no se guardan, se calculan en `toProductView`):**

| Campo de vista | Regla |
|----------------|-------|
| `priceLabel` | `formatCOP(price)`, p. ej. `1250000 → "$ 1.250.000"` |
| `stockLabel` | `stock = 0` → «Agotado» · `stock < 5` → «Pocas unidades» · otro caso → «Disponible» |
| `isOutOfStock` / `isLowStock` | Coherentes con la etiqueta |

---

## Indexes

| Index | Columns | Reason |
|-------|---------|--------|
| N/A (almacenamiento en memoria) | — | La búsqueda se hace con `Array.filter` sobre 8 a pocas decenas de productos |

---

## Relationships

| Related entity | Key | Cardinality |
|----------------|-----|-------------|
| N/A | — | `category` es un texto de una lista fija, no una entidad |

---

## Sync

- **Synced?** No — N/A (almacenamiento en memoria; la app no guarda copia local).
- **Conflict policy:** N/A; la última petición que llega a la API gana (last-write-wins implícito).

---

## Migration notes

N/A (almacenamiento en memoria). Los datos semilla (8 productos) se cargan al iniciar el servidor y cualquier cambio se pierde al reiniciarlo.
