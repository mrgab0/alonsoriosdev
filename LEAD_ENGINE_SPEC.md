# Sistema de prospección y calificación de clientes

## Especificación funcional y técnica para implementar con Node.js, Google ADK y herramientas CLI

**Estado:** documento inicial de implementación\
**Objetivo:** construir un sistema reproducible para encontrar negocios
estadounidenses que puedan comprar sitios web sencillos, calificarlos
con criterios comerciales verificables y entregar una lista priorizada
para revisión humana.

------------------------------------------------------------------------

# 1. Resumen ejecutivo

El objetivo del sistema NO es recopilar la mayor cantidad posible de
negocios ni generar 40 contactos diarios por cumplir una cuota.

El objetivo es encontrar negocios que:

1.  Tengan una necesidad comercial visible que una página web pueda
    resolver.
2.  Encajen con los productos web que ya podemos entregar.
3.  No requieran desarrollar software nuevo o integraciones complejas.
4.  Puedan recibir una propuesta clara, de alcance limitado y precio
    razonable.
5.  Tengan suficiente evidencia pública para justificar el contacto.

La estrategia debe cambiar según los resultados reales: respuestas,
reuniones, presupuestos, ventas, horas de trabajo e ingresos. No se debe
asumir que las floristerías ni ningún otro nicho será siempre el mejor.

## Decisión arquitectónica principal

**Node.js será el motor de ejecución y control.**

El sistema debe usar flujos deterministas, scripts, eventos, triggers,
estados y validaciones explícitas. No se debe depender de un agente de
IA generalista que decida libremente qué hacer a continuación.

Google ADK puede utilizarse para estructurar componentes/agentes
especializados y sus herramientas, pero el flujo principal debe estar
gobernado por código. Los pasos se ejecutan por reglas y transiciones
explícitas.

**Nemotron no es un componente obligatorio de la primera versión.** Se
puede incorporar posteriormente como evaluador semántico opcional,
detrás de una interfaz intercambiable, para comparar su utilidad frente
a reglas deterministas. El sistema debe seguir funcionando aunque no
haya ningún modelo de IA disponible.

Antigravity CLI y Pi CLI son herramientas de desarrollo y mantenimiento
del proyecto; no deben ser dependencias necesarias para ejecutar la
prospección en producción.

------------------------------------------------------------------------

# 2. Objetivos y límites

## 2.1 Objetivos

-   Descubrir negocios estadounidenses usando fuentes permitidas.
-   Verificar que el negocio y su sitio web existen y están activos.
-   Auditar señales web no intrusivas.
-   Identificar una necesidad que encaje con nuestros productos.
-   Puntuar y clasificar prospectos de forma explicable.
-   Evitar prospectos que exijan proyectos demasiado grandes.
-   Eliminar duplicados.
-   Guardar evidencias y motivos de cada decisión.
-   Producir CSV/JSON y un informe revisable.
-   Registrar resultados de contacto y ventas para mejorar la
    estrategia.

## 2.2 No objetivos

La primera versión NO debe:

-   Desarrollar un CRM para los clientes prospectados.
-   Automatizar llamadas comerciales.
-   Enviar emails o mensajes automáticamente.
-   Comprar anuncios ni ejecutar campañas.
-   Reemplazar sistemas de reservas, inventario, POS o ERP de los
    negocios.
-   Hacer escaneo de vulnerabilidades, pruebas de intrusión ni acciones
    invasivas.
-   Extraer masivamente información de Google Maps incumpliendo sus
    condiciones.
-   Inventar propietarios, emails, presupuestos, problemas o intención
    de compra.
-   Construir un sistema multiagente autónomo que pueda cambiar su
    propio flujo.
-   Modificar la base de código o los módulos actuales del producto web
    sin autorización.

El contacto comercial será una actividad humana en la primera etapa.

------------------------------------------------------------------------

# 3. Producto que realmente vendemos

No vendemos desarrollos a medida ilimitados. Vendemos productos web
estandarizados, configurados y adaptados a cada negocio.

La ventaja competitiva es reutilizar una base de código existente:
plantillas, componentes, dashboard, panel administrativo, tipos de sitio
y módulos ya implementados.

## 3.1 Catálogo inicial de productos

Los precios siguientes son hipótesis iniciales de prueba, no tarifas de
mercado garantizadas. Deben poder cambiarse desde configuración.

  ------------------------------------------------------------------------
  Producto              Precio inicial de referencia Alcance
  --------------------- ---------------------------- ---------------------
  Landing page          USD 100--250; probar USD 149 Una página enfocada
                                                     en llamadas,
                                                     consultas o
                                                     solicitudes

  Sitio web                     Alrededor de USD 700 Varias páginas,
  administrable                                      contenido editable y
                                                     módulos existentes

  Tienda online            Desde USD 900, solo si el Catálogo y checkout
                            módulo actual está listo ya implementados

  Mantenimiento                       USD 15--40/mes Hosting administrado,
  opcional                                           copias de seguridad y
                                                     mantenimiento
                                                     limitado
  ------------------------------------------------------------------------

No se debe mostrar automáticamente un precio al prospecto. El precio es
una referencia interna para evaluar si el trabajo tiene sentido.

## 3.2 Producto 1: landing page

Posibles elementos:

-   Diseño adaptable a móvil y escritorio.
-   Logo, colores, imágenes y textos del negocio.
-   Hero o sección principal con propuesta de valor.
-   Servicios.
-   Ubicación y áreas de servicio.
-   Testimonios, cuando existan y se puedan verificar.
-   Botón de llamada.
-   Botón de WhatsApp, cuando corresponda.
-   Formulario de contacto, si el componente existente está probado.
-   Enlaces a redes sociales.
-   SEO técnico básico y metadatos.
-   Publicación y una ronda de ajustes.

