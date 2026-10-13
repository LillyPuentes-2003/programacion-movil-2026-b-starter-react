# Definition of Done (DoD) — Catálogo de productos

Una historia de usuario del catálogo está **terminada solo cuando todo esto se cumple**:

- [ ] Criterios de aceptación cumplidos y verificados (CRUD de productos: lista con búsqueda y filtro, detalle, crear, editar y eliminar).
- [ ] Documentación escrita **antes** del código: feature, pantallas, ADR-001, ADR-002, endpoints y entidad (commit de docs anterior al primer commit de código).
- [ ] API con los 5 endpoints, códigos exactos (200, 201, 204, 400, 404) y formato de error `{ error, details[] }`.
- [ ] Código integrado a `main` mediante un Pull Request descrito (desde la rama `feature/catalogo-productos`).
- [ ] Pruebas unitarias (dominio) y de la API agregadas y pasando con `npm test` (ver `04-quality/testing-strategy.md` del framework).
- [ ] Funciona en el navegador con `npm run server` + `npm run dev` (plataforma objetivo del parcial: web/PWA; Android/iOS no aplica).
- [ ] Sin advertencias nuevas de linter ni de tipos (`npm run lint` y `npm run build`).
- [ ] Estados de carga, vacío, sin resultados y error (con «Reintentar») manejados; offline se trata como error de red.
- [ ] Textos de la interfaz en español y en un solo lugar por pantalla (localización con i18n: no aplica en este parcial).
- [ ] Analytics / crash reporting: no aplica en este parcial.
- [ ] Ningún secreto en el repositorio: `.env` ignorado y solo `.env.example` versionado.
- [ ] Commits en formato Conventional Commits (mínimo 6).
- [ ] README actualizado: cómo ejecutar, «State management decision» y «API error handling» en inglés.

> Una historia que no cumple todo el DoD **no está terminada**: queda abierta. El trabajo parcial no se cierra «para terminarlo después».
