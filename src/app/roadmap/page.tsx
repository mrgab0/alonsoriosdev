import { Metadata } from "next";
import RoadmapClient from "./RoadmapClient";

export const metadata: Metadata = {
  title: "Roadmap de Ingeniería & Mirror de Repositorios | Alonso Ríos",
  description:
    "Transparencia radical: monitor en vivo de los proyectos en los que Alonso Ríos trabaja día a día, sincronizado con la actividad oficial de GitHub (@mrgab0), roadmap de productos y bitácora técnica.",
  openGraph: {
    title: "Roadmap & Actividad en Vivo de Alonso Ríos",
    description:
      "Explora en qué está trabajando Alonso Ríos hoy: repositorios en desarrollo, hitos completados y bitácora de ingeniería en tiempo real.",
    url: "https://www.alonsorios.dev/roadmap",
    type: "website",
  },
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