No incluye por defecto:

-   CRM.
-   Sistema de reservas propio.
-   Automatización telefónica.
-   Integraciones especiales.
-   Redacción ilimitada.
-   Fotografías profesionales.
-   Múltiples rondas de cambios.
-   Funcionalidad de comercio electrónico.

## 3.3 Producto 2: sitio web administrable

Puede incluir, según las capacidades reales ya existentes:

-   Varias páginas.
-   Dashboard administrativo.
-   Gestión de contenido.
-   Blog.
-   Catálogo informativo.
-   Formularios.
-   Autoposter/copiloto de publicación, si está estable y el cliente lo
    necesita.

No prometer funciones que todavía no estén implementadas, probadas y
documentadas.

## 3.4 Producto 3: tienda

Solo se recomienda cuando el módulo existente cubre el flujo requerido.

Verificar antes de ofrecer:

-   Alta y edición de productos.
-   Imágenes y variantes, si se requieren.
-   Disponibilidad/inventario, si aplica.
-   Checkout.
-   Pasarela de pago.
-   Notificaciones.
-   Gestión de pedidos.
-   Impuestos y envío, cuando corresponda.

Si falta una pieza crítica, clasificar como
`custom_development_required` y no tratarla como una venta rápida.

## 3.5 Catálogo configurable

Mantener el catálogo en un archivo independiente, por ejemplo
`config/products.json`.

Ejemplo:

``` json
{
  "products": [
    {
      "id": "landing_page",
      "name": "Landing page",
      "price_from": 149,
      "currency": "USD",
      "delivery_target_hours": 4,
      "features": [
        "responsive_design",
        "hero_section",
        "services",
        "contact_form",
        "click_to_call",
        "whatsapp_link",
        "basic_seo"
      ],
      "excluded_features": [
        "custom_crm",
        "custom_booking_engine",
        "custom_inventory",
        "custom_phone_automation",
        "custom_integrations"
      ],
      "status": "available"
    },
    {
      "id": "business_website",
      "name": "Sitio web administrable",
      "price_from": 700,
      "currency": "USD",
      "delivery_target_hours": null,
      "features": [
        "multiple_pages",
        "admin_dashboard",
        "content_management",
        "blog"
      ],
      "excluded_features": [
        "custom_erp",
        "custom_crm",
        "custom_integrations"
      ],
      "status": "available"
    },
    {
      "id": "online_store",
      "name": "Tienda online",
      "price_from": 900,
      "currency": "USD",
      "delivery_target_hours": null,
      "features": [
        "product_catalog",
        "existing_inventory_module",
        "existing_checkout"
      ],
      "excluded_features": [
        "custom_pos",
        "custom_erp",
        "custom_fulfillment_integrations"
      ],
      "status": "conditional"
    }
  ]
}
```

`delivery_target_hours: null` significa que aún no existe un tiempo
validado. No inventar tiempos de entrega.

------------------------------------------------------------------------

# 4. Nichos iniciales de investigación

Los nichos son hipótesis de experimentación, no un ranking definitivo.

1.  Servicios residenciales: HVAC, plomería, electricidad, roofing,
    landscaping y limpieza.
2.  Med spas, clínicas estéticas y salones premium.
3.  Talleres mecánicos y centros de reparación.
4.  Floristerías y tiendas de regalos.
5.  Organizadores de eventos, catering y salones de bodas.

La distribución puede empezar equilibrada, pero no debe ser obligatoria.
No rellenar cupos con prospectos débiles.

El sistema debe permitir:

-   Cambiar nichos.
-   Pausar nichos.
-   Agregar nichos nuevos.
-   Modificar proporciones.
-   Comparar resultados por nicho, ciudad, producto y fuente.

La decisión de aumentar o reducir un nicho debe basarse en datos de
conversión y rentabilidad, no solo en cantidad de sitios deficientes.

------------------------------------------------------------------------

# 5. Perfil de prospecto ideal

Un prospecto ideal tiene una necesidad concreta, encaja con un producto
disponible y puede resolverse sin desarrollo especial.

## 5.1 Señales positivas

### Necesidad comercial

-   No tiene sitio web propio.
-   Tiene una web desactualizada o difícil de usar.
-   No presenta claramente sus servicios.
-   No tiene una llamada a la acción clara.
-   No facilita llamar o solicitar presupuesto desde el móvil.
-   Tiene un catálogo que solo se muestra en redes sociales o mensajes.
-   Tiene una galería de trabajos que podría organizarse mejor.
-   No tiene información clara de ubicación, horarios o zonas de
    servicio.
-   Tiene un formulario roto o difícil de encontrar, cuando se haya
    comprobado de forma segura.
-   Tiene páginas de servicios insuficientes para explicar su oferta.

### Encaje con el producto

-   Una landing page puede resolver la necesidad.
-   El sitio administrable existente cubre el contenido solicitado.
-   El catálogo o tienda ya están implementados.
-   Se puede reutilizar una plantilla sin modificar el núcleo.
-   El cliente puede proporcionar logo, fotos, textos y datos básicos.

### Actividad del negocio

-   Reseñas recientes verificables.
-   Publicaciones recientes en redes.
-   Sitio o perfiles actualizados.
-   Varias ubicaciones o servicios claramente publicados.
-   Señales públicas de que sigue operando.

