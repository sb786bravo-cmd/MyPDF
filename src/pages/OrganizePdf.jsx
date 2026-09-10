import React, { useState } from 'react';
import { Upload, Layers, Download, Check, AlertCircle, RefreshCw, Trash2, RotateCw, ArrowLeft, ArrowRight, File } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

export default function OrganizePdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // [{ index: 0, label: 'Page 1', rotation: 0, isDeleted: false }]
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
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
      const pageList = Array.from({ length: count }, (_, i) => ({
        originalIndex: i,
        label: `Page ${i + 1}`,
        rotation: 0,
      }));
      setPages(pageList);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not read PDF. ' + err.message);
    }
  };

  const rotatePage = (idx) => {
    setPages(prev => {
      const updated = [...prev];
      updated[idx].rotation = (updated[idx].rotation + 90) % 360;
      return updated;
    });
  };

  const deletePage = (idx) => {
    if (pages.length <= 1) {
      alert('A PDF must contain at least one page.');
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== idx));
  };

  const movePage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    setPages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      for (const p of pages) {
        const [copiedPage] = await newPdf.copyPages(srcDoc, [p.originalIndex]);
        if (p.rotation !== 0) {
          const currentAngle = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentAngle + p.rotation) % 360));
        }
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `${file.name.replace(/\.pdf$/i, '')}_organized.pdf`;

      setDownloadUrl(url);
      setSuccess(true);

      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      a.click();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error organizing PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Organize PDF</h1>
        <p style={styles.subtitle}>Reorder pages, rotate individual sheets, or delete unwanted pages easily.</p>
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
            <Layers size={64} color="var(--tool-edit, #AB6993)" style={{ marginBottom: '20px' }} />
            <label style={styles.uploadBtn}>
              Select PDF file
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <p style={{ marginTop: '16px', color: '#666' }}>or drop PDF here</p>
          </div>
        </div>
      ) : !success ? (
        <div style={styles.editorArea}>
          <div style={styles.topToolbar}>
            <div style={styles.fileSummary}>
              <File size={20} color="var(--tool-edit, #AB6993)" />
              <strong>{file.name}</strong>
              <span>({pages.length} pages remaining)</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={styles.changeBtn} onClick={reset}>Change PDF</button>
              <button style={styles.saveBtn} onClick={handleSave} disabled={isProcessing}>
                {isProcessing ? 'Saving...' : 'Save Organized PDF'}
              </button>
            </div>
          </div>

          {/* Interactive Page Tiles */}
          <div style={styles.pageGrid}>
            {pages.map((p, idx) => (
              <div key={idx} style={styles.pageTile}>
                <div style={styles.pageTileControls}>
                  <button
                    style={styles.tileCtrlBtn}
                    onClick={() => movePage(idx, idx - 1)}
                    disabled={idx === 0}
                    title="Move Left"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    style={styles.tileCtrlBtn}
                    onClick={() => rotatePage(idx)}
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw size={14} />
                  </button>
                  <button
                    style={styles.tileCtrlBtn}
                    onClick={() => movePage(idx, idx + 1)}
                    disabled={idx === pages.length - 1}
                    title="Move Right"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    style={{ ...styles.tileCtrlBtn, color: '#ef4444' }}
                    onClick={() => deletePage(idx)}
                    title="Delete Page"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div
                  style={{
                    ...styles.pageVisual,
                    transform: `rotate(${p.rotation}deg)`,
                  }}
                >
                  <File size={42} color="var(--tool-edit, #AB6993)" />
                  <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{p.label}</span>
                </div>

                <div style={styles.pageTileFooter}>
                  <span>Position #{idx + 1}</span>
                  {p.rotation !== 0 && <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>+{p.rotation}°</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>PDF Organized Successfully!</h2>
          <p style={styles.successSub}>Your reordered and updated document has been downloaded.</p>
          {downloadUrl && (
            <a href={downloadUrl} download={`${file.name.replace(/\.pdf$/i, '')}_organized.pdf`} style={styles.downloadBtn}>
              <Download size={20} /> Download PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Organize Another PDF
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '100px 24px 60px',
    maxWidth: '1100px',
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
    backgroundColor: 'var(--tool-edit, #AB6993)',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: '0 8px 30px rgba(171, 105, 147, 0.2)',
  },
  uploadContent: {
    backgroundColor: '#fff',
    border: '2px dashed rgba(171, 105, 147, 0.4)',
    borderRadius: '12px',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '380px',
  },
  uploadBtn: {
    backgroundColor: 'var(--tool-edit, #AB6993)',
    color: 'white',
    padding: '16px 36px',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(171, 105, 147, 0.4)',
    transition: 'all 0.2s',
  },
  editorArea: { display: 'flex', flexDirection: 'column', gap: '20px' },
  topToolbar: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  fileSummary: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1f2937' },
  changeBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#374151',
  },
  saveBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    background: 'var(--tool-edit, #AB6993)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 12px rgba(171, 105, 147, 0.35)',
  },
  pageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '18px',
  },
  pageTile: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    transition: 'all 0.2s',
  },
  pageTileControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 4px',
  },
  tileCtrlBtn: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#4b5563',
  },
  pageVisual: {
    width: '110px',
    height: '145px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  pageTileFooter: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 4px',
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
    background: 'var(--tool-edit, #AB6993)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(171, 105, 147, 0.4)',
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
