import React, { useState } from 'react';
import { Upload, File, Download, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState('range'); // 'range' or 'all'
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [outputFileName, setOutputFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }
    setErrorMsg('');
    setFile(selected);
    setSuccess(false);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPageCount(count);
      setPageRange(`1-${count}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not read PDF. It might be password-protected or corrupted.');
    }
  };

  const parseRange = (rangeStr, maxPages) => {
    const pages = new Set();
    const parts = rangeStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(maxPages, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            pages.add(p - 1); // 0-indexed
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= maxPages) {
          pages.add(num - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      if (splitMode === 'range') {
        const indices = parseRange(pageRange, pageCount);
        if (indices.length === 0) {
          setErrorMsg(`Please specify valid page numbers between 1 and ${pageCount}.`);
          setIsProcessing(false);
          return;
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(srcDoc, indices);
        copiedPages.forEach(p => newPdf.addPage(p));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const outName = `${file.name.replace(/\.pdf$/i, '')}_split_pages_${indices.map(i => i + 1).join('-')}.pdf`;

        setDownloadUrl(url);
        setOutputFileName(outName);
        setSuccess(true);

        const a = document.createElement('a');
        a.href = url;
        a.download = outName;
        a.click();
      } else {
        // Extract each page as a separate PDF (bundled sequentially)
        for (let i = 0; i < pageCount; i++) {
          const singleDoc = await PDFDocument.create();
          const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
          singleDoc.addPage(copiedPage);
          const pdfBytes = await singleDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const outName = `${file.name.replace(/\.pdf$/i, '')}_page_${i + 1}.pdf`;

          const a = document.createElement('a');
          a.href = url;
          a.download = outName;
          a.click();
          await new Promise(r => setTimeout(r, 200));
        }
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during splitting: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setPageRange('');
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Split PDF file</h1>
        <p style={styles.subtitle}>Separate one page or a whole set for easy conversion into independent PDF files.</p>
      </div>

      {errorMsg && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!file ? (
        <div style={styles.uploadArea}>
          <div style={styles.uploadContent}>
            <Upload size={64} color="var(--tool-split)" style={{ marginBottom: '20px' }} />
            <label style={styles.uploadBtn}>
              Select PDF file
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <p style={{ marginTop: '16px', color: '#666' }}>or drop PDF here</p>
          </div>
        </div>
      ) : !success ? (
        <div style={styles.editorArea}>
          <div style={styles.fileInfoCard}>
            <div style={styles.fileIconBox}>
              <File size={40} color="var(--tool-split)" />
            </div>
            <div style={styles.fileDetails}>
              <h4 style={styles.fileName}>{file.name}</h4>
              <p style={styles.fileMeta}>{pageCount} pages • {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button style={styles.changeBtn} onClick={reset}>Change File</button>
          </div>

          <div style={styles.optionsCard}>
            <h3 style={styles.optionsTitle}>Split Options</h3>
            <div style={styles.modeTabs}>
              <button
                style={{ ...styles.modeTab, ...(splitMode === 'range' ? styles.modeTabActive : {}) }}
                onClick={() => setSplitMode('range')}
              >
                Custom Page Range
              </button>
              <button
                style={{ ...styles.modeTab, ...(splitMode === 'all' ? styles.modeTabActive : {}) }}
                onClick={() => setSplitMode('all')}
              >
                Extract All Pages ({pageCount} PDFs)
              </button>
            </div>

            {splitMode === 'range' && (
              <div style={styles.rangeInputGroup}>
                <label style={styles.inputLabel}>Enter page ranges (e.g. 1-3, 5, 7-{pageCount}):</label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder={`e.g. 1-${pageCount}`}
                  style={styles.textInput}
                />
                <span style={styles.inputTip}>Pages available: 1 through {pageCount}</span>
              </div>
            )}

            <button
              style={styles.processBtn}
              onClick={handleSplit}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing PDF...' : 'Split PDF'}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>PDF successfully split!</h2>
          <p style={styles.successSub}>Your split document has been downloaded.</p>
          {downloadUrl && (
            <a href={downloadUrl} download={outputFileName} style={styles.downloadBtn}>
              <Download size={20} /> Download Split PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Split Another PDF
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '100px 24px 60px',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  header: { marginBottom: '32px' },
  title: { fontSize: '36px', fontWeight: '800', color: '#1f2937', marginBottom: '12px' },
  subtitle: { fontSize: '18px', color: '#6b7280' },
  errorBanner: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    fontSize: '14px',
  },
  uploadArea: {
    backgroundColor: 'var(--tool-split, #EE6C4D)',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: '0 8px 30px rgba(238, 108, 77, 0.2)',
  },
  uploadContent: {
    backgroundColor: '#fff',
    border: '2px dashed rgba(238, 108, 77, 0.4)',
    borderRadius: '12px',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '380px',
  },
  uploadBtn: {
    backgroundColor: 'var(--tool-split, #EE6C4D)',
    color: 'white',
    padding: '16px 36px',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(238, 108, 77, 0.4)',
    transition: 'all 0.2s',
  },
  editorArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    textAlign: 'left',
  },
  fileInfoCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  fileIconBox: {
    width: '60px',
    height: '60px',
    borderRadius: '10px',
    background: 'rgba(238, 108, 77, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: { flex: 1 },
  fileName: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  fileMeta: { fontSize: '13px', color: '#6b7280' },
  changeBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#374151',
  },
  optionsCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  optionsTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px' },
  modeTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  modeTab: {
    padding: '14px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    background: '#f9fafb',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  modeTabActive: {
    borderColor: 'var(--tool-split, #EE6C4D)',
    background: 'rgba(238, 108, 77, 0.08)',
    color: 'var(--tool-split, #EE6C4D)',
  },
  rangeInputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' },
  inputLabel: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  textInput: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    outline: 'none',
  },
  inputTip: { fontSize: '12px', color: '#9ca3af' },
  processBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    background: 'var(--tool-split, #EE6C4D)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 14px rgba(238, 108, 77, 0.4)',
    transition: 'all 0.2s',
  },
  successCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
  },
  successTitle: { fontSize: '26px', fontWeight: '800', color: '#111827' },
  successSub: { fontSize: '16px', color: '#6b7280' },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    borderRadius: '10px',
    background: 'var(--tool-split, #EE6C4D)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(238, 108, 77, 0.4)',
  },
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