Estas señales no prueban que tenga presupuesto. Solo ayudan a priorizar
investigación.

## 5.2 Señales negativas

-   Negocio cerrado o sin actividad verificable.
-   Sitio actual que ya resuelve bien la necesidad.
-   Necesidad muy vaga y sin problema identificable.
-   Dependencia de un sistema propietario que no se puede integrar.
-   Requiere una aplicación o plataforma a medida.
-   Requiere CRM, ERP, POS o inventario complejo que no existe en
    nuestro producto.
-   Requiere automatización telefónica o integraciones no disponibles.
-   Necesita migraciones complejas.
-   Exige funcionalidades que no podemos entregar.
-   No hay evidencia suficiente para justificar el contacto.

------------------------------------------------------------------------

# 6. Arquitectura general

Node.js controla el proceso. Los módulos ejecutan tareas concretas y
devuelven resultados estructurados.

``` mermaid
flowchart TD
    A["Trigger: ejecución programada o manual"] --> B["Cargar configuración y catálogo"]
    B --> C["Descubrir negocios mediante fuentes permitidas"]
    C --> D["Normalizar y deduplicar"]
    D --> E["Verificar negocio y sitio web"]
    E --> F["Auditoría web no intrusiva"]
    F --> G["Construir expediente del prospecto"]
    G --> H["Evaluación comercial"]
    H --> I["Reglas deterministas y filtros"]
    I --> J{"¿Pasa los filtros?"}
    J -->|Sí| K["Priorizar A/B"]
    J -->|No| L["Reserva C o descarte D"]
    K --> M["Guardar en base de datos"]
    L --> M
    M --> N["CSV, JSON e informe"]
    N --> O["Revisión humana"]
    O --> P["Registrar contacto y resultados"]
    P --> Q["Métricas y ajuste de estrategia"]
```

## 6.1 Principio de control

El código decide qué paso ocurre después.

Ejemplo:

-   Si `website_url` no existe, no ejecutar PageSpeed.
-   Si la URL es inválida, marcar `verification_failed`.
-   Si la auditoría termina, disparar el evento `AUDIT_COMPLETED`.
-   Si faltan evidencias, enviar a `NEEDS_REVIEW`.
-   Si hay un descarte obligatorio, no permitir que una puntuación alta
    lo convierta en prioridad.
-   Si el prospecto ya existe, actualizarlo en vez de crear un
    duplicado.

No permitir que un LLM decida libremente el siguiente paso del workflow.

------------------------------------------------------------------------

# 7. Componentes y responsabilidades

## 7.1 Node.js: motor principal

Responsabilidades:

-   Scheduler y triggers.
-   Orquestación.
-   Validación de esquemas.
-   Control de estados.
-   Reintentos.
-   Deduplicación.
-   Aplicación de filtros.
-   Persistencia.
-   Generación de informes.
-   Registro de métricas.
-   Control de costos y límites.

## 7.2 Descubrimiento

Obtiene candidatos desde fuentes permitidas:

-   Sitios oficiales.
-   Directorios cuyo uso permita la consulta prevista.
-   APIs comerciales o de lugares con términos adecuados.
-   Asociaciones empresariales.
-   Directorios sectoriales.
-   Búsquedas web manuales o asistidas.

No hacer scraping masivo de Google Maps ni exportar sus datos fuera de
los usos permitidos por sus términos. Verificar los términos de cada
fuente antes de automatizarla.

El módulo de descubrimiento debe devolver candidatos, no decidir si son
buenos clientes.

## 7.3 Verificación

Comprobar:

-   URL con formato válido.
-   Resolución DNS y respuesta HTTP.
-   Redirecciones.
-   HTTPS.
-   Código HTTP.
-   Accesibilidad básica.
-   Identidad del negocio consistente con el sitio.
-   Datos públicos de contacto.
-   Duplicados.

No intentar saltarse autenticación, CAPTCHA, bloqueos ni medidas de
protección.

## 7.4 Auditoría web

Auditoría no intrusiva:

-   PageSpeed Insights API.
-   Mobile y desktop cuando tenga sentido.
-   Rendimiento.
-   Accesibilidad.
-   Buenas prácticas.
-   SEO técnico básico.
-   Core Web Vitals disponibles.
-   Presencia de formulario, teléfono y llamadas a la acción.
-   Enlaces a reservas o pedidos.
-   Navegación móvil.
-   Metadatos básicos.

Una puntuación baja de PageSpeed NO equivale automáticamente a una
oportunidad de venta. La auditoría es evidencia auxiliar.

No ejecutar pruebas de vulnerabilidades, fuerza bruta, fuzzing ni
escaneo intrusivo.

## 7.5 Evaluador comercial

Primera versión: reglas y puntuación determinista.

Opcional posteriormente: modelo de lenguaje, como Nemotron, para
interpretar descripciones y evidencias. El resultado del modelo debe
validarse y nunca controlar directamente el flujo.

## 7.6 Persistencia

Usar SQLite en prototipo o PostgreSQL si se necesita ejecución
concurrente, varios usuarios o despliegue más robusto.

Guardar el expediente completo, las evidencias, la puntuación, las
decisiones y el historial de cambios.

------------------------------------------------------------------------

# 8. Flujos deterministas y triggers

El workflow debe ser una máquina de estados explícita.

## 8.1 Estados sugeridos

