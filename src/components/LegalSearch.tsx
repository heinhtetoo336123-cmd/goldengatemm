import React, { useState, useRef } from 'react';
import { Scale, Search, BookOpen, FileText, Upload, ChevronLeft, ChevronRight, FileCode, Check, Download, AlertTriangle, Eye, Layers } from 'lucide-react';
import { PdfBook, INITIAL_PDF_BOOKS, parsePdfFile } from '../services/pdfService';

export const LegalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfBooks, setPdfBooks] = useState<PdfBook[]>(INITIAL_PDF_BOOKS);
  const [activeBook, setActiveBook] = useState<PdfBook>(INITIAL_PDF_BOOKS[0]);
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      alert('ကျေးဇူးပြု၍ PDF ဖိုင်အမျိုးအစားသာ တင်သွင်းပါရန်။');
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
      alert('PDF စာအုပ် တင်သွင်းစဉ် ဖတ်ရှုရန် အဆင်မပြေပါ။ ဖိုင်အပြည့်အစုံ ဖြစ်ကြောင်း စိစစ်ပါရန်။');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter PDF pages and sections based on search query
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
    ' overstay'
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

  return (
    <div className="space-y-5 pb-24 w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-900 shrink-0" />
              <span>ဥပဒေ စာအုပ်များ နှင့် PDF ရှာဖွေစနစ်</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              လူဝင်မှုကြီးကြပ်ရေး PDF ဥပဒေစာအုပ်များ တင်သွင်းခြင်း နှင့် စာအုပ်များအလိုက် စာပိုဒ်များ တိုက်ရိုက် ရှာဖွေထုတ်ယူခြင်း
            </p>
          </div>

          {/* Upload PDF Law Book Button */}
          <div className="shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>{isUploading ? 'PDF ဖတ်ရှုနေသည်...' : '+ PDF ဥပဒေစာအုပ် ထည့်မည်'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-blue-900 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ဥပဒေ စာအုပ်များထဲမှ ပုဒ်မ သို့မဟုတ် စကားလုံး ရှာဖွေပါ (e.g. ဗီဇာသက်တမ်းလွန်၊ 13(1)၊ Form C)..."
            className="w-full bg-white border-2 border-slate-200 focus:border-blue-900 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none shadow-xs transition"
          />
        </div>

        {/* Quick Sample Queries */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-600 font-bold shrink-0">နမူနာ ရှာဖွေမှု:</span>
          {sampleSearchQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(query)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-blue-900 hover:text-blue-900 shrink-0 transition font-bold text-[11px]"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Summary Box */}
      {searchQuery.trim() && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2 text-xs">
          <div className="flex items-center justify-between font-extrabold text-blue-950">
            <span>ရှာဖွေတွေ့ရှိချက်များ ({searchResults.length})</span>
            <span className="text-[10px] font-bold text-blue-900">PDF Law Search</span>
          </div>

          {searchResults.length === 0 ? (
            <p className="text-slate-700 font-medium">တင်သွင်းထားသော PDF ဥပဒေ စာအုပ်များထဲတွင် "{searchQuery}" နှင့် ကိုက်ညီသော စာပိုဒ် မတွေ့ရှိပါ။</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setActiveBook(res.book);
                    setActivePageNum(res.pageNum);
                  }}
                  className="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-900 transition cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="text-blue-950 font-extrabold">{res.book.titleMM}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-950 font-bold text-[10px]">
                      စာမျက်နှာ ({res.pageNum})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed font-medium">
                    {res.textSnippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PDF Law Books Selector Tabs */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block px-1">
          လက်ရှိ တင်သွင်းထားသော ဥပဒေ စာအုပ်များ ({pdfBooks.length}):
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {pdfBooks.map((book) => {
            const isSelected = activeBook.id === book.id;
            return (
              <button
                key={book.id}
                onClick={() => {
                  setActiveBook(book);
                  setActivePageNum(1);
                }}
                className={`px-3.5 py-2 rounded-xl font-extrabold whitespace-nowrap transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-800 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[150px] truncate">{book.titleMM}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PDF Law Reader & Viewer Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        {/* Book Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-950 font-extrabold text-[10px]">
              {activeBook.category}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1">
              {activeBook.titleMM}
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">{activeBook.title}</p>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActivePageNum(prev => Math.max(1, prev - 1))}
              disabled={activePageNum <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900">
              {activePageNum} / {activeBook.pageCount || activeBook.extractedPages.length || 1}
            </span>
            <button
              onClick={() => setActivePageNum(prev => Math.min(activeBook.pageCount || activeBook.extractedPages.length || 1, prev + 1))}
              disabled={activePageNum >= (activeBook.pageCount || activeBook.extractedPages.length || 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Content Display Area */}
        <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 leading-relaxed font-serif whitespace-pre-line min-h-[220px]">
          {currentPageObj.text}
        </div>

        {/* Action Controls for Extracted Text */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={() => handleCopyPageText(currentPageObj.text)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'ကူးယူပြီးပါပြီ' : 'စာမျက်နှာ စာသား ကူးယူမည်'}</span>
          </button>

          {activeBook.pdfDataUrl && (
            <a
              href={activeBook.pdfDataUrl}
              download={`${activeBook.title}.pdf`}
              className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>PDF ဒေါင်းလုဒ်</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
