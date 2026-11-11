import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Scissors,
  Layers,
  Image as ImageIcon,
  Loader2,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { getAssetUrl } from '../../utils/assets';

const CATEGORIES = [
  { id: 'fades', label: 'Fades' },
  { id: 'freestyle', label: 'Freestyle' },
  { id: 'premium', label: 'Premium & Barba' },
  { id: 'colorimetria', label: 'Colorimetría' }
];

export default function AdminPortfolioManager({ services = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('fades');
  const [tag, setTag] = useState('FADE DE AUTOR');
  const [serviceId, setServiceId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const res = await api.getPortfolio();
      setItems(res.items || []);
    } catch (err) {
      console.error('Error cargando portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setTitle('');
    setSubtitle('');
    setCategory('fades');
    setTag('FADE DE AUTOR');
    setServiceId(services[0]?.id || 'corte');
    setFeatured(false);
    setImagePreview('');
    setImageUrl('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setSubtitle(item.subtitle || '');
    setCategory(item.category || 'fades');
    setTag(item.tag || 'FADE DE AUTOR');
    setServiceId(item.service_id || item.serviceId || '');
    setFeatured(Boolean(item.featured));
    const src = item.src || (item.image_url ? getAssetUrl(item.image_url) : '');
    setImagePreview(src);
    setImageUrl(item.image_url || '');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('El archivo debe ser una imagen (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setImagePreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Ingresá un título para el corte.');
      return;
    }
    if (!imagePreview && !imageUrl.trim()) {
      setErrorMsg('Subí una fotografía del corte o indicá una URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        tag: tag.trim().toUpperCase(),
        service_id: serviceId || null,
        featured,
        image_data: imagePreview.startsWith('data:image/') ? imagePreview : undefined,
        image_url: !imagePreview.startsWith('data:image/') ? (imageUrl || imagePreview) : undefined
      };

      if (editingItem) {
        await api.updatePortfolioItem(editingItem.id, payload);
        setSuccessMsg('Corte actualizado exitosamente.');
      } else {
        await api.createPortfolioItem(payload);
        setSuccessMsg('¡Nuevo corte subido al portfolio!');
      }

      await loadPortfolio();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo guardar el corte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Querés eliminar "${item.title}" del portfolio?`)) return;
    try {
      await api.deletePortfolioItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert(err.message || 'No se pudo eliminar el corte.');
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-6 animate-enter">
      {/* Top Header Card */}
      <div className="p-6 rounded-xl bg-[#141416] card-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E5C378] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E5C378]">
              Galería de Autor · David
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDEDED] flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#E5C378]" />
            <span>Portfolio de Cortes</span>
          </h2>
          <p className="text-xs text-[#8A898E] mt-1">
            Subí fotos desde tu celular de los mejores cortes realizados en el sillón privado.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="px-5 py-3 rounded-lg bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-[0_0_20px_-3px_rgba(229,195,120,0.35)] transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Subir nuevo corte</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
            activeCategory === 'all'
              ? 'bg-[#E5C378] text-[#0D0D0F] font-bold shadow-md'
              : 'bg-[#141416] text-[#8A898E] hover:text-[#EDEDED] border border-white/[0.06]'
          }`}
        >
          Todos ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#E5C378] text-[#0D0D0F] font-bold shadow-md'
                  : 'bg-[#141416] text-[#8A898E] hover:text-[#EDEDED] border border-white/[0.06]'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid of Portfolio Cuts */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#8A898E] uppercase tracking-wider flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#E5C378]" />
          <span>Cargando cortes del portfolio...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141416] card-hairline space-y-3">
          <ImageIcon className="w-10 h-10 text-[#8A898E] mx-auto opacity-40" />
          <h3 className="text-base font-display font-bold text-[#EDEDED]">
            No hay cortes cargados en esta categoría
          </h3>
          <p className="text-xs text-[#8A898E] max-w-sm mx-auto">
            Hacé clic en "Subir nuevo corte" para agregar fotografías desde tu celular o computadora.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const imgSrc = item.src || (item.image_url ? getAssetUrl(item.image_url) : '');
            const matchingService = services.find((s) => s.id === (item.service_id || item.serviceId));

            return (
              <div
                key={item.id}
                className="group rounded-xl overflow-hidden bg-[#141416] card-hairline flex flex-col justify-between transition-all duration-300 hover:border-[#E5C378]/40 shadow-lg"
              >
                {/* Photo Preview Container */}
                <div className="relative aspect-[4/3] sm:aspect-[4/5] bg-black overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded bg-[#0D0D0F]/80 backdrop-blur-md border border-white/[0.1] text-[9px] font-mono uppercase tracking-[0.15em] text-[#E5C378] font-bold">
                      {item.tag || 'CORTE DE AUTOR'}
                    </span>
                    {item.featured ? (
                      <span className="px-2 py-0.5 rounded bg-[#E5C378] text-[#0D0D0F] text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Sparkles className="w-2.5 h-2.5" />
                        Destacado
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Content & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-display font-bold text-[#EDEDED] leading-snug">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-[#8A898E] mt-1 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#A0A0A5] truncate max-w-[140px]">
                      {matchingService ? `✂️ ${matchingService.name}` : `🏷️ ${item.category}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-[#8A898E] hover:text-[#EDEDED] transition-colors"
                        title="Editar corte"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-[#8A898E] hover:text-red-400 transition-colors"
                        title="Eliminar del portfolio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Subir / Editar Corte */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
          <div className="w-full max-w-lg rounded-2xl bg-[#141416] border border-white/[0.12] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-lg font-display font-bold text-[#EDEDED] flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#E5C378]" />
                <span>{editingItem ? 'Editar Corte de Portfolio' : 'Subir Nuevo Corte'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-[#8A898E] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Picker */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A5] block">
                  Foto del Corte *
                </label>

                {imagePreview ? (
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/[0.1] group">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-mono uppercase flex items-center gap-1.5 backdrop-blur-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Cambiar foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageUrl('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/40 text-red-300 text-xs font-mono uppercase flex items-center gap-1.5 backdrop-blur-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/[0.15] hover:border-[#E5C378]/50 rounded-xl p-8 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#18181B] border border-white/[0.08] flex items-center justify-center text-[#E5C378] mx-auto">
                      <Camera className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <strong className="text-sm text-[#EDEDED] font-display block">
                        Subir foto desde la galería o cámara
                      </strong>
                      <span className="text-xs text-[#8A898E]">
                        Tocá acá para seleccionar una foto de tu celular o PC (JPG, PNG)
                      </span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>

              {/* Título */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A5] block">
                  Título del corte *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: High Fade Comprimido & Barba"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0B0C] border border-white/[0.1] text-[#EDEDED] text-xs font-mono focus:border-[#E5C378] focus:outline-none"
                  required
                />
              </div>

              {/* Subtítulo / Descripción */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A5] block">
                  Descripción o técnica
                </label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ej: Degradado quirúrgico a navaja con textura superior y perfilado milimétrico."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0B0C] border border-white/[0.1] text-[#EDEDED] text-xs font-mono focus:border-[#E5C378] focus:outline-none resize-none"
                />
              </div>

              {/* Categoría y Tag en 2 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A5] block">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0B0B0C] border border-white/[0.1] text-[#EDEDED] text-xs font-mono focus:border-[#E5C378] focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A5] block">
                    Etiqueta (Badge)
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Ej: FADE DE AUTOR"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0B0C] border border-white/[0.1] text-[#EDEDED] text-xs font-mono uppercase focus:border-[#E5C378] focus:outline-none"
                  />
                </div>
              </div>

              {/* Servicio vinculado */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A0A0A5] block">
                  Servicio para reserva directa
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0B0B0C] border border-white/[0.1] text-[#EDEDED] text-xs font-mono focus:border-[#E5C378] focus:outline-none"
                >
                  <option value="">Ninguno / Sólo exhibición</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} (${Number(svc.price).toLocaleString('es-AR')})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#8A898E]">
                  Al tocar "Quiero este corte", el cliente será llevado a reservar este servicio automáticamente.
                </p>
              </div>

              {/* Destacado Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0B0C] border border-white/[0.08]">
                <div>
                  <strong className="text-xs text-[#EDEDED] block">Marcar como corte destacado</strong>
                  <span className="text-[10px] text-[#8A898E]">Aparecerá en los primeros lugares con insignia dorada.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatured(!featured)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    featured ? 'bg-[#E5C378]' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#0D0D0F] absolute top-0.5 transition-transform ${
                      featured ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-white/[0.1] hover:bg-white/[0.04] text-[#8A898E] hover:text-[#EDEDED] text-xs font-mono uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-[#E5C378] hover:bg-[#F3E5AB] text-[#0D0D0F] font-mono font-bold text-xs uppercase tracking-[0.14em] flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Guardar Cambios' : 'Subir Corte'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