``` text
DISCOVERED
NORMALIZED
DUPLICATE
VERIFICATION_PENDING
VERIFIED
VERIFICATION_FAILED
AUDIT_PENDING
AUDITED
EVALUATION_PENDING
EVALUATED
NEEDS_REVIEW
PRIORITY
BACKLOG
REJECTED
CONTACT_READY
CONTACTED
REPLIED
MEETING
QUOTE_REQUESTED
WON
LOST
```

## 8.2 Eventos sugeridos

``` text
LEAD_DISCOVERED
LEAD_NORMALIZED
DUPLICATE_DETECTED
VERIFICATION_COMPLETED
VERIFICATION_FAILED
AUDIT_REQUESTED
AUDIT_COMPLETED
AUDIT_FAILED
EVALUATION_REQUESTED
EVALUATION_COMPLETED
EVALUATION_FAILED
RULES_PASSED
RULES_REJECTED
MANUAL_REVIEW_REQUIRED
LEAD_APPROVED
LEAD_CONTACTED
LEAD_REPLIED
MEETING_BOOKED
QUOTE_SENT
DEAL_WON
DEAL_LOST
```

## 8.3 Ejemplo de transiciones

  Estado actual          Evento/condición       Estado siguiente
  ---------------------- ---------------------- ----------------------
  DISCOVERED             Datos normalizados     NORMALIZED
  NORMALIZED             Duplicado              DUPLICATE
  NORMALIZED             No duplicado           VERIFICATION_PENDING
  VERIFICATION_PENDING   Sitio verificado       VERIFIED
  VERIFICATION_PENDING   Error definitivo       VERIFICATION_FAILED
  VERIFIED               Auditoría iniciada     AUDIT_PENDING
  AUDIT_PENDING          Auditoría completada   AUDITED
  AUDITED                Evaluación iniciada    EVALUATION_PENDING
  EVALUATION_PENDING     Resultado válido       EVALUATED
  EVALUATED              Falta evidencia        NEEDS_REVIEW
  EVALUATED              Pasa reglas y score    PRIORITY
  EVALUATED              Encaje insuficiente    BACKLOG o REJECTED

Los estados de contacto solo se modifican mediante acciones humanas o
integraciones autorizadas.

## 8.4 Idempotencia

Cada paso debe poder ejecutarse de nuevo sin duplicar registros ni
producir efectos secundarios inesperados.

Ejemplo de claves:

-   Descubrimiento: `source + external_id`.
-   Negocio: dominio normalizado + teléfono normalizado, cuando estén
    disponibles.
-   Auditoría: `lead_id + audit_version + timestamp_bucket`.
-   Evaluación: `lead_id + rubric_version + evidence_hash`.

No asumir que dos empresas son iguales solo porque comparten nombre.

## 8.5 Reintentos

-   Reintentar errores temporales con backoff exponencial.
-   No reintentar indefinidamente errores permanentes.
-   Mantener un máximo configurable.
-   Guardar error, timestamp, paso y número de intento.
-   Usar una cola o tabla de trabajos para tareas pendientes.

------------------------------------------------------------------------

# 9. Filtros deterministas

Estos filtros son reglas de código, no decisiones libres del modelo.

## 9.1 Filtros obligatorios de descarte

Descartar o bloquear la prioridad si:

1.  El negocio está cerrado y hay evidencia confiable.
2.  No se puede confirmar que el negocio exista.
3.  La información pertenece a otra empresa.
4.  El sitio es de un tercero o marketplace y no representa al negocio.
5.  El negocio ya tiene una solución funcional y no se identifica una
    mejora concreta.
6.  El proyecto requiere desarrollar un sistema central que no existe en
    el catálogo.
7.  La oportunidad depende de una integración no soportada.
8.  No hay ninguna evidencia verificable del problema.
9.  El negocio está duplicado.
10. El contacto no tiene una fuente pública verificable.

Un dato desconocido no debe interpretarse automáticamente como una señal
negativa. Debe producir `unknown` o revisión manual.

## 9.2 Filtro de complejidad

Clasificación:

-   `low`: se resuelve con configuración y componentes existentes.
-   `medium`: requiere ajustes limitados, pero no altera el núcleo.
-   `high`: requiere código nuevo importante, integraciones especiales o
    migración.
-   `unknown`: falta información.

Regla inicial:

-   `low`: puede ser prioridad.
-   `medium`: revisión y estimación antes de contactar.
-   `high`: descartar del flujo de venta rápida o cotizar por separado.
-   `unknown`: no asumir que es fácil.

## 9.3 Filtro de encaje con catálogo

Cada necesidad detectada debe vincularse a una función real del
catálogo.

Si el sistema no puede relacionar una necesidad con un producto y una
capacidad disponible, no debe recomendarla como oportunidad prioritaria.

------------------------------------------------------------------------

# 10. Puntuación comercial

Puntuación inicial máxima: 100 puntos.

  Factor                                 Máximo
  ----------------------------------- ---------
  Necesidad comercial demostrable            25
  Encaje con productos existentes            25
  Facilidad de implementación                20
  Potencial de conversión del sitio          15
  Evidencia y actividad del negocio          15
  **Total**                             **100**

## 10.1 Definición de cada dimensión

### A. Necesidad comercial: 0--25

-   0: no se observa necesidad.
-   5: mejora estética subjetiva, sin problema funcional.
-   10: información poco clara o CTA débil.
-   15: dificultad observable para solicitar información o contactar.
-   20: proceso comercial importante que el sitio no facilita.
-   25: problema concreto, relevante y respaldado por evidencia.

### B. Encaje con productos existentes: 0--25

