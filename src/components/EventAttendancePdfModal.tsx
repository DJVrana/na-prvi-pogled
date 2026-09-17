import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Loader2,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import type { EventData, Prijava } from '../pages/AdminDashboard';

interface EventAttendancePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  prijave: Prijava[];
}

type FilterType = 'accepted' | 'valid' | 'all';
type SortType = 'gender' | 'name' | 'date';

export const EventAttendancePdfModal: React.FC<EventAttendancePdfModalProps> = ({
  isOpen,
  onClose,
  event,
  prijave
}) => {
  const [filterType, setFilterType] = useState<FilterType>('accepted');
  const [sortType, setSortType] = useState<SortType>('gender');
  const [showContact, setShowContact] = useState<boolean>(true);
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const printContentRef = useRef<HTMLDivElement>(null);

  // Filter prijave based on selection
  const filteredPrijave = useMemo(() => {
    return prijave.filter(p => {
      if (filterType === 'accepted') {
        return p.status === 'accepted';
      }
      if (filterType === 'valid') {
        return p.status === 'accepted' || p.status === 'pending' || !p.status;
      }
      return true; // 'all'
    });
  }, [prijave, filterType]);

  // Statistics
  const femaleList = useMemo(() => {
    return filteredPrijave.filter(p => p.spol === 'Ž' || p.spol === 'Z' || p.spol?.toLowerCase() === 'žensko');
  }, [filteredPrijave]);

  const maleList = useMemo(() => {
    return filteredPrijave.filter(p => p.spol === 'M' || p.spol?.toLowerCase() === 'muško');
  }, [filteredPrijave]);

  // Sort participant lists
  const sortParticipants = useCallback((list: Prijava[]) => {
    const copy = [...list];
    if (sortType === 'name') {
      return copy.sort((a, b) => a.imePrezime.localeCompare(b.imePrezime, 'hr'));
    }
    if (sortType === 'date') {
      return copy.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
    }
    // Default or within gender groups, sort alphabetically
    return copy.sort((a, b) => a.imePrezime.localeCompare(b.imePrezime, 'hr'));
  }, [sortType]);

  const sortedUnifiedList = useMemo(() => {
    return sortParticipants(filteredPrijave);
  }, [filteredPrijave, sortParticipants]);

  const sortedFemaleList = useMemo(() => {
    return sortParticipants(femaleList);
  }, [femaleList, sortParticipants]);

  const sortedMaleList = useMemo(() => {
    return sortParticipants(maleList);
  }, [maleList, sortParticipants]);

  // Export to PDF via direct html2canvas-pro + jsPDF with natural page breaks
  const handleDownloadPdf = async () => {
    if (!printContentRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = printContentRef.current;
      const containerRect = element.getBoundingClientRect();

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const cloned = clonedDoc.querySelector<HTMLElement>('[data-pdf-content]');
          if (cloned) {
            cloned.style.boxShadow = 'none';
            cloned.style.border = 'none';
            cloned.style.borderRadius = '0';
          }
        }
      });

      // A4 portrait ratio: 297 / 210 = ~1.4142857
      const a4Ratio = 297 / 210;
      const pageCanvasHeight = Math.round(canvas.width * a4Ratio);

      // Coordinate scaling from DOM to canvas (scale: 2)
      const scaleY = canvas.height / containerRect.height;

      // Identify all unbreakable elements (rows, titles, header, cards, notes)
      const rows = Array.from(element.querySelectorAll<HTMLElement>('tbody tr'));
      const sectionTitles = Array.from(element.querySelectorAll<HTMLElement>('.section-title'));
      const footerNotes = element.querySelector<HTMLElement>('.footer-notes');
      const headerBar = element.querySelector<HTMLElement>('.header-bar');
      const metaCard = element.querySelector<HTMLElement>('.meta-card');
      const statsBar = element.querySelector<HTMLElement>('.stats-bar');

      interface BreakableItem {
        el: HTMLElement;
        top: number;
        bottom: number;
        height: number;
        isTableRow: boolean;
        isSectionTitle: boolean;
        isFooterNotes: boolean;
        tableTheadTop?: number;
        tableTheadHeight?: number;
        sectionTitleText?: string;
      }

      const breakableItems: BreakableItem[] = [];

      if (headerBar) {
        const r = headerBar.getBoundingClientRect();
        breakableItems.push({
          el: headerBar,
          top: (r.top - containerRect.top) * scaleY,
          bottom: (r.bottom - containerRect.top) * scaleY,
          height: r.height * scaleY,
          isTableRow: false,
          isSectionTitle: false,
          isFooterNotes: false
        });
      }

      if (metaCard) {
        const r = metaCard.getBoundingClientRect();
        breakableItems.push({
          el: metaCard,
          top: (r.top - containerRect.top) * scaleY,
          bottom: (r.bottom - containerRect.top) * scaleY,
          height: r.height * scaleY,
          isTableRow: false,
          isSectionTitle: false,
          isFooterNotes: false
        });
      }

      if (statsBar) {
        const r = statsBar.getBoundingClientRect();
        breakableItems.push({
          el: statsBar,
          top: (r.top - containerRect.top) * scaleY,
          bottom: (r.bottom - containerRect.top) * scaleY,
          height: r.height * scaleY,
          isTableRow: false,
          isSectionTitle: false,
          isFooterNotes: false
        });
      }

      sectionTitles.forEach(sec => {
        const r = sec.getBoundingClientRect();
        breakableItems.push({
          el: sec,
          top: (r.top - containerRect.top) * scaleY,
          bottom: (r.bottom - containerRect.top) * scaleY,
          height: r.height * scaleY,
          isTableRow: false,
          isSectionTitle: true,
          isFooterNotes: false,
          sectionTitleText: sec.textContent?.trim()
        });
      });

      rows.forEach(row => {
        const r = row.getBoundingClientRect();
        const table = row.closest('table');
        const thead = table?.querySelector('thead');
        let tableTheadTop: number | undefined;
        let tableTheadHeight: number | undefined;

        if (thead) {
          const theadR = thead.getBoundingClientRect();
          tableTheadTop = (theadR.top - containerRect.top) * scaleY;
          tableTheadHeight = theadR.height * scaleY;
        }

        const parentDiv = table?.parentElement;
        const secTitle = parentDiv?.querySelector('.section-title');

        breakableItems.push({
          el: row,
          top: (r.top - containerRect.top) * scaleY,
          bottom: (r.bottom - containerRect.top) * scaleY,
          height: r.height * scaleY,
          isTableRow: true,
          isSectionTitle: false,
          isFooterNotes: false,
          tableTheadTop,
          tableTheadHeight,
          sectionTitleText: secTitle?.textContent?.trim()
        });
      });

      if (footerNotes) {
        const r = footerNotes.getBoundingClientRect();
        breakableItems.push({
          el: footerNotes,
          top: (r.top - containerRect.top) * scaleY,
          bottom: (r.bottom - containerRect.top) * scaleY,
          height: r.height * scaleY,
          isTableRow: false,
          isSectionTitle: false,
          isFooterNotes: true
        });
      }

      // Sort items by vertical position
      breakableItems.sort((a, b) => a.top - b.top);

      // Multi-page planning with natural breaks
      interface PagePlan {
        pageNumber: number;
        sliceStartY: number;
        sliceEndY: number;
        repeatThead?: { top: number; height: number };
        continuationTitle?: string;
      }

      const pagePlans: PagePlan[] = [];
      let currentY = 0;
      let pageNum = 1;

      while (currentY < canvas.height - 15) {
        let maxAvailableHeight: number;
        let repeatThead: { top: number; height: number } | undefined;
        let continuationTitle: string | undefined;

        if (pageNum === 1) {
          // First page already has top padding inside the card.
          // Reserve ~80px at bottom for margin / footer note.
          maxAvailableHeight = pageCanvasHeight - 80;
        } else {
          // Continuation page has top header bar (~95px) + bottom footer (~80px)
          let topReserved = 95;

          // Find element that will appear at the start of this page
          const startingItem = breakableItems.find(item => item.top >= currentY - 5 && item.top <= currentY + 25);
          if (startingItem?.isTableRow && startingItem.tableTheadTop !== undefined && startingItem.tableTheadHeight !== undefined) {
            repeatThead = { top: startingItem.tableTheadTop, height: startingItem.tableTheadHeight };
            topReserved += startingItem.tableTheadHeight + 10;

            if (startingItem.sectionTitleText) {
              continuationTitle = startingItem.sectionTitleText;
              topReserved += 45;
            }
          }
          maxAvailableHeight = pageCanvasHeight - topReserved - 80;
        }

        const targetEndY = currentY + maxAvailableHeight;

        // If targetEndY exceeds canvas.height, all remaining content fits on this page
        if (targetEndY >= canvas.height) {
          pagePlans.push({
            pageNumber: pageNum,
            sliceStartY: currentY,
            sliceEndY: canvas.height,
            repeatThead,
            continuationTitle
          });
          break;
        }

        // Find if targetEndY cuts across any element
        let splitY = targetEndY;
        const intersectingItem = breakableItems.find(
          item => item.top < targetEndY - 4 && item.bottom > targetEndY - 4
        );

        if (intersectingItem) {
          // Push split point cleanly above this item
          splitY = Math.floor(intersectingItem.top) - 2;

          // Check if this is the first row of a table
          if (intersectingItem.isTableRow) {
            const isFirstInTable = intersectingItem.el.parentElement?.firstElementChild === intersectingItem.el;
            if (isFirstInTable) {
              const table = intersectingItem.el.closest('table');
              if (table) {
                const tableR = table.getBoundingClientRect();
                let topBoundary = (tableR.top - containerRect.top) * scaleY;
                const secEl = table.parentElement?.querySelector('.section-title');
                if (secEl) {
                  const secR = secEl.getBoundingClientRect();
                  topBoundary = (secR.top - containerRect.top) * scaleY;
                }
                splitY = Math.floor(topBoundary) - 4;
              }
            }
          }
        } else {
          // Find the last element that fits completely before targetEndY
          const itemsBefore = breakableItems.filter(item => item.bottom <= targetEndY);
          if (itemsBefore.length > 0) {
            const lastItem = itemsBefore[itemsBefore.length - 1];
            splitY = Math.floor(lastItem.bottom) + 2;
          }
        }

        // Ensure progression
        if (splitY <= currentY + 60) {
          splitY = targetEndY;
        }

        pagePlans.push({
          pageNumber: pageNum,
          sliceStartY: currentY,
          sliceEndY: splitY,
          repeatThead,
          continuationTitle
        });

        currentY = splitY;
        pageNum++;
      }

      const totalPages = pagePlans.length;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Render each planned page onto an exact A4 canvas slice
      pagePlans.forEach((plan, idx) => {
        if (idx > 0) {
          pdf.addPage();
        }

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) return;

        // Clean white page background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        let contentDrawY = 0;

        if (plan.pageNumber === 1) {
          // Page 1: draw from the very top
          contentDrawY = 0;
        } else {
          // Continuation header for Page 2+
          ctx.font = 'bold 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#E85D75';
          ctx.textAlign = 'left';
          ctx.fillText('NA PRVI POGLED', 40, 50);

          ctx.font = '18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#4b5563';
          ctx.fillText(`— Evidencija sudionika (${event.title})`, 220, 50);

          ctx.font = 'bold 18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.textAlign = 'right';
          ctx.fillText(`Stranica ${plan.pageNumber} od ${totalPages}`, canvas.width - 40, 50);

          // Header separator line
          ctx.strokeStyle = '#E85D75';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(40, 68);
          ctx.lineTo(canvas.width - 40, 68);
          ctx.stroke();

          contentDrawY = 92;

          // Optional continuation title (e.g. 👨 Muškarci – nastavak)
          if (plan.continuationTitle) {
            ctx.font = 'bold 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = plan.continuationTitle.includes('Muškarci') ? '#0369a1' : '#9d174d';
            ctx.textAlign = 'left';
            ctx.fillText(`${plan.continuationTitle} (nastavak)`, 40, contentDrawY + 16);
            contentDrawY += 40;
          }

          // Repeat table header for clarity
          if (plan.repeatThead) {
            ctx.drawImage(
              canvas,
              0,
              plan.repeatThead.top,
              canvas.width,
              plan.repeatThead.height,
              0,
              contentDrawY,
              canvas.width,
              plan.repeatThead.height
            );
            contentDrawY += plan.repeatThead.height;
          }
        }

        // Draw the main content slice for this page
        const sliceH = plan.sliceEndY - plan.sliceStartY;
        ctx.drawImage(
          canvas,
          0,
          plan.sliceStartY,
          canvas.width,
          sliceH,
          0,
          contentDrawY,
          canvas.width,
          sliceH
        );

        // Page footer on multi-page documents
        if (totalPages > 1) {
          const footerY = pageCanvasHeight - 32;

          // Subtle divider line
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(40, pageCanvasHeight - 55);
          ctx.lineTo(canvas.width - 40, pageCanvasHeight - 55);
          ctx.stroke();

          // Left document info
          ctx.font = '18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#9ca3af';
          ctx.textAlign = 'left';
          ctx.fillText(`Evidencijski list sudionika • ${event.title}`, 40, footerY);

          // Right page indicator
          ctx.font = 'bold 18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.textAlign = 'right';
          ctx.fillText(`Stranica ${plan.pageNumber} od ${totalPages}`, canvas.width - 40, footerY);
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      });

      const cleanEventTitle = (event.title || 'Event').replace(/[^a-zA-Z0-9_\u0100-\u017F]/g, '_');
      const cleanDate = (event.dateStr || 'Datum').replace(/[^a-zA-Z0-9_\u0100-\u017F]/g, '_');
      pdf.save(`Evidencija_${cleanEventTitle}_${cleanDate}.pdf`);
    } catch (err) {
      console.error("Greška pri izradi PDF-a:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Dogodila se greška prilikom izrade PDF-a: ${errMsg}. Možete upotrijebiti opciju 'Ispiši / Spremi kao PDF' za spremanje ili ispis.`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct print via hidden iframe (optimally styled for A4 paper and vector save-as-pdf)
  const handlePrint = () => {
    const content = printContentRef.current;
    if (!content) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="hr">
        <head>
          <meta charset="utf-8" />
          <title>Evidencija sudionika - ${event.title}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 10mm 10mm 10mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 9.5pt;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              margin-bottom: 12px;
              font-size: 9pt;
            }
            thead {
              display: table-header-group;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 5px 7px;
              text-align: left;
              vertical-align: middle;
            }
            th {
              background-color: #f3f4f6 !important;
              font-weight: 700;
              color: #374151;
            }
            tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .section-title {
              page-break-after: avoid;
              break-after: avoid;
            }
            .header-bar {
              border-bottom: 2.5px solid #E85D75;
              padding-bottom: 8px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand-name {
              font-size: 16pt;
              font-weight: 800;
              color: #E85D75;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin: 0;
            }
            .doc-title {
              font-size: 11pt;
              font-weight: 600;
              color: #4b5563;
              margin-top: 2px;
            }
            .meta-card {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 12px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              font-size: 8.5pt;
            }
            .meta-item strong {
              display: block;
              color: #6b7280;
              font-size: 7.5pt;
              text-transform: uppercase;
              font-weight: 600;
            }
            .stats-bar {
              display: flex;
              gap: 12px;
              margin-bottom: 10px;
              font-size: 8.5pt;
              font-weight: 600;
            }
            .stat-badge {
              padding: 3px 8px;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
              background: #ffffff;
            }
            .badge-female {
              background: #fdf2f8 !important;
              color: #9d174d;
              border-color: #fbcfe8;
            }
            .badge-male {
              background: #f0f9ff !important;
              color: #0369a1;
              border-color: #bae6fd;
            }
            .section-title {
              font-size: 10.5pt;
              font-weight: 700;
              color: #1f2937;
              margin-top: 10px;
              margin-bottom: 4px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .check-box {
              width: 14px;
              height: 14px;
              border: 1.5px solid #4b5563;
              border-radius: 2px;
              display: inline-block;
              margin-right: 4px;
              vertical-align: middle;
              text-align: center;
              line-height: 11px;
              font-size: 9pt;
              font-weight: bold;
            }
            .check-box.checked {
              background-color: #059669 !important;
              color: #ffffff !important;
              border-color: #047857 !important;
            }
            .footer-notes {
              margin-top: 16px;
              padding-top: 10px;
              border-top: 1px dashed #d1d5db;
              font-size: 8pt;
              color: #6b7280;
              page-break-inside: avoid;
            }
            .signature-row {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              font-size: 8.5pt;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 350);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                Evidencija posjetitelja događaja
              </h3>
              <p className="text-xs text-gray-500">
                Pregled i izvoz liste sudionika za check-in na ulazu ({event.title})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-3.5 bg-gray-50/90 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-xs">
              <Filter size={13} className="text-gray-400" />
              <span className="font-semibold text-gray-500">Prikaz:</span>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as FilterType)}
                className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer"
              >
                <option value="accepted">Samo odobreni sudionici ({prijave.filter(p => p.status === 'accepted').length})</option>
                <option value="valid">Sve važeće (odobreni + na čekanju)</option>
                <option value="all">Sve prijave ({prijave.length})</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-xs">
              <ArrowUpDown size={13} className="text-gray-400" />
              <span className="font-semibold text-gray-500">Poredak:</span>
              <select
                value={sortType}
                onChange={e => setSortType(e.target.value as SortType)}
                className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer"
              >
                <option value="gender">Grupirano po spolu (Žene pa Muškarci)</option>
                <option value="name">Abecedno po imenu (A - Z)</option>
                <option value="date">Po vremenu prijave</option>
              </select>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex items-center gap-4 text-gray-600 pl-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showContact}
                  onChange={e => setShowContact(e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand/20 cursor-pointer"
                />
                <span>Prikaži kontakt (Email)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showNotes}
                  onChange={e => setShowNotes(e.target.checked)}
                  className="rounded border-gray-300 text-brand focus:ring-brand/20 cursor-pointer"
                />
                <span>Prikaži napomene</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Otvori dijalog za ispis ili spremanje u PDF (A4 format)"
            >
              <Printer size={15} />
              <span>Ispiši / Spremi kao PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf || filteredPrijave.length === 0}
              className="px-4 py-1.5 bg-brand hover:bg-brand-light text-white rounded-lg font-medium transition-all flex items-center gap-1.5 shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
              title="Preuzmi .pdf datoteku izravno na računalo"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Stvaranje PDF-a...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Preuzmi PDF datoteku</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Document Preview (Scrollable container) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100/80 flex flex-col items-center">
          <div
            ref={printContentRef}
            data-pdf-content="true"
            className="bg-white w-full max-w-4xl p-6 sm:p-10 shadow-xl border border-gray-200 text-gray-900 rounded-2xl my-2"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Printable Document Header */}
            <div className="header-bar border-b-2 border-brand pb-3 mb-4 flex justify-between items-start">
              <div>
                <h1 className="brand-name text-xl sm:text-2xl font-black text-brand tracking-wide uppercase m-0">
                  Na prvi pogled
                </h1>
                <h2 className="doc-title text-sm sm:text-base font-semibold text-gray-700 mt-0.5 m-0">
                  EVIDENCIJSKI LIST SUDIONIKA NA ULAZU
                </h2>
              </div>
              <div className="text-right text-[11px] text-gray-400">
                Datum ispisa: {new Date().toLocaleDateString('hr-HR')}
              </div>
            </div>

            {/* Event Metadata Card */}
            <div className="meta-card bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="meta-item">
                <strong className="block text-gray-400 text-[10px] uppercase font-bold">Događaj</strong>
                <span className="font-semibold text-gray-800">{event.title}</span>
              </div>
              <div className="meta-item">
                <strong className="block text-gray-400 text-[10px] uppercase font-bold">Datum i vrijeme</strong>
                <span className="font-semibold text-gray-800">{event.dateStr} u {event.timeStr}h</span>
              </div>
              <div className="meta-item">
                <strong className="block text-gray-400 text-[10px] uppercase font-bold">Lokacija</strong>
                <span className="font-semibold text-gray-800 truncate block" title={event.location}>{event.location}</span>
              </div>
              <div className="meta-item">
                <strong className="block text-gray-400 text-[10px] uppercase font-bold">Kotizacija</strong>
                <span className="font-semibold text-brand">{event.price || 'Nije navedeno'}</span>
              </div>
            </div>

            {/* Attendance Counters / Stats */}
            <div className="stats-bar flex flex-wrap gap-2 sm:gap-4 mb-4 text-xs font-semibold">
              <div className="stat-badge px-3 py-1 rounded bg-white border border-gray-200">
                Ukupno na listi: <strong className="text-gray-900">{filteredPrijave.length}</strong>
              </div>
              <div className="stat-badge badge-female px-3 py-1 rounded bg-pink-50 text-pink-700 border border-pink-200">
                Žene (Ž): <strong>{femaleList.length}</strong>
              </div>
              <div className="stat-badge badge-male px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Muškarci (M): <strong>{maleList.length}</strong>
              </div>
              {filterType !== 'accepted' && (
                <div className="stat-badge px-3 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Filter: {filterType === 'valid' ? 'Važeće prijave' : 'Sve prijave'}
                </div>
              )}
            </div>

            {/* Empty state */}
            {filteredPrijave.length === 0 ? (
              <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                Nema sudionika za odabrani filter.
              </div>
            ) : sortType === 'gender' ? (
              /* Grouped by Gender */
              <div className="space-y-6">
                {/* Table Žene */}
                <div>
                  <div className="section-title text-sm font-bold text-pink-700 flex items-center gap-2 mb-1.5">
                    <span>👩 Žene (Sudionice) – {femaleList.length}</span>
                  </div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-14 whitespace-nowrap">#</th>
                        <th className="border border-gray-300 px-3 py-1.5 text-left">Ime i prezime</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-12">God.</th>
                        {showContact && <th className="border border-gray-300 px-3 py-1.5 text-left">Email / Kontakt</th>}
                        {showNotes && <th className="border border-gray-300 px-3 py-1.5 text-left">Napomena</th>}
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-28 whitespace-nowrap">Kotizacija</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-28 whitespace-nowrap">Dolazak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFemaleList.length === 0 ? (
                        <tr>
                          <td colSpan={showContact && showNotes ? 7 : 6} className="border border-gray-300 p-3 text-center text-gray-400 italic">
                            Nema prijavljenih žena.
                          </td>
                        </tr>
                      ) : (
                        sortedFemaleList.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-gray-50/50">
                            <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-gray-600 whitespace-nowrap">
                              Ž-{idx + 1}
                            </td>
                            <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-900">
                              {p.imePrezime}
                            </td>
                            <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-600">
                              {p.godine}
                            </td>
                            {showContact && (
                              <td className="border border-gray-300 px-3 py-1.5 text-gray-600 text-[11px] truncate max-w-[160px]">
                                {p.email}
                              </td>
                            )}
                            {showNotes && (
                              <td className="border border-gray-300 px-3 py-1.5 text-gray-500 text-[11px] max-w-[140px] truncate" title={p.napomena}>
                                {p.napomena || '-'}
                              </td>
                            )}
                            <td className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap w-28">
                              <span className={`check-box inline-block w-3.5 h-3.5 border-1.5 border-gray-500 rounded-xs mr-1.5 align-middle text-[10px] leading-3 font-bold text-center ${p.paid ? 'checked bg-emerald-600 text-white border-emerald-700' : ''}`}>
                                {p.paid ? '✓' : ''}
                              </span>
                              <span className="text-[11px] text-gray-700 font-medium">{event.price ? event.price.split(' ')[0] : 'Plaćeno'}</span>
                            </td>
                            <td className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap w-28">
                              <span className={`check-box inline-block w-3.5 h-3.5 border-1.5 border-gray-500 rounded-xs mr-1.5 align-middle text-[10px] leading-3 font-bold text-center ${p.attended ? 'checked bg-emerald-600 text-white border-emerald-700' : ''}`}>
                                {p.attended ? '✓' : ''}
                              </span>
                              <span className={`text-[11px] ${p.attended ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}>
                                {p.attended ? 'Stigla ✓' : 'Stigla'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Muškarci */}
                <div>
                  <div className="section-title text-sm font-bold text-blue-700 flex items-center gap-2 mb-1.5">
                    <span>👨 Muškarci (Sudionici) – {maleList.length}</span>
                  </div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-14 whitespace-nowrap">#</th>
                        <th className="border border-gray-300 px-3 py-1.5 text-left">Ime i prezime</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-12">God.</th>
                        {showContact && <th className="border border-gray-300 px-3 py-1.5 text-left">Email / Kontakt</th>}
                        {showNotes && <th className="border border-gray-300 px-3 py-1.5 text-left">Napomena</th>}
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-28 whitespace-nowrap">Kotizacija</th>
                        <th className="border border-gray-300 px-2 py-1.5 text-center w-28 whitespace-nowrap">Dolazak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMaleList.length === 0 ? (
                        <tr>
                          <td colSpan={showContact && showNotes ? 7 : 6} className="border border-gray-300 p-3 text-center text-gray-400 italic">
                            Nema prijavljenih muškaraca.
                          </td>
                        </tr>
                      ) : (
                        sortedMaleList.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-gray-50/50">
                            <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-gray-600 whitespace-nowrap">
                              M-{idx + 1}
                            </td>
                            <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-900">
                              {p.imePrezime}
                            </td>
                            <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-600">
                              {p.godine}
                            </td>
                            {showContact && (
                              <td className="border border-gray-300 px-3 py-1.5 text-gray-600 text-[11px] truncate max-w-[160px]">
                                {p.email}
                              </td>
                            )}
                            {showNotes && (
                              <td className="border border-gray-300 px-3 py-1.5 text-gray-500 text-[11px] max-w-[140px] truncate" title={p.napomena}>
                                {p.napomena || '-'}
                              </td>
                            )}
                            <td className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap w-28">
                              <span className={`check-box inline-block w-3.5 h-3.5 border-1.5 border-gray-500 rounded-xs mr-1.5 align-middle text-[10px] leading-3 font-bold text-center ${p.paid ? 'checked bg-emerald-600 text-white border-emerald-700' : ''}`}>
                                {p.paid ? '✓' : ''}
                              </span>
                              <span className="text-[11px] text-gray-700 font-medium">{event.price ? event.price.split(' ')[0] : 'Plaćeno'}</span>
                            </td>
                            <td className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap w-28">
                              <span className={`check-box inline-block w-3.5 h-3.5 border-1.5 border-gray-500 rounded-xs mr-1.5 align-middle text-[10px] leading-3 font-bold text-center ${p.attended ? 'checked bg-emerald-600 text-white border-emerald-700' : ''}`}>
                                {p.attended ? '✓' : ''}
                              </span>
                              <span className={`text-[11px] ${p.attended ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}>
                                {p.attended ? 'Stigao ✓' : 'Stigao'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Unified List (alphabetical or date) */
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-300 px-2 py-1.5 text-center w-14 whitespace-nowrap">R.br.</th>
                    <th className="border border-gray-300 px-3 py-1.5 text-left">Ime i prezime</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-center w-12">Spol</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-center w-12">God.</th>
                    {showContact && <th className="border border-gray-300 px-3 py-1.5 text-left">Email / Kontakt</th>}
                    {showNotes && <th className="border border-gray-300 px-3 py-1.5 text-left">Napomena</th>}
                    <th className="border border-gray-300 px-2 py-1.5 text-center w-28 whitespace-nowrap">Kotizacija</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-center w-28 whitespace-nowrap">Dolazak</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUnifiedList.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-gray-50/50">
                      <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-gray-600 whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-900">
                        {p.imePrezime}
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.spol === 'Ž' || p.spol?.toLowerCase() === 'žensko' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {p.spol}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-600">
                        {p.godine}
                      </td>
                      {showContact && (
                        <td className="border border-gray-300 px-3 py-1.5 text-gray-600 text-[11px] truncate max-w-[160px]">
                          {p.email}
                        </td>
                      )}
                      {showNotes && (
                        <td className="border border-gray-300 px-3 py-1.5 text-gray-500 text-[11px] max-w-[140px] truncate" title={p.napomena}>
                          {p.napomena || '-'}
                        </td>
                      )}
                      <td className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap w-28">
                        <span className={`check-box inline-block w-3.5 h-3.5 border-1.5 border-gray-500 rounded-xs mr-1.5 align-middle text-[10px] leading-3 font-bold text-center ${p.paid ? 'checked bg-emerald-600 text-white border-emerald-700' : ''}`}>
                          {p.paid ? '✓' : ''}
                        </span>
                        <span className="text-[11px] text-gray-700 font-medium">{event.price ? event.price.split(' ')[0] : 'Plaćeno'}</span>
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center whitespace-nowrap w-28">
                        <span className={`check-box inline-block w-3.5 h-3.5 border-1.5 border-gray-500 rounded-xs mr-1.5 align-middle text-[10px] leading-3 font-bold text-center ${p.attended ? 'checked bg-emerald-600 text-white border-emerald-700' : ''}`}>
                          {p.attended ? '✓' : ''}
                        </span>
                        <span className={`text-[11px] ${p.attended ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}>
                          {p.attended ? 'Stigao/la ✓' : 'Stigao/la'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Document Footer Notes & Signatures */}
            <div className="footer-notes mt-8 pt-4 border-t border-dashed border-gray-300 text-xs text-gray-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong className="block text-gray-700 mb-1">Bilješke organizatora s ulaza:</strong>
                  <div className="border border-gray-200 rounded p-2 h-14 bg-gray-50/50 text-[10px] text-gray-400">
                    (Prostor za unos dodatnih posjetitelja na licu mjesta ili posebnih zabilješki)
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="signature-row flex justify-between items-center text-xs text-gray-600 pt-6">
                    <div>
                      Ukupno naplaćeno: <span className="font-semibold text-gray-800">___________ €</span>
                    </div>
                    <div>
                      Potpis voditelja: <span className="inline-block border-b border-gray-400 w-32"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
