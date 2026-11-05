# Inventario de Capacidades del Producto Web (Fase 0)

> **Documento de Auditoría y Línea Base de Producto**  
> **Propósito:** Registrar las capacidades técnicas reales, componentes existentes y límites operativos del ecosistema web de Alonso Ríos para alimentar el catálogo del motor de prospección (`lead-engine`).  
> **Regla estricta:** Este inventario es de solo lectura; no modifica el código funcional del sitio web.

---

## 1. Stack Tecnológico Base y Runtime
* **Framework:** Next.js (App Router, React 19 / Server Components + Client Components).
* **Tipado:** TypeScript estricto con interfaces compartidas.
* **Estilos & Diseño:** Tailwind CSS con paleta Obsidian Glassmorphism (`bg-[#070d19]`, `bg-[#0b1325]`, acentos dorados y esmeralda) y soporte para accesibilidad.
* **Base de Datos & ORM:** MongoDB con Mongoose (`connectMongo` / `connectToDatabase`).
* **Despliegue & CDN:** Vercel Serverless con caching perimetral y soporte Edge.
* **Entorno de Desarrollo y Ejecución:** Termux Android ARM64 (Node.js) con restricciones de hardware (cero dev servers pesados locales, compilación estática `tsc --noEmit`).

---

## 2. Componentes y Módulos UI Reutilizables

| Componente | Archivo de Origen | Capacidades Reales Verificadas |
| :--- | :--- | :--- |
| **Hero de Conversión** | `src/components/Hero.tsx` | Propuesta de valor, badges dinámicos de disponibilidad, tarjeta de perfil sénior, métricas de confianza, CTAs directos. |
| **Catálogo de Servicios & Tarifas** | `src/components/Services.tsx` / `src/app/servicios` | Desglose modular de horas a $19/h, cotizador interactivo en tiempo real con cálculo de inversión y tiempo de entrega. |
| **Formulario de Contacto & Leads** | `src/components/ContactForm.tsx` | Captura de nombre, email, teléfono/WhatsApp, tipo de proyecto, mensaje. Persistencia en MongoDB (`Contact`). |
| **Widget Flotante Lead Magnet** | `src/components/LeadCaptureFloatingWidget.tsx` | Modal con temporizador y trigger de salida, oferta de cupón (10% OFF `ALONSO10`), suscripción directa (`LeadCapture`). |
| **Integración WhatsApp Contextual** | `src/components/WhatsAppButton.tsx` | Enlaces dinámicos con mensajes pre-redactados y codificados según la página o cotización seleccionada. |
| **Chatbot IA Butler de Ventas** | `src/components/ChatbotWidget.tsx` | Asistente conversacional conectado a Google Gemini (`/api/chat`), con memoria contextual, catálogo de apps y derivación a WhatsApp. |
| **Catálogo de Apps & Software** | `src/app/apps` / `AppDetailClient.tsx` | Ficha técnica, permisos de Android, insignias de estado (Upcoming, Beta, Published) y formulario de lista de espera / APK. |
| **Blog & Content Engine** | `src/app/blog` / `BlogPostClient.tsx` | Sistema de artículos con renderizado Markdown, metadatos SEO automáticos, cálculo de tiempo de lectura y feed RSS (`/rss.xml`). |
| **Reseñas & Social Proof** | `src/components/Testimonials.tsx` | Tarjetas de testimonios con estrellas, métricas de satisfacción y verificación de clientes. |
| **Herramientas de Códigos QR** | `src/app/herramientas/` | Generadores de QR estáticos, dinámicos con redirección analítica y formato bancario venezolano Pago Móvil. |

---

## 3. Capacidades del Panel de Administración (`/admin`)

* **Autenticación:** Login seguro para administrador con control de sesión (`/admin/login`).
* **Editor Visual en Vivo:** Edición de textos, títulos del Hero y configuraciones globales en caliente (`/admin/editor` y `SiteConfig`).
* **Gestión de Leads & Contactos:** Visualización de mensajes recibidos de clientes potenciales (`/admin/contacts`).
* **Gestión de Campañas y Correos:** Redactor de campañas de email y plantillas transaccionales (`/admin/campaigns`, `EmailTemplate`).
* **Gestión de Aplicaciones:** Publicación y actualización de catálogo de software (`/admin/apps`, `AppProject`).
* **Blog Studio con IA:** Generador y traductor asistido de artículos para posicionamiento orgánico (`/admin/blog`).
* **Telemetría y Analíticas:** Conteo de vistas y analítica no invasiva de páginas (`/admin/analytics`, `PageView`).

---

## 4. Capacidades Reales vs. Límites Operativos (No Prometer)

### ✅ Lo que SÍ podemos entregar rápidamente (1 a 3 días con plantillas existentes):
1. **Landing Pages de Alta Conversión:**
   - 100/100 en Google PageSpeed y Core Web Vitals.
   - Click-to-call telefónico y botón directo a WhatsApp.
   - Formulario de contacto directo con notificación o registro en base de datos.
   - Adaptabilidad móvil 100% probada.
2. **Sitios Web Corporativos Administrables:**
   - Estructura multipágina (Inicio, Servicios, Nosotros, Contacto, Blog).
   - Panel de edición para cambiar textos o publicar posts sin tocar código.
   - SEO técnico estructurado (JSON-LD Schema, robots.txt, sitemap.xml).
3. **Optimización & Reparación Web Urgente:**
   - Aceleración de tiempo de respuesta (TTFB < 0.2s).
   - Corrección de sitemaps y problemas de indexación en Google Search Console.
   - Limpieza de código obsoleto.

### ❌ Lo que NO podemos entregar en venta rápida (Descarte Inmediato del Prospecto):
- **CRMs complejos personalizados** (prospectos que pidan Zoho / Salesforce a medida).
- **Motores de reserva complejos con calendarios multi-empleado sincronizados en tiempo real** (a menos que usen un widget embebible como Calendly o Fresha).
- **Automatización telefónica / IVR por voz**.
- **Sistemas de punto de venta (POS) físicos o control de inventario de almacén pesado**.
- **Tiendas online con miles de SKUs o integraciones logísticas complejas**.

---

## 5. Mapeo para el Catálogo del Motor de Prospección (`lead-engine`)

A partir de este inventario, el catálogo inicial de productos para calificar prospectos se define en:

1. `landing_page` (USD 149 - 250): Para negocios sin web, con web rota o sin click-to-call móvil.
2. `business_website` (USD 600 - 800): Para negocios con múltiples servicios, necesidad de testimonios y posicionamiento local.
3. `seo_speed_fix` (USD 190): Para negocios con web activa pero lenta, sin HTTPS o con problemas de indexación.
4. `custom_development_required`: Estado de descarte para prospectos que exceden este catálogo.