-   0: no existe producto compatible.
-   5: casi todo requiere desarrollo especial.
-   10: parte del alcance existe, pero faltan funciones relevantes.
-   15: encaja con ajustes moderados.
-   20: encaja con componentes existentes.
-   25: encaja directamente con un producto disponible y probado.

### C. Facilidad de implementación: 0--20

-   0: proyecto complejo o desconocido.
-   5: integraciones y desarrollo considerable.
-   10: varios ajustes importantes.
-   15: configuración y personalización limitada.
-   20: adaptación rápida de plantilla y componentes existentes.

### D. Potencial de conversión: 0--15

Evalúa si la mejora propuesta puede facilitar una acción comercial
clara:

-   llamada;
-   solicitud de presupuesto;
-   consulta;
-   reserva mediante sistema existente;
-   pedido mediante módulo existente.

No afirmar que aumentará ventas. Evaluar solo si la web puede facilitar
el camino hacia la conversión.

### E. Evidencia y actividad: 0--15

-   Evidencia directa del problema.
-   Identidad consistente.
-   Actividad pública reciente.
-   Datos de contacto verificables.
-   Fuentes fiables y fechadas cuando corresponda.

## 10.2 Rangos

  Score     Clasificación          Acción
  --------- ---------------------- -----------------------------------
  80--100   A --- Prioridad alta   Revisión humana prioritaria
  65--79    B --- Interesante      Contactar si encaja con capacidad
  45--64    C --- Investigación    Completar evidencia
  0--44     D --- Baja prioridad   Reserva o descarte

Los filtros obligatorios prevalecen sobre la puntuación. Un prospecto
con 95 puntos y complejidad alta no debe pasar automáticamente a
prioridad.

## 10.3 Confianza separada del score

La confianza no debe mezclarse con la puntuación comercial.

-   `high`: evidencia directa, consistente y verificable.
-   `medium`: evidencia parcial.
-   `low`: inferencia o información incompleta.

Un prospecto puede tener score alto y confianza baja. En ese caso debe
pasar a revisión, no a contacto prioritario.

------------------------------------------------------------------------

# 11. Contratos JSON

Los contratos son la interfaz entre módulos. Validarlos con Zod o JSON
Schema.

## 11.1 Objeto de prospecto normalizado

``` json
{
  "lead_id": "uuid",
  "business_name": "Example HVAC",
  "industry": "home_services",
  "subindustry": "hvac",
  "country": "US",
  "state": "TX",
  "city": "Houston",
  "website_url": "https://example.com",
  "domain": "example.com",
  "public_contact": {
    "phone": null,
    "email": null,
    "contact_page": "https://example.com/contact",
    "instagram": null
  },
  "business_status": "unknown",
  "sources": [
    {
      "url": "https://example.com",
      "type": "official_website",
      "retrieved_at": "2026-01-01T12:00:00Z"
    }
  ],
  "discovered_at": "2026-01-01T12:00:00Z"
}
```

Los datos anteriores son ilustrativos. No usar datos ficticios como si
fueran prospectos reales.

## 11.2 Resultado de verificación

``` json
{
  "lead_id": "uuid",
  "verification_status": "verified",
  "website_reachable": true,
  "http_status": 200,
  "https_enabled": true,
  "redirect_target": "https://example.com",
  "business_identity_match": "likely",
  "contact_data_verified": {
    "phone": false,
    "email": false,
    "contact_page": true
  },
  "issues": [],
  "checked_at": "2026-01-01T12:00:00Z"
}
```

## 11.3 Resultado de auditoría

``` json
{
  "lead_id": "uuid",
  "audit_status": "completed",
  "pagespeed": {
    "mobile": {
      "performance": null,
      "accessibility": null,
      "best_practices": null,
      "seo": null
    },
    "desktop": {
      "performance": null,
      "accessibility": null,
      "best_practices": null,
      "seo": null
    }
  },
  "website_features": {
    "clear_primary_cta": "unknown",
    "click_to_call": "present",
    "contact_form": "unknown",
    "online_booking": "not_detected",
    "online_catalog": "not_detected",
    "online_checkout": "not_detected",
    "mobile_navigation": "present"
  },
  "observations": [],
  "evidence": [],
  "audited_at": "2026-01-01T12:00:00Z"
}
```

Los valores nulos o `unknown` deben mantenerse cuando no se pueda
verificar algo. No convertir ausencia de detección en prueba de
ausencia.

## 11.4 Contrato de salida del evaluador

Este es el contrato central para cualquier evaluador semántico opcional.
Puede ser Nemotron u otro modelo. El workflow no depende de él.

``` json
{
  "lead_id": "uuid",
  "decision": "priority",
  "score": 87,
  "score_breakdown": {
    "commercial_need": 23,
    "product_fit": 24,
    "implementation_ease": 19,
    "conversion_potential": 12,
    "evidence_activity": 9
  },
  "confidence": "high",
  "commercial_problem": "No se identifica una forma clara de solicitar presupuestos desde la página principal",
  "recommended_product": "landing_page",
  "estimated_complexity": "low",
  "existing_components_reusable": [
    "contact_form",
    "service_sections",
    "mobile_layout"
  ],
  "custom_development_required": false,
  "reasons_to_reject": [],
  "outreach_angle": "Facilitar solicitudes de presupuesto desde teléfonos móviles",
  "evidence": [
    {
      "claim": "No se encontró un formulario de presupuesto en la página revisada",
      "source_url": "https://example.com",
      "evidence_type": "website_observation",
      "confidence": "medium"
    }
  ],
  "missing_information": [],
  "rubric_version": "1.0",
  "evaluated_at": "2026-01-01T12:00:00Z"
}
```

