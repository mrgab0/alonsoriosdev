"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle, XCircle, Save, X, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const emptyPost: BlogPost = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  published: false,
};

export default function BlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (json.success) setPosts(json.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPost) return;
    setSaving(true);
    try {
      const isNew = !editingPost._id;
      const res = await fetch("/api/admin/blog", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost),
      });
      const json = await res.json();
      if (json.success) {
        setEditingPost(null);
        fetchPosts();
      } else {
        alert("Error: " + json.error);
      }
    } catch (err) {
      alert("Error saving post");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar este post?")) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        const imageUrl = json.url;
        
        if (isCover) {
          setEditingPost(prev => prev ? { ...prev, coverImage: imageUrl } : null);
        } else {
          // Insert markdown image at cursor position
          if (contentTextareaRef.current && editingPost) {
            const textarea = contentTextareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = editingPost.content;
            const before = text.substring(0, start);
            const after = text.substring(end);
            const markdownImage = `\n![${file.name}](${imageUrl})\n`;
            
            setEditingPost({
              ...editingPost,
              content: before + markdownImage + after
            });
          }
        }
      } else {
        alert("Error subiendo imagen: " + json.error);
      }
    } catch (err) {
      alert("Error subiendo imagen");
    }
    setUploadingImage(false);
  };

  if (loading && !editingPost) {
    return <div className="p-8 text-white">Cargando posts...</div>;
  }

  if (editingPost) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-amber-400">
            {editingPost._id ? "Editar Post" : "Nuevo Post"}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingPost(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-lg flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        <div className="bg-[#121b2d] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">Ttulo</label>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none"
                placeholder="El ttulo de tu artculo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-1">URL amigable (Slug)</label>
              <input
                type="text"
                value={editingPost.slug}
                onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none"
                placeholder="mi-articulo-genial (Opcional, se autogenera)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Resumen (Excerpt)</label>
            <textarea
              value={editingPost.excerpt}
              onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
              className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none h-20"
              placeholder="Breve descripcin de qu trata el artculo..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold text-gray-400">Imagen de Portada</label>
            <div className="flex gap-4 items-center">
              {editingPost.coverImage && (
                <img src={editingPost.coverImage} alt="Cover" className="w-32 h-20 object-cover rounded-lg border border-gray-700" />
              )}
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                <ImageIcon className="w-4 h-4" />
                {uploadingImage ? "Subiendo..." : "Subir a GitHub"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, true)} disabled={uploadingImage} />
              </label>
              <input
                type="text"
                value={editingPost.coverImage}
                onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                className="flex-1 bg-[#0a1120] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-amber-400 focus:outline-none"
                placeholder="O pega la URL de Medium/Hashnode aqu"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="published"
              checked={editingPost.published}
              onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
              className="w-4 h-4 accent-amber-400"
            />
            <label htmlFor="published" className="text-sm text-gray-300 cursor-pointer">
              Artculo Pblico (Visible en el blog)
            </label>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-400">Contenido (Markdown)</label>
              <label className="cursor-pointer bg-amber-400 hover:bg-amber-500 text-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition">
                <ImageIcon className="w-4 h-4" />
                {uploadingImage ? "Subiendo..." : "Insertar Imagen"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, false)} disabled={uploadingImage} />
              </label>
            </div>
            <textarea
              ref={contentTextareaRef}
              value={editingPost.content}
              onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
              className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-4 text-white focus:border-amber-400 focus:outline-none font-mono text-sm min-h-[400px]"
              placeholder="# Ttulo Nivel 1&#10;Escribe aqu tu artculo usando Markdown..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-amber-400 mb-2">Blog Admin</h1>
          <p className="text-gray-400">Gestiona tus artculos y cross-posting</p>
        </div>
        <button
          onClick={() => setEditingPost({ ...emptyPost })}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Artculo
        </button>
      </div>

      <div className="bg-[#121b2d] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0a1120] border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-400">Artculo</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-400">Estado</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-400">Fecha</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No tienes ningn artculo publicado.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="border-b border-gray-800 hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white mb-1">{post.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-md">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-gray-500/10 text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-500/20">
                        <Eye className="w-3.5 h-3.5" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {post.createdAt ? format(new Date(post.createdAt), "dd MMM yyyy", { locale: es }) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => post._id && handleDelete(post._id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
