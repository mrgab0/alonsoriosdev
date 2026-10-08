"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle, XCircle, Save, X, Eye, Lock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = lazy(() => import("./MDWrapper"));

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  mediumUrl?: string;
  devtoUrl?: string;
  hashnodeUrl?: string;
  steemUrl?: string;
  crosspostMedium?: boolean;
  crosspostDevTo?: boolean;
  crosspostHashnode?: boolean;
  crosspostSteem?: boolean;
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
  crosspostMedium: false,
  crosspostDevTo: false,
  crosspostHashnode: false,
  crosspostSteem: false,
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json.success) {
          return { success: true, url: json.url, name: file.name };
        }
        return { success: false, error: json.error };
      });

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (failedUploads.length > 0) {
        alert(`Hubo error al subir ${failedUploads.length} imágenes.`);
      }

      if (successfulUploads.length > 0) {
        if (isCover) {
          setEditingPost(prev => prev ? { ...prev, coverImage: successfulUploads[0].url } : null);
        } else {
          const markdownToAppend = successfulUploads.map(r => `\n![${r.name}](${r.url})\n`).join("");
          
          setEditingPost(prev => {
            if (!prev) return prev;
            let newContent = prev.content;
            if (contentTextareaRef.current) {
              const textarea = contentTextareaRef.current;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const before = newContent.substring(0, start);
              const after = newContent.substring(end);
              newContent = before + markdownToAppend + after;
            } else {
              newContent += markdownToAppend;
            }
            return { ...prev, content: newContent };
          });
        }
      }
    } catch (err) {
      alert("Error subiendo imágenes");
    }
    setUploadingImage(false);
    
    // Limpiar input para permitir subir la misma imagen si se desea de nuevo
    e.target.value = "";
  };

  const handleInsertLockedSnippet = () => {
    if (!editingPost) return;
    const snippet = `\n\n::locked{type="email" title="Déjame tu email para desbloquear este recurso"}\nAquí va el contenido secreto, descargas o código fuente...\n::\n\n`;
    
    let newContent = editingPost.content;
    if (contentTextareaRef.current) {
      const textarea = contentTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = newContent.substring(0, start);
      const after = newContent.substring(end);
      newContent = before + snippet + after;
    } else {
      newContent += snippet;
    }
    setEditingPost({ ...editingPost, content: newContent });
  };

  const handleInsertReadMoreSnippet = () => {
    if (!editingPost) return;
    const snippet = `\n\n::locked_rest{type="youtube" title="Suscríbete a YouTube para leer la Parte 2"}::\n\n`;
    
    let newContent = editingPost.content;
    if (contentTextareaRef.current) {
      const textarea = contentTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = newContent.substring(0, start);
      const after = newContent.substring(end);
      newContent = before + snippet + after;
    } else {
      newContent += snippet;
    }
    setEditingPost({ ...editingPost, content: newContent });
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
              <label className="block text-sm font-semibold text-white font-bold mb-1">Ttulo</label>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none placeholder-white placeholder-opacity-100 font-bold"
                placeholder="El ttulo de tu artculo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white font-bold mb-1">URL amigable (Slug)</label>
              <input
                type="text"
                value={editingPost.slug}
                onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none placeholder-white placeholder-opacity-100 font-bold"
                placeholder="mi-articulo-genial (Opcional, se autogenera)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white font-bold mb-1">Resumen (Excerpt)</label>
            <textarea
              value={editingPost.excerpt}
              onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
              className="w-full bg-[#0a1120] border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none h-20 placeholder-white placeholder-opacity-100 font-bold"
              placeholder="Breve descripcin de qu trata el artculo..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold text-white font-bold">Imagen de Portada</label>
            <div className="flex gap-4 items-center">
              {editingPost.coverImage && (
                <img src={editingPost.coverImage} alt="Cover" className="w-32 h-20 object-cover rounded-lg border border-gray-700" />
              )}
              <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                <ImageIcon className="w-4 h-4" />
                {uploadingImage ? "Subiendo..." : "Subir a GitHub"}
                <input type="file" accept="image/*" className="hidden placeholder-white placeholder-opacity-100 font-bold" onChange={(e) => handleUploadImage(e, true)} disabled={uploadingImage} />
              </label>
              <input
                type="text"
                value={editingPost.coverImage}
                onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                className="flex-1 bg-[#0a1120] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-amber-400 focus:outline-none placeholder-white placeholder-opacity-100 font-bold"
                placeholder="O pega la URL de Medium/Hashnode aqu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-800">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Visibilidad Original</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                  className="w-4 h-4 accent-amber-400"
                />
                <label htmlFor="published" className="text-sm text-white font-bold cursor-pointer">
                  Artculo Pblico (Visible en alonsorios.dev)
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white mb-2">Sindicacin Mgica (Crossposting)</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-devto"
                    checked={editingPost.crosspostDevTo}
                    disabled={!!editingPost.devtoUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostDevTo: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-devto" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Dev.to {editingPost.devtoUrl && "(Ya clonado)"}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-medium"
                    checked={editingPost.crosspostMedium}
                    disabled={!!editingPost.mediumUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostMedium: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-medium" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Medium {editingPost.mediumUrl && "(Ya clonado)"}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-hashnode"
                    checked={editingPost.crosspostHashnode}
                    disabled={!!editingPost.hashnodeUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostHashnode: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-hashnode" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Hashnode {editingPost.hashnodeUrl && "(Ya clonado)"}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cp-steem"
                    checked={editingPost.crosspostSteem}
                    disabled={!!editingPost.steemUrl}
                    onChange={(e) => setEditingPost({ ...editingPost, crosspostSteem: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <label htmlFor="cp-steem" className="text-sm text-white font-bold cursor-pointer">
                    Clonar a Steem {editingPost.steemUrl && "(Ya clonado)"}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800" data-color-mode="dark">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-white font-bold">Contenido (Visual Markdown)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleInsertLockedSnippet}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition"
                >
                  <Lock className="w-4 h-4" /> Insertar Bloqueo (Paywall)
                </button>
                <button
                  type="button"
                  onClick={handleInsertReadMoreSnippet}
                  className="bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition"
                >
                  <Lock className="w-4 h-4" /> Bloquear Resto (Leer Más)
                </button>
                <label className="cursor-pointer bg-amber-400 hover:bg-amber-500 text-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition">
                  <ImageIcon className="w-4 h-4" />
                  {uploadingImage ? "Subiendo..." : "Subir a GitHub y Copiar Link"}
                  <input type="file" accept="image/*" multiple className="hidden placeholder-white placeholder-opacity-100 font-bold" onChange={(e) => handleUploadImage(e, false)} disabled={uploadingImage} />
                </label>
              </div>
            </div>
            {uploadingImage && (
              <div className="mb-2 text-xs text-amber-400 bg-amber-400/10 p-2 rounded border border-amber-400/20">
                La imagen se está subiendo... el link se insertará donde esté tu cursor.
              </div>
            )}
            <Suspense fallback={<div className="h-[500px] bg-[#0a1120] text-white font-bold p-4 border border-gray-700 rounded-lg flex items-center justify-center placeholder-white placeholder-opacity-100 font-bold">Cargando editor visual...</div>}>
              <MDEditor
                value={editingPost.content}
                onChange={(val: string | undefined) => setEditingPost({ ...editingPost, content: val || "" })}
                height={500}
                preview="edit"
                className="w-full bg-[#0a1120] border border-gray-700 rounded-lg overflow-hidden"
              />
            </Suspense>
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
          <p className="text-white font-bold">Gestiona tus artculos y cross-posting</p>
        </div>
        <button
          onClick={() => setEditingPost({ ...emptyPost })}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Artculo
        </button>
      </div>

      <div className="bg-[#121b2d] border border-gray-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-[#0a1120] border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold">Artculo</th>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold">Estado</th>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold">Fecha</th>
              <th className="px-6 py-4 text-sm font-bold text-white font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-white font-bold">
                  No tienes ningn artculo publicado.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr 
                  key={post._id} 
                  onClick={() => setEditingPost(post)}
                  className="border-b border-gray-800 hover:bg-white/5 transition cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-white mb-1">{post.title}</div>
                    <div className="text-xs text-white font-bold truncate max-w-md">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-gray-500/10 text-white font-bold text-xs font-bold px-2.5 py-1 rounded-full border border-gray-500/20">
                        <Eye className="w-3.5 h-3.5" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-bold">
                    {post.createdAt ? format(new Date(post.createdAt), "dd MMM yyyy", { locale: es }) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingPost(post); }}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); post._id && handleDelete(post._id); }}
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
