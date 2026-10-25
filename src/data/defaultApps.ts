export interface AppData {
  _id?: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  content: string;
  icon?: string;
  version: string;
  platform: string;
  category: string;
  status: "upcoming" | "beta" | "published";
  githubUrl?: string;
  playStoreUrl?: string;
  downloadUrl?: string;
  privacyPolicyUrl: string;
  permissions: { name: string; description: string }[];
  features: string[];
  techStack: string[];
  featured?: boolean;
  published: boolean;
  order: number;
}

export const defaultApps: AppData[] = [
  {
    title: "Remote WiFi Keyboard",
    slug: "remote-wifi-keyboard",
    tagline: "Convierte tu teléfono Android en un teclado inalámbrico ultra veloz para tu PC o Mac vía Wi-Fi local.",
    description:
      "Aplicación nativa para Android diseñada con enfoque estricto en privacidad, cero latencia y comunicación 100% local. Sin cuentas obligatorias, sin servidores en la nube, sin telemetría y sin necesidad de instalar controladores pesados en la computadora.",
    content: `## ¿Qué es Remote WiFi Keyboard?

**Remote WiFi Keyboard** es una herramienta de productividad desarrollada para transformar cualquier dispositivo Android en una superficie de entrada de texto remota e instantánea para computadoras con Windows, Linux o macOS.

### ¿Por qué existe esta aplicación?
Muchos usuarios se encuentran en situaciones donde:
- El teclado físico de su laptop o equipo de escritorio presenta teclas defectuosas.
- Necesitan escribir textos largos, notas o contraseñas complejas en un equipo conectado a la televisión o proyector sin levantarse del sofá.
- Prefieren usar el dictado por voz integrado en el teclado de Android (Gboard / Voice Typing) para redactar directamente sobre un editor de código, documento o navegador en su computadora.
- Desean una solución **segura y privada**, sin depender de software comercial que envía cada pulsación de tecla a servidores remotos.

---

## Características Principales

1. **Comunicación 100% en Red Local (LAN):**
   Todos los paquetes de datos viajan única y exclusivamente entre tu teléfono y tu computadora dentro de tu red Wi-Fi privada. **Cero bytes salen a Internet.**

2. **Cero Instalación de Drivers:**
   Se conecta directamente a través de un cliente web ligero o socket local sin requerir drivers con privilegios de kernel en la PC.

3. **Retroalimentación Háptica Precisa:**
   Vibración táctil sutil al presionar cada tecla para brindar la sensación de pulsación física.

4. **Modo Servicio en Primer Plano (Foreground Service):**
   Mantiene la sesión de escritura activa mientras usas otras apps o con la pantalla atenuada, evitando desconexiones inesperadas por el gestor de batería del sistema operativo.

5. **Privacidad Absoluta:**
   - Sin publicidad (cero anuncios invasivos).
   - Sin rastreadores ni librerías analíticas de terceros.
   - Sin registro de contraseñas ni pulsaciones (Keylogger-free por diseño).

---

## Arquitectura Técnica y Seguridad

| Parámetro | Detalle Técnico |
|---|---|
| **Plataforma Objetivo** | Android (Kotlin Nativo / Jetpack) |
| **Protocolo de Enlace** | WebSockets / HTTP Local sobre TCP |
| **Cifrado de Capa Local** | Restricción de tráfico al segmento IPv4/IPv6 de la subred local |
| **Persistencia** | Servicio en primer plano con notificación no intrusiva en barra de estado |
| **Licencia** | Código abierto / Propietario con auditoría verificable |

---

## Desglose de Permisos de Android

La aplicación solicita únicamente los permisos estrictamente necesarios para su funcionamiento en red local:

- \`android.permission.INTERNET\`: Requerido exclusivamente para enlazar la aplicación con el navegador de tu computadora dentro de la misma red Wi-Fi. No se realizan conexiones salientes a servidores de Internet.
- \`android.permission.ACCESS_NETWORK_STATE\` y \`android.permission.ACCESS_WIFI_STATE\`: Necesarios para verificar si el dispositivo está conectado a una red Wi-Fi y mostrar la dirección IP local correspondiente para conectarse.
- \`android.permission.FOREGROUND_SERVICE\`: Mantiene el socket local en ejecución mientras el usuario escribe, impidiendo que el optimizador de memoria de Android mate el proceso en segundo plano.
- \`android.permission.VIBRATE\`: Brinda respuesta táctil breve al pulsar botones de acción rápida.
`,
    icon: "/images/apps/remote-keyboard-icon.png",
    version: "1.0.0",
    platform: "Android (APK / Google Play)",
    category: "Herramientas & Productividad",
    status: "upcoming",
    githubUrl: "https://github.com/mrgab0/RemoteWifiKeyboard",
    playStoreUrl: "",
    downloadUrl: "",
    privacyPolicyUrl: "/privacy-remote-keyboard.html",
    permissions: [
      {
        name: "android.permission.INTERNET",
        description: "Requerido únicamente para abrir el socket de comunicación local en la red Wi-Fi compartida con la computadora.",
      },
      {
        name: "android.permission.ACCESS_NETWORK_STATE",
        description: "Permite inspeccionar la conectividad local para identificar la subred Wi-Fi.",
      },
      {
        name: "android.permission.ACCESS_WIFI_STATE",
        description: "Obtiene la IP local del teléfono para mostrar el enlace de conexión en pantalla.",
      },
      {
        name: "android.permission.FOREGROUND_SERVICE",
        description: "Mantiene la conexión activa en segundo plano con una notificación en la barra de estado mientras escribes.",
      },
      {
        name: "android.permission.VIBRATE",
        description: "Proporciona retroalimentación háptica leve opcional al recibir eventos de pulsación.",
      },
    ],
    features: [
      "100% Comunicación local sin salida a Internet",
      "Soporte para dictado por voz de Android en tu PC",
      "Conexión instantánea por código QR o dirección IP local",
      "Cero controladores pesados en el ordenador",
      "Servicio en primer plano estable contra ahorro de batería",
      "Cero publicidad, cero analíticas y cero telemetría",
    ],
    techStack: [
      "Android SDK",
      "Kotlin Nativo",
      "Local WebSockets / HTTP",
      "Coroutines & Flow",
      "Android Jetpack",
    ],
    featured: true,
    published: true,
    order: 1,
  },
];