Reglas del contrato:

-   `decision`: `priority`, `interesting`, `research`, `reject`.
-   `score`: entero de 0 a 100.
-   Cada dimensión debe respetar su máximo.
-   La suma de dimensiones debe ser igual a `score`.
-   `confidence`: `high`, `medium`, `low`.
-   `estimated_complexity`: `low`, `medium`, `high`, `unknown`.
-   `custom_development_required`: boolean.
-   `recommended_product`: ID existente del catálogo o `null`.
-   `evidence`: afirmaciones con URL de respaldo.
-   `missing_information`: lista explícita.
-   No inventar hechos, presupuestos ni intención de compra.
-   Si la evidencia es insuficiente, devolver `research` o
    `needs_review`, nunca fabricar certeza.

El backend debe validar este JSON. Si no cumple el contrato, rechazarlo
o enviarlo a reparación limitada; nunca ejecutar acciones basadas en una
respuesta inválida.

------------------------------------------------------------------------

# 12. Uso opcional de Nemotron

Nemotron puede probarse como evaluador semántico, pero no debe ser el
orquestador.

## 12.1 Qué puede aportar

-   Interpretar páginas y descripciones.
-   Relacionar problemas con productos.
-   Explicar por qué un prospecto encaja o no.
-   Identificar señales contradictorias.
-   Proponer un ángulo de contacto basado en evidencia.
-   Resumir información dispersa.

## 12.2 Qué no debe hacer

-   Descubrir por sí solo qué tarea ejecutar después.
-   Cambiar estados de la base de datos directamente.
-   Enviar mensajes.
-   Inventar datos que falten.
-   Decidir ignorando filtros obligatorios.
-   Modificar precios o catálogo.
-   Cambiar la rúbrica de puntuación.
-   Ejecutar código o herramientas sin autorización.

## 12.3 Diseño intercambiable

Definir una interfaz como:

``` ts
export interface LeadEvaluator {
  evaluate(input: LeadEvaluationInput): Promise<LeadEvaluationResult>;
}
```

Implementaciones posibles:

-   `RuleBasedEvaluator`: evaluación determinista.
-   `NemotronEvaluator`: evaluación semántica por API.
-   `NoopEvaluator`: deshabilitado o sin proveedor.

El workflow debe poder cambiar de evaluador mediante configuración sin
reescribir el resto del sistema.

## 12.4 Prueba antes de adoptar Nemotron

Crear un conjunto de 50--100 prospectos revisados manualmente.

Comparar:

-   Acuerdo con la clasificación humana.
-   Falsos positivos: prospectos que parecen buenos, pero requieren
    desarrollo excesivo.
-   Falsos negativos: prospectos útiles descartados.
-   Consistencia entre ejecuciones.
-   Costo por prospecto.
-   Latencia.
-   Porcentaje de respuestas JSON válidas.

Si no mejora de forma medible al evaluador determinista, no se
incorpora.

------------------------------------------------------------------------

# 13. Google ADK y agentes

Google ADK puede organizar componentes especializados, pero no debe
convertir el proceso en una conversación autónoma sin límites.

La propuesta es utilizarlo solo cuando aporte una ventaja real:
encapsular una tarea especializada, exponer herramientas o estandarizar
entradas y salidas.

## 13.1 Agentes/componentes propuestos

1.  `DiscoveryAgent`: encapsula la búsqueda mediante fuentes
    autorizadas.
2.  `VerificationAgent`: ejecuta verificaciones de URL y datos.
3.  `WebsiteAuditAgent`: ejecuta auditorías no intrusivas.
4.  `LeadEvaluationAgent`: aplica reglas y, opcionalmente, llama a un
    evaluador semántico.
5.  `ReportAgent`: genera resumen, CSV e informe.

Estos nombres representan responsabilidades. No significa que todos
deban ser agentes LLM.

## 13.2 Regla importante

Cada agente/componente debe tener:

-   Una sola responsabilidad.
-   Entrada definida.
-   Salida definida.
-   Herramientas permitidas.
-   Límites de tiempo.
-   Límites de costo.
-   Política de reintentos.
-   Errores tipados.
-   Ningún permiso innecesario.

El controlador Node.js decide el orden y cuándo invocar cada componente.

## 13.3 Cuándo no usar ADK

Si un paso es una simple petición HTTP, una normalización, una regla o
una operación de base de datos, usar una función Node.js normal.

No introducir ADK en cada función por moda. La arquitectura más sencilla
que cumpla el requisito es preferible.

------------------------------------------------------------------------

# 14. Estructura de proyecto sugerida

``` text
lead-engine/
├── src/
│   ├── app.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── products.json
│   │   ├── niches.json
│   │   └── scoring-rules.json
│   ├── orchestrator/
│   │   ├── workflow.ts
│   │   ├── state-machine.ts
│   │   ├── event-bus.ts
│   │   ├── scheduler.ts
│   │   └── job-runner.ts
│   ├── discovery/
│   │   ├── discovery.service.ts
│   │   └── sources/
│   ├── verification/
│   │   ├── url-verifier.ts
│   │   ├── identity-check.ts
│   │   └── contact-check.ts
│   ├── audit/
│   │   ├── pagespeed.ts
│   │   ├── website-features.ts
│   │   └── audit.service.ts
│   ├── evaluation/
│   │   ├── evaluator.interface.ts
│   │   ├── rule-based.evaluator.ts
│   │   ├── nemotron.evaluator.ts
│   │   ├── scoring.ts
│   │   └── hard-filters.ts
│   ├── adk/
│   │   └── adapters/
│   ├── storage/
│   │   ├── database.ts
│   │   ├── leads.repository.ts
│   │   ├── events.repository.ts
│   │   └── migrations/
│   ├── reporting/
│   │   ├── csv-export.ts
│   │   ├── json-export.ts
│   │   └── daily-report.ts
│   ├── schemas/
│   │   ├── lead.schema.ts
│   │   ├── audit.schema.ts
│   │   └── evaluation.schema.ts
│   └── utils/
│       ├── normalize.ts
│       ├── deduplicate.ts
│       ├── retry.ts
│       └── logger.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── data/
├── reports/
├── .env.example
├── package.json
└── README.md
```

