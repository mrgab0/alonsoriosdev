# Lead Engine (Motor de Prospección Comercial Determinista)

Motor determinista en Node.js + TypeScript para calificar y priorizar prospectos comerciales B2B para venta de productos web estandarizados (Fase 1 completada según `LEAD_ENGINE_SPEC.md`).

## Arquitectura y Principios de Diseño
- **Gobernado por código (0% LLM en el control de flujo):** El orden de ejecución, transiciones de estado, filtros y cálculo de puntajes son 100% deterministas y reproducibles.
- **Cero dependencias pesadas:** Utiliza soporte nativo de TypeScript en Node.js (`--experimental-strip-types`) y almacenamiento local transaccional JSON en `data/`.
- **Deduplicación estricta:** Normaliza dominios, teléfonos (+1 E.164) y nombres para evitar colisiones entre fuentes.
- **Filtros obligatorios:** Prevalecen sobre el puntaje numérico (negocios cerrados o requerimientos fuera de catálogo se descartan automáticamente).

## Estructura de Archivos
```text
lead-engine/
├── config/
│   ├── products.json        # Catálogo de productos reales (landing_page, business_website, seo_speed_fix)
│   └── niches.json          # Nichos e industrias objetivo iniciales
├── src/
│   ├── index.ts             # Orquestador del pipeline y runner CLI
│   ├── schemas/
│   │   └── contracts.ts     # Contratos JSON y validadores estrictos
│   ├── utils/
│   │   ├── normalize.ts     # Normalización de dominios, teléfonos y nombres
│   │   └── deduplicate.ts   # Índice y detección de duplicados
│   ├── evaluation/
│   │   ├── hard-filters.ts  # Reglas de descarte obligatorio y complejidad
│   │   └── rule-based.evaluator.ts # Evaluación en 5 dimensiones (0 a 100 pts)
│   ├── storage/
│   │   └── json-store.ts    # Persistencia local de prospectos y eventos
│   └── reporting/
│       └── exporter.ts      # Generador de reportes en JSON y CSV
├── fixtures/
│   └── sample-leads.json    # Lote de prueba con casos representativos (A, B, Duplicado, Descarte)
├── data/                    # Almacén de leads y log de eventos
└── reports/                 # CSVs y JSONs generados listos para revisión humana
```

## Ejecución del Motor (Fase 1)
```bash
node --experimental-strip-types lead-engine/src/index.ts
```
