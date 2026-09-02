"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Plus, CheckCircle, UserCheck } from "lucide-react";

interface ReviewItem {
  authorName: string;
  authorRole: string;
  serviceType: string;
  rating: number;
  comment: string;
}

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [service, setService] = useState("Diseño Web");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setReviews(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: name,
          authorRole: role || "Cliente",
          serviceType: service,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews([
          {
            authorName: name,
            authorRole: role || "Cliente",
            serviceType: service,
            rating,
            comment,
          },
          ...reviews,
        ]);
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setName("");
          setComment("");
        }, 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <section id="opiniones" className="py-16 md:py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <Star className="w-4 h-4 fill-current text-amber-500" />
              <span>Opiniones 100% Reales</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Lo que dicen mis clientes y alumnos
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 mt-2">
              La reputación se construye con trabajo bien hecho, transparencia y atención cercana.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-xl transition text-sm flex items-center gap-2 shrink-0 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Dejar mi Opinión</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                    {r.serviceType}
                  </span>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic mb-6">
                  "{r.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {r.authorName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {r.authorName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{r.authorRole}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding review */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Escribir una Opinión
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Tu testimonio me ayuda a seguir ofreciendo el mejor servicio posible.
              </p>

              {!submitted ? (
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                      Tu Ocupación o Empresa
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Dueño de Restaurante"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                      Valoración (Estrellas)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                      Tu Opinión o Comentario
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Escribe tu experiencia trabajando con Alonso..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                    >
                      Publicar Opinión
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    ¡Gracias por tu opinión!
                  </h4>
                  <p className="text-xs text-slate-500">Se ha guardado correctamente.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