La estructura es una propuesta, no una exigencia de crear todos los
archivos desde el primer día.

------------------------------------------------------------------------

# 15. Tecnologías sugeridas

  Necesidad                   Tecnología
  --------------------------- --------------------------------------------
  Runtime                     Node.js + TypeScript
  Validación                  Zod o JSON Schema
  Base de datos inicial       SQLite
  Base de datos posterior     PostgreSQL
  HTTP                        fetch nativo o cliente HTTP
  Auditoría de rendimiento    PageSpeed Insights API
  Orquestación                Código propio en Node.js
  Agentes especializados      Google ADK, solo si aporta valor
  Modelo semántico opcional   Nemotron vía API
  Logs                        Pino u otro logger estructurado
  Tests                       Vitest o Node test runner
  CSV                         librería CSV mantenida
  Scheduler                   cron o scheduler del entorno de despliegue

No introducir Redis, colas distribuidas, microservicios o Kubernetes en
la primera versión sin una necesidad demostrada.

------------------------------------------------------------------------

# 16. Métricas de negocio

El sistema no se optimiza por cantidad de leads.

Debe registrar:

-   Prospectos descubiertos.
-   Prospectos verificados.
-   Prospectos con necesidad comercial demostrable.
-   Prospectos que encajan con productos existentes.
-   Prospectos descartados por complejidad.
-   Contactos enviados manualmente.
-   Respuestas.
-   Respuestas positivas.
-   Reuniones.
-   Presupuestos solicitados.
-   Presupuestos enviados.
-   Ventas.
-   Ingresos.
-   Horas dedicadas a prospección.
-   Horas de producción.
-   Costos de herramientas/API.
-   Ingreso por hora de trabajo.

## 16.1 Métricas clave

**Tasa de respuesta**

`respuestas / contactos enviados`

**Tasa de respuesta positiva**

`respuestas positivas / contactos enviados`

**Conversión a venta**

`ventas / contactos enviados`

**Ingreso por prospecto contactado**

`ingresos atribuibles / contactos enviados`

**Ingreso por hora de prospección**

`ingresos atribuibles / horas de prospección`

**Tiempo medio de entrega**

`horas de producción / proyectos entregados`

La métrica estratégica principal será el ingreso generado por hora total
invertida, junto con la tasa de conversión y la satisfacción del
cliente.

## 16.2 Ajuste de nichos

Revisar semanalmente o cada dos semanas:

-   ¿Qué nicho responde más?
-   ¿Qué nicho solicita presupuestos?
-   ¿Qué nicho compra?
-   ¿Qué nicho exige menos personalización?
-   ¿Qué producto se vende más?
-   ¿Qué fuente produce prospectos verificables?
-   ¿Qué nicho deja mejor ingreso por hora?

Cambiar la distribución según evidencia. No mantener un reparto de 8 por
nicho si los datos muestran otra cosa.

------------------------------------------------------------------------

# 17. Seguridad, privacidad y cumplimiento

-   Respetar términos de servicio de cada fuente.
-   No hacer scraping prohibido.
-   No recopilar datos personales sensibles.
-   Usar datos empresariales públicos y pertinentes.
-   No automatizar mensajes ni llamadas en la primera versión.
-   Respetar CAN-SPAM y otras normas aplicables antes de iniciar
    outreach.
-   No realizar escaneos intrusivos.
-   No guardar credenciales en el repositorio.
-   Usar variables de entorno.
-   Limitar frecuencia de peticiones.
-   Identificar claramente las fuentes y fecha de consulta.
-   Permitir eliminar o corregir registros.
-   No almacenar más información de la necesaria.

------------------------------------------------------------------------

# 18. Plan de implementación por etapas

## Fase 0 --- Inventario del producto actual

Antes de programar el motor, inspeccionar el proyecto web existente y
documentar:

-   Plantillas disponibles.
-   Componentes reutilizables.
-   Tipos de sitios.
-   Dashboard.
-   Panel administrativo.
-   Blog.
-   Autoposter.
-   Catálogo e inventario.
-   Checkout y pagos.
-   Formularios.
-   Hosting y despliegue.
-   Limitaciones conocidas.

**No modificar el proyecto web original.** Solo inspeccionarlo y
documentarlo.

Resultado: `PRODUCT_CAPABILITIES.md` y catálogo de productos realista.

## Fase 1 --- Motor mínimo

Implementar:

-   Configuración.
-   Contratos JSON.
-   Base de datos.
-   Normalización.
-   Deduplicación.
-   Máquina de estados.
-   Un input manual de prospectos JSON.
-   Evaluador determinista.
-   Puntuación.
-   Exportación CSV/JSON.

Objetivo: probar la calificación sin depender de búsquedas ni modelos.

## Fase 2 --- Verificación y auditoría

Agregar:

-   Verificación de URL.
-   HTTPS.
-   Datos públicos.
-   PageSpeed.
-   Detección básica de CTA, formularios y enlaces.
-   Evidencias.

