import { Metadata } from "next";
import ServiciosClient from "./ServiciosClient";

export const metadata: Metadata = {
  title: "Servicios y Tarifas Transparentes ($19 USD/h) | Alonso Ríos",
  description:
    "Cotizador en tiempo real y catálogo de servicios de Alonso Ríos: Desarrollo Web de alto rendimiento, Apps Android nativas y SEO técnico. Tarifa plana de $19 USD/h sin costes ocultos.",
  openGraph: {
    title: "Servicios y Cotizador Interactivo | Alonso Ríos - Especialista Sénior",
    description:
      "Calcula el costo y tiempo de tu proyecto web o aplicación móvil en tiempo real a tarifa de $19 USD/h con garantía de entrega.",
    url: "https://www.alonsorios.dev/servicios",
    type: "website",
  },
};

export default function ServiciosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Alonso Ríos - Ingeniería Digital y Desarrollo de Software",
    image: "https://www.alonsorios.dev/avatar.jpg",
    url: "https://www.alonsorios.dev/servicios",
    telephone: "+584129912840",
    priceRange: "$19 - $1140 USD",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Caracas",
      addressCountry: "VE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "10.4806",
      longitude: "-66.9036",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de Desarrollo de Software y Posicionamiento",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Desarrollo de Sitios Web y Landing Pages",
            description: "Sitios Next.js de alta conversión con 100/100 en Google PageSpeed.",
          },
          price: "760",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "SEO Técnico y Recuperación de Páginas Caídas",
            description: "Auditoría de indexación, desinfección de malware y velocidad TTFB.",
          },
          price: "190",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Desarrollo de Aplicaciones Móviles Android Nativas",
            description: "Apps en Kotlin moderno con publicación en Google Play Store.",
          },
          price: "1140",
          priceCurrency: "USD",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiciosClient />
    </>
  );
}
