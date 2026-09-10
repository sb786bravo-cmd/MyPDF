import React, { useState } from 'react';
import { Upload, Plus, File, Download, Check, AlertCircle, RefreshCw, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (uploaded.length > 0) {
      setFiles(prev => [...prev, ...uploaded]);
      setErrorMsg('');
      setSuccess(false);
    }
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const moveFile = (from, to) => {
    if (to < 0 || to >= files.length) return;
    setFiles(prev => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMsg('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setErrorMsg('');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `merged_${files[0].name.replace(/\.pdf$/i, '')}_${files.length}_docs.pdf`;

      setDownloadUrl(url);
      setSuccess(true);

      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      a.click();
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setErrorMsg('An error occurred while merging PDFs: ' + error.message);
    } finally {
      setIsMerging(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Merge PDF files</h1>
        <p style={styles.subtitle}>Combine PDFs in the order you want with the easiest, fastest PDF merger available.</p>
      </div>

      {errorMsg && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {files.length === 0 ? (
        <div style={styles.uploadArea}>
          <div style={styles.uploadContent}>
            <Upload size={64} color="var(--tool-merge, #EE6C4D)" style={{ marginBottom: '20px' }} />
            <label style={styles.uploadBtn}>
              Select PDF files
              <input type="file" multiple accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <p style={{ marginTop: '16px', color: '#666' }}>or drop PDFs here</p>
          </div>
        </div>
      ) : !success ? (
        <div style={styles.editorArea}>
          <div style={styles.topBar}>
            <div style={styles.fileCountBadge}>
              <span>{files.length} PDFs selected for merging</span>
            </div>
            <label style={styles.addMoreBtn}>
              <Plus size={16} /> Add more PDFs
              <input type="file" multiple accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={styles.fileGrid}>
            {files.map((f, i) => (
              <div key={i} style={styles.fileCard}>
                <button style={styles.removeBtn} onClick={() => removeFile(i)} title="Remove file">
                  <X size={14} />
                </button>
                <div style={styles.cardIconBox}>
                  <File size={36} color="var(--tool-merge, #EE6C4D)" />
                </div>
                <p style={styles.fileName}>{f.name}</p>
                <span style={styles.fileSize}>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>

                <div style={styles.orderControls}>
                  <button
                    style={styles.orderBtn}
                    onClick={() => moveFile(i, i - 1)}
                    disabled={i === 0}
                    title="Move earlier in sequence"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <span style={styles.orderBadge}>#{i + 1}</span>
                  <button
                    style={styles.orderBtn}
                    onClick={() => moveFile(i, i + 1)}
                    disabled={i === files.length - 1}
                    title="Move later in sequence"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.actionCard}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Files will be combined sequentially from #1 to #{files.length}.
            </p>
            <button
              style={styles.mergeBtn}
              onClick={handleMerge}
              disabled={isMerging || files.length < 2}
            >
              {isMerging ? 'Merging Documents...' : `Merge ${files.length} PDFs into One`}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>PDFs Successfully Merged!</h2>
          <p style={styles.successSub}>Your merged file has been generated and downloaded.</p>
          {downloadUrl && (
            <a href={downloadUrl} download="merged_documents.pdf" style={styles.downloadBtn}>
              <Download size={20} /> Download Merged PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Merge More PDFs
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '100px 24px 60px',
    maxWidth: '1000px',
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
    backgroundColor: 'var(--tool-merge, #EE6C4D)',
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
    backgroundColor: 'var(--tool-merge, #EE6C4D)',
    color: 'white',
    padding: '16px 36px',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(238, 108, 77, 0.4)',
    transition: 'all 0.2s',
  },
  editorArea: { display: 'flex', flexDirection: 'column', gap: '24px' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  fileCountBadge: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    background: '#f3f4f6',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  addMoreBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    background: '#fff',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#374151',
  },
  fileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '16px',
  },
  fileCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  removeBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#fee2e2',
    color: '#b91c1c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
  },
  cardIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '10px',
    background: 'rgba(238, 108, 77, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  fileName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    wordBreak: 'break-all',
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: '2px',
  },
  fileSize: { fontSize: '11px', color: '#9ca3af', marginBottom: '12px' },
  orderControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f9fafb',
    borderRadius: '6px',
    padding: '4px',
    width: '100%',
    justifyContent: 'space-between',
  },
  orderBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#4b5563',
  },
  orderBadge: { fontSize: '11px', fontWeight: '700', color: '#6b7280' },
  actionCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  mergeBtn: {
    padding: '16px 48px',
    borderRadius: '10px',
    background: 'var(--tool-merge, #EE6C4D)',
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
    background: 'var(--tool-merge, #EE6C4D)',
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