Objetivo: enriquecer prospectos sin hacer pruebas invasivas.

## Fase 3 --- Descubrimiento

Conectar fuentes permitidas. Empezar con una fuente a la vez y comprobar
calidad, términos, límites y costos.

Objetivo: obtener candidatos verificables, no volumen artificial.

## Fase 4 --- Evaluador semántico opcional

Comparar Nemotron contra reglas y revisión humana usando un conjunto
etiquetado.

No activar automáticamente si no mejora resultados.

## Fase 5 --- ADK, si hace falta

Introducir ADK para encapsular tareas especializadas únicamente si
simplifica el mantenimiento o la integración de herramientas.

El workflow seguirá gobernado por Node.js.

## Fase 6 --- Panel y aprendizaje comercial

Agregar interfaz para:

-   Revisar prospectos.
-   Aprobar o rechazar.
-   Corregir puntuaciones.
-   Registrar contactos.
-   Registrar respuestas.
-   Registrar ventas y pérdidas.
-   Ver métricas por nicho y producto.

------------------------------------------------------------------------

# 19. Instrucciones específicas para Antigravity CLI

Antigravity debe trabajar de forma incremental y conservadora.

## Reglas obligatorias

1.  Primero inspeccionar el repositorio y presentar un diagnóstico.
2.  No modificar el sistema web existente que se utiliza para entregar
    sitios a clientes.
3.  No reescribir archivos funcionales sin autorización.
4.  No crear todos los módulos de golpe.
5.  No instalar dependencias innecesarias.
6.  No agregar infraestructura compleja sin justificarla.
7.  No crear agentes LLM autónomos para controlar el workflow.
8.  No conectar Nemotron en la primera etapa.
9.  Usar TypeScript y contratos validados.
10. Cada módulo debe tener pruebas.
11. Implementar una fase, probarla y mostrar resultados antes de
    avanzar.
12. Si hay ambigüedad, preguntar antes de cambiar arquitectura o
    comportamiento.
13. Mantener `.env.example`, nunca secretos reales.
14. Documentar decisiones y comandos para ejecutar el proyecto.
15. No afirmar que una función está terminada sin pruebas ejecutadas.

## Primer encargo para Antigravity

**No empezar programando todo el sistema.**

Primero:

1.  Leer este documento completo.
2.  Inspeccionar el repositorio y el entorno.
3.  Identificar qué capacidades ya existen en el producto web.
4.  Proponer una arquitectura mínima para el motor de prospección.
5.  Identificar dependencias y costos.
6.  Entregar un plan de implementación por commits/fases.
7.  Esperar aprobación antes de modificar archivos.

Después de aprobar:

-   Crear un proyecto independiente `lead-engine`.
-   Implementar únicamente Fase 0 y Fase 1.
-   Crear un pequeño conjunto de prospectos ficticios para pruebas,
    claramente marcados como fixtures.
-   Demostrar deduplicación, puntuación, filtros y exportación.
-   No conectar fuentes externas ni modelos hasta que el motor básico
    funcione.

## Criterio de aceptación de la primera versión

La primera versión se considera funcional cuando:

-   Recibe un JSON de prospecto.
-   Valida su estructura.
-   Normaliza los datos.
-   Detecta duplicados.
-   Aplica filtros deterministas.
-   Calcula una puntuación reproducible.
-   Devuelve motivos claros.
-   Guarda el registro.
-   Exporta CSV y JSON.
-   Tiene pruebas automatizadas.
-   No requiere un LLM para funcionar.

------------------------------------------------------------------------

# 20. Prompt breve para iniciar Antigravity

Lee el documento `LEAD_ENGINE_SPEC.md` completo y úsalo como
especificación del proyecto.

Quiero construir un motor de prospección comercial para vender sitios
web sencillos y reutilizables a pequeños negocios estadounidenses.

La prioridad es un sistema determinista gobernado por Node.js y
TypeScript. No quiero un agente autónomo que improvise los pasos. Quiero
workflows explícitos, eventos, triggers, estados, validación de
contratos JSON, filtros deterministas, puntuación reproducible y
persistencia.

Google ADK podrá utilizarse más adelante para encapsular tareas
especializadas, pero no debe controlar libremente el flujo. Nemotron es
opcional y queda fuera de la primera versión.

Primero inspecciona el repositorio y documenta las capacidades reales de
mi sistema web actual. No modifiques ese proyecto ni sus módulos
funcionales. Después presenta un plan concreto y espera mi aprobación.

Una vez aprobado, crea un proyecto independiente para el motor de
prospección e implementa solamente la Fase 0 y Fase 1 de este documento.
No avances a las siguientes fases sin mi autorización.

No sobreingenierices. No agregues infraestructura, agentes, dependencias
ni servicios que no sean necesarios. Cada etapa debe ser pequeña,
comprobable y reversible.

------------------------------------------------------------------------

# 21. Principio rector

El sistema debe responder una pregunta:

**¿Podemos venderle a este negocio una solución web que ya tenemos, a un
precio razonable, y entregarla rápidamente sin desarrollar software
nuevo?**

No buscamos listas enormes. Buscamos oportunidades comerciales reales,
compatibles con nuestro producto y rentables por hora de trabajo.

El éxito no se mide por cuántos prospectos encuentra el sistema. Se mide
por cuántas conversaciones comerciales útiles, presupuestos y ventas
produce, cuánto tiempo cuesta conseguirlos y cuánto trabajo exige
entregar cada proyecto.
