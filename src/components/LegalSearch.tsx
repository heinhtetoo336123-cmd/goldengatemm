import React, { useState, useRef } from 'react';
import { Scale, Search, BookOpen, FileText, Upload, ChevronLeft, ChevronRight, Check, Download, AlertTriangle, X } from 'lucide-react';
import { PdfBook, INITIAL_PDF_BOOKS, parsePdfFile } from '../services/pdfService';

export const LegalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfBooks, setPdfBooks] = useState<PdfBook[]>(INITIAL_PDF_BOOKS);
  const [activeBook, setActiveBook] = useState<PdfBook>(INITIAL_PDF_BOOKS[0]);
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorBanner(null);

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setErrorBanner('PDF ဖိုင်သာ ရွေးချယ်ပါ။');
      return;
    }

    setIsUploading(true);
    try {
      const parsedBook = await parsePdfFile(file);
      setPdfBooks(prev => [parsedBook, ...prev]);
      setActiveBook(parsedBook);
      setActivePageNum(1);
    } catch (err) {
      console.error('PDF Upload Error:', err);
      setErrorBanner('PDF ဖတ်ရှုမရပါ။');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const searchResults: { book: PdfBook; pageNum: number; textSnippet: string }[] = [];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    pdfBooks.forEach(book => {
      book.extractedPages.forEach(p => {
        if (p.text.toLowerCase().includes(q)) {
          searchResults.push({
            book,
            pageNum: p.pageNum,
            textSnippet: p.text
          });
        }
      });
    });
  }

  const sampleSearchQueries = [
    'ဗီဇာသက်တမ်းလွန်',
    'ပုဒ်မ ၁၃(၁)',
    'Form C',
    'နိုင်ငံကူးလက်မှတ်',
    'overstay'
  ];

  const currentPageObj = activeBook.extractedPages.find(p => p.pageNum === activePageNum) || {
    pageNum: activePageNum,
    text: 'အကြောင်းအရာ မရှိသေးပါ။'
  };

  const handleCopyPageText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const totalPages = activeBook.pageCount || activeBook.extractedPages.length || 1;

  return (
    <div className="space-y-5 pb-28 w-full max-w-4xl mx-auto overflow-x-hidden">
      {/* iOS 27 Large Title & Upload Header */}
      <div className="flex items-center justify-between gap-3 pt-1 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ဥပဒေ စာအုပ်များ
        </h1>

        <div className="shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition ios-press whitespace-nowrap disabled:opacity-50"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span>{isUploading ? 'ဖတ်နေသည်...' : 'PDF ထည့်မည်'}</span>
          </button>
        </div>
      </div>

      {/* Inline Error Banner */}
      {errorBanner && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60"
            aria-label="ပိတ်မည်"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar & Quick Queries */}
      <div className="ios-grouped-card p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ပုဒ်မ သို့မဟုတ် စကားလုံး ရှာဖွေပါ (e.g. 13(1)၊ Form C)..."
            className="w-full min-h-[44px] bg-slate-100/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              aria-label="ရှာဖွေမှု ရှင်းမည်"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
          {sampleSearchQueries.map((query, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSearchQuery(query)}
              className="min-h-[32px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-zinc-200 hover:text-blue-700 dark:hover:text-blue-300 shrink-0 transition font-semibold text-[11px] whitespace-nowrap ios-press"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="ios-grouped-card p-4 space-y-3 border-blue-200/80 dark:border-blue-900/50">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span>တွေ့ရှိချက် ({searchResults.length})</span>
          </div>

          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
              မတွေ့ရှိပါ
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-56 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveBook(res.book);
                    setActivePageNum(res.pageNum);
                  }}
                  className="w-full text-left py-3 px-2 hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-xl transition space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className="text-blue-800 dark:text-blue-300 truncate">{res.book.titleMM}</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 shrink-0 tabular-nums-clean">
                      စာမျက်နှာ {res.pageNum}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {res.textSnippet}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
            ဥပဒေ စာအုပ်များ ({pdfBooks.length})
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {pdfBooks.map((book) => {
            const isSelected = activeBook.id === book.id;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => {
                  setActiveBook(book);
                  setActivePageNum(1);
                }}
                className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition shrink-0 flex items-center gap-2 ios-press ${
                  isSelected
                    ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="max-w-[180px] truncate">{book.titleMM}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reader Card */}
      <div className="ios-grouped-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-700 dark:text-blue-400">
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span>{activeBook.category}</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
              {activeBook.titleMM}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
              {activeBook.title}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto bg-slate-100 dark:bg-zinc-800/90 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActivePageNum(prev => Math.max(1, prev - 1))}
              disabled={activePageNum <= 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition"
              aria-label="ယခင်စာမျက်နှာ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900 dark:text-white px-2.5 tabular-nums-clean">
              {activePageNum} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setActivePageNum(prev => Math.min(totalPages, prev + 1))}
              disabled={activePageNum >= totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition"
              aria-label="နောက်စာမျက်နှာ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 leading-relaxed whitespace-pre-line min-h-[240px]">
          {currentPageObj.text}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleCopyPageText(currentPageObj.text)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 transition ios-press"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <FileText className="w-4 h-4" />}
            <span>{copiedText ? 'ကူးယူပြီး' : 'ကူးယူမည်'}</span>
          </button>

          {activeBook.pdfDataUrl && (
            <a
              href={activeBook.pdfDataUrl}
              download={`${activeBook.title}.pdf`}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition ios-press"
            >
              <Download className="w-4 h-4" />
              <span>PDF ဒေါင်းလုဒ်</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
