import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import {
  Upload, FileText, Image, Trash2, Download, ChevronUp, ChevronDown,
  File, CheckCircle2, AlertCircle, Loader2, Plus, X, GripVertical,
  LayoutGrid, Square
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ── Types ──────────────────────────────────────────────────────────────── */
interface FileItem {
  id: string;
  file: File;
  name: string;
  size: string;
  type: 'image' | 'text' | 'other';
  preview?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMsg?: string;
}

type ImagesPerPage = 1 | 2 | 4 | 6;

/* ── Helpers ────────────────────────────────────────────────────────────── */
const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const getFileType = (file: File): FileItem['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'text/plain') return 'text';
  return 'other';
};

const generateId = () => Math.random().toString(36).substr(2, 9);

/** Load an <img> element from a URL and resolve when ready. */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

/** Returns the [cols, rows] grid for a given imagesPerPage value */
const gridLayout = (ipp: ImagesPerPage): [number, number] => {
  if (ipp === 1) return [1, 1];
  if (ipp === 2) return [1, 2];  // portrait: 1 col, 2 rows
  if (ipp === 4) return [2, 2];
  return [2, 3]; // 6
};

/* ── Layout option cards ────────────────────────────────────────────────── */
const LAYOUT_OPTIONS: { value: ImagesPerPage; label: string; grid: string }[] = [
  { value: 1, label: '1 per page', grid: 'grid-cols-1 grid-rows-1' },
  { value: 2, label: '2 per page', grid: 'grid-cols-1 grid-rows-2' },
  { value: 4, label: '4 per page', grid: 'grid-cols-2 grid-rows-2' },
  { value: 6, label: '6 per page', grid: 'grid-cols-2 grid-rows-3' },
];

/* ── Component ──────────────────────────────────────────────────────────── */
export default function PdfMaker() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [outputName, setOutputName] = useState('my-document');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'a3'>('a4');
  const [margin, setMargin] = useState(10);
  const [imagesPerPage, setImagesPerPage] = useState<ImagesPerPage>(1);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File ingestion ── */
  const addFiles = useCallback((rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles);
    const newItems: FileItem[] = arr.map(file => {
      const type = getFileType(file);
      const item: FileItem = {
        id: generateId(),
        file,
        name: file.name,
        size: formatBytes(file.size),
        type,
        status: 'pending',
      };
      if (type === 'image') {
        item.preview = URL.createObjectURL(file);
      }
      return item;
    });
    setFiles(prev => [...prev, ...newItems]);
    setSuccess(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const moveFile = (id: string, dir: 'up' | 'down') => {
    setFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  /* ── PDF generation ── */
  const generatePDF = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);
    setSuccess(false);
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' })));

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: pageSize });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const usableW = pw - margin * 2;
    const usableH = ph - margin * 2;

    const imageFiles = files.filter(f => f.type === 'image');
    const nonImageFiles = files.filter(f => f.type !== 'image');

    const [cols, rows] = gridLayout(imagesPerPage);
    const cellW = usableW / cols;
    const cellH = usableH / rows;
    const cellPad = 2; // mm gap between cells

    let isFirstPage = true;

    /* ── Render image pages ── */
    for (let chunk = 0; chunk < imageFiles.length; chunk += imagesPerPage) {
      const batch = imageFiles.slice(chunk, chunk + imagesPerPage);

      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;

      for (let b = 0; b < batch.length; b++) {
        const item = batch[b];
        const colIdx = b % cols;
        const rowIdx = Math.floor(b / cols);

        const cellX = margin + colIdx * cellW;
        const cellY = margin + rowIdx * cellH;
        const availW = cellW - cellPad * 2;
        const availH = cellH - cellPad * 2;

        try {
          const img = await loadImage(item.preview!);
          const ratio = img.naturalWidth / img.naturalHeight;
          let imgW = availW;
          let imgH = imgW / ratio;
          if (imgH > availH) { imgH = availH; imgW = imgH * ratio; }
          const x = cellX + cellPad + (availW - imgW) / 2;
          const y = cellY + cellPad + (availH - imgH) / 2;
          const ext = item.file.name.split('.').pop()?.toLowerCase();
          const fmt = (ext === 'jpg' || ext === 'jpeg') ? 'JPEG' : 'PNG';
          pdf.addImage(img, fmt, x, y, imgW, imgH);

          // File name label beneath image (only when >1 per page)
          if (imagesPerPage > 1) {
            pdf.setFontSize(6);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(120);
            const label = item.name.length > 30 ? item.name.slice(0, 27) + '…' : item.name;
            pdf.text(label, x + imgW / 2, y + imgH + 3, { align: 'center' });
            pdf.setTextColor(0);
          }

          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done' } : f));
        } catch {
          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMsg: 'Failed to process' } : f));
        }
      }
    }

    /* ── Render non-image files ── */
    for (const item of nonImageFiles) {
      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;

      if (item.type === 'text') {
        const text = await item.file.text();
        const lines = pdf.splitTextToSize(text, usableW);
        const lineH = 6;
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.name, margin, margin + 5);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        let y = margin + 12;
        for (const line of lines) {
          if (y + lineH > ph - margin) { pdf.addPage(); y = margin + lineH; }
          pdf.text(line, margin, y);
          y += lineH;
        }
      } else {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`File: ${item.name}`, margin, margin + 20);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150);
        pdf.text('(This file type cannot be embedded. Only images and .txt files are fully supported.)', margin, margin + 30, { maxWidth: usableW });
        pdf.setTextColor(0);
      }
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done' } : f));
    }

    pdf.save(`${outputName || 'document'}.pdf`);
    setIsGenerating(false);
    setSuccess(true);
  };

  const fileIconColor: Record<FileItem['type'], string> = {
    image: 'text-brand-cyan',
    text: 'text-brand-purple',
    other: 'text-gray-400',
  };

  const statusIcon = (item: FileItem) => {
    if (item.status === 'processing') return <Loader2 className="w-4 h-4 text-brand-blue animate-spin" />;
    if (item.status === 'done') return <CheckCircle2 className="w-4 h-4 text-brand-green" />;
    if (item.status === 'error') return <AlertCircle className="w-4 h-4 text-red-400" title={item.errorMsg} />;
    return null;
  };

  const imageCount = files.filter(f => f.type === 'image').length;

  return (
    <div className="min-h-screen bg-brand-dark pt-28 pb-20 px-6">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-cyan rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <FileText className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">Free Tool</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-gradient">JPG to PDF Maker</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Drag and drop images or text files — combine, reorder, and download as a single polished PDF. No upload, 100% private.
          </p>
        </motion.div>

        {/* ── Settings ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Output File Name</label>
            <input
              type="text"
              value={outputName}
              onChange={e => setOutputName(e.target.value)}
              placeholder="my-document"
              className="w-full bg-brand-secondary border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none input-glow"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Page Size</label>
            <select
              value={pageSize}
              onChange={e => setPageSize(e.target.value as 'a4' | 'letter' | 'a3')}
              className="w-full bg-brand-secondary border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none input-glow appearance-none cursor-pointer"
            >
              <option value="a4">A4 (210 × 297 mm)</option>
              <option value="letter">Letter (8.5 × 11 in)</option>
              <option value="a3">A3 (297 × 420 mm)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Page Margin ({margin}mm)</label>
            <input
              type="range"
              min={0}
              max={30}
              value={margin}
              onChange={e => setMargin(Number(e.target.value))}
              className="w-full mt-1 accent-brand-cyan"
            />
          </div>
        </motion.div>

        {/* ── Images Per Page Layout Selector ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <LayoutGrid className="w-5 h-5 text-brand-cyan" />
            <div>
              <h3 className="font-bold text-sm">Images Per Page</h3>
              <p className="text-xs text-gray-500 mt-0.5">Choose how many images to pack on each PDF page</p>
            </div>
            {imageCount > 0 && (
              <span className="ml-auto text-xs font-bold text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-full">
                {imageCount} image{imageCount !== 1 ? 's' : ''}
                {' · '}
                {Math.ceil(imageCount / imagesPerPage)} page{Math.ceil(imageCount / imagesPerPage) !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LAYOUT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setImagesPerPage(opt.value)}
                className={cn(
                  'relative rounded-xl p-4 border-2 transition-all duration-200 group flex flex-col items-center gap-3',
                  imagesPerPage === opt.value
                    ? 'border-brand-cyan bg-brand-cyan/10 shadow-[0_0_16px_rgba(34,211,238,0.15)]'
                    : 'border-brand-border bg-brand-secondary/50 hover:border-brand-cyan/40 hover:bg-brand-cyan/5'
                )}
              >
                {/* Mini grid preview */}
                <div className={cn('grid gap-1 w-12 h-12', opt.grid)}>
                  {Array.from({ length: opt.value }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-sm transition-colors',
                        imagesPerPage === opt.value ? 'bg-brand-cyan/50' : 'bg-gray-600/50 group-hover:bg-brand-cyan/30'
                      )}
                    />
                  ))}
                </div>
                <span className={cn(
                  'text-xs font-bold transition-colors',
                  imagesPerPage === opt.value ? 'text-brand-cyan' : 'text-gray-400 group-hover:text-white'
                )}>
                  {opt.label}
                </span>
                {imagesPerPage === opt.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-cyan" />
                )}
              </button>
            ))}
          </div>
          {imagesPerPage > 1 && (
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
              <Square className="w-3 h-3 text-brand-cyan" />
              Images will be arranged in a <span className="text-brand-cyan font-bold">{gridLayout(imagesPerPage)[0]}×{gridLayout(imagesPerPage)[1]}</span> grid with file names shown below each.
            </p>
          )}
        </motion.div>

        {/* ── Drop Zone ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-6',
            isDragging
              ? 'border-brand-cyan bg-brand-cyan/5 scale-[1.01] shadow-[0_0_30px_rgba(34,211,238,0.2)]'
              : 'border-brand-border hover:border-brand-cyan/50 hover:bg-brand-cyan/5'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,text/plain"
            className="hidden"
            onChange={e => e.target.files && addFiles(e.target.files)}
          />
          <div className={cn('w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-all duration-300', isDragging ? 'bg-brand-cyan/20' : 'bg-brand-secondary')}>
            <Upload className={cn('w-8 h-8 transition-colors duration-300', isDragging ? 'text-brand-cyan' : 'text-gray-400')} />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {isDragging ? 'Drop files here!' : 'Drag & Drop files here'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Supports: <span className="text-brand-cyan font-medium">PNG, JPG, JPEG, WebP, GIF</span> and <span className="text-brand-purple font-medium">.txt</span> files
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-brand-cyan font-bold text-sm hover:bg-white/10 transition-colors pointer-events-none">
            <Plus className="w-4 h-4" /> Choose Files
          </div>
        </motion.div>

        {/* ── File List ── */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card overflow-hidden mb-6"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                <h3 className="font-bold text-lg">
                  Files <span className="text-brand-cyan ml-1">{files.length}</span>
                  {imageCount > 0 && (
                    <span className="text-xs text-gray-500 ml-3 font-normal">
                      {imageCount} image{imageCount !== 1 ? 's' : ''} → {Math.ceil(imageCount / imagesPerPage)} page{Math.ceil(imageCount / imagesPerPage) !== 1 ? 's' : ''}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              <div className="divide-y divide-brand-border/50">
                <AnimatePresence>
                  {files.map((item, idx) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.2, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] group"
                    >
                      <GripVertical className="w-4 h-4 text-gray-600 shrink-0 cursor-grab" />

                      {/* Thumbnail / Icon */}
                      <div className="w-12 h-12 rounded-xl bg-brand-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {item.type === 'image' && item.preview ? (
                          <img src={item.preview} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        ) : item.type === 'text' ? (
                          <FileText className={cn('w-6 h-6', fileIconColor[item.type])} />
                        ) : (
                          <File className="w-6 h-6 text-gray-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{item.size}</span>
                          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold uppercase', item.type === 'image' ? 'bg-brand-cyan/10 text-brand-cyan' : item.type === 'text' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-gray-700 text-gray-400')}>{item.type}</span>
                          {item.type === 'image' && imagesPerPage > 1 && (
                            <span className="text-[10px] text-gray-600">page {Math.floor(files.filter((f, fi) => f.type === 'image' && fi <= idx).length / imagesPerPage) + 1}</span>
                          )}
                        </p>
                        {item.status === 'error' && <p className="text-xs text-red-400 mt-0.5">{item.errorMsg}</p>}
                      </div>

                      {/* Status */}
                      <div className="shrink-0">{statusIcon(item)}</div>

                      {/* Reorder + Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => moveFile(item.id, 'up')} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white disabled:opacity-20 transition-all">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveFile(item.id, 'down')} disabled={idx === files.length - 1} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white disabled:opacity-20 transition-all">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeFile(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={generatePDF}
            disabled={files.length === 0 || isGenerating}
            className={cn(
              'flex-1 w-full sm:w-auto py-4 px-8 rounded-full font-black text-lg flex items-center justify-center gap-3 transition-all',
              files.length > 0 && !isGenerating
                ? 'bg-gradient-premium neon-glow-hover text-white cursor-pointer'
                : 'bg-brand-secondary text-gray-500 cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating PDF...</>
            ) : (
              <><Download className="w-5 h-5" /> Generate & Download PDF</>
            )}
          </button>

          <button
            onClick={() => inputRef.current?.click()}
            className="w-full sm:w-auto py-4 px-8 rounded-full glass font-bold text-lg hover:bg-white/10 hover:text-brand-cyan transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add More Files
          </button>
        </motion.div>

        {/* ── Success toast ── */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 flex items-center gap-3 bg-brand-green/10 border border-brand-green/30 rounded-2xl px-6 py-4"
            >
              <CheckCircle2 className="w-6 h-6 text-brand-green shrink-0" />
              <div>
                <p className="font-bold text-brand-green">PDF downloaded successfully!</p>
                <p className="text-sm text-gray-400">Check your downloads folder for <span className="font-mono">{outputName}.pdf</span></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Info cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: Image, title: '100% Private', desc: 'Files never leave your browser. Everything is processed locally on your device.', color: 'text-brand-cyan' },
            { icon: LayoutGrid, title: 'Flexible Layout', desc: 'Choose 1, 2, 4, or 6 images per page. Perfect for photo sheets, portfolios, or collages.', color: 'text-brand-purple' },
            { icon: Download, title: 'Instant Download', desc: 'No sign-up needed. Click generate and your PDF downloads in seconds.', color: 'text-brand-green' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <card.icon className={cn('w-8 h-8 mx-auto mb-3', card.color)} />
              <h4 className="font-bold mb-1">{card.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
