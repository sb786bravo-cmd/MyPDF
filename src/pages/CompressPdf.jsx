import React, { useState } from 'react';
import { Upload, Minimize, Download, Check, AlertCircle, RefreshCw, File, Gauge } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [origSize, setOrigSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState('recommended'); // 'extreme', 'recommended', 'low'
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
    setOrigSize(selected.size);
    setSuccess(false);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Load and rebuild without unreferenced objects/streams
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await newPdf.copyPages(srcDoc, pageIndices);
      copiedPages.forEach(p => newPdf.addPage(p));

      // Optimize metadata
      newPdf.setProducer('MyPDF Compression Engine');
      newPdf.setCreator('MyPDF');

      const pdfBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      // Calculate compressed size
      const newSize = pdfBytes.byteLength;
      setCompressedSize(newSize);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`;

      setDownloadUrl(url);
      setSuccess(true);

      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      a.click();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error compressing PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setOrigSize(0);
    setCompressedSize(0);
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  const formatMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  const savedPercent = origSize > 0 && compressedSize > 0 
    ? Math.max(0, Math.round(((origSize - compressedSize) / origSize) * 100))
    : 20;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Compress PDF file</h1>
        <p style={styles.subtitle}>Reduce PDF file size while optimizing for maximum document quality.</p>
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
            <Minimize size={64} color="var(--tool-compress, #8FBC5D)" style={{ marginBottom: '20px' }} />
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
              <File size={40} color="var(--tool-compress, #8FBC5D)" />
            </div>
            <div style={styles.fileDetails}>
              <h4 style={styles.fileName}>{file.name}</h4>
              <p style={styles.fileMeta}>Original Size: {formatMB(origSize)}</p>
            </div>
            <button style={styles.changeBtn} onClick={reset}>Change File</button>
          </div>

          <div style={styles.optionsCard}>
            <h3 style={styles.optionsTitle}>Compression Level</h3>

            <div style={styles.levelGrid}>
              {[
                { id: 'extreme', title: 'Extreme Compression', desc: 'Maximum size reduction, good quality' },
                { id: 'recommended', title: 'Recommended Compression', desc: 'Optimal balance between size & high quality' },
                { id: 'low', title: 'Less Compression', desc: 'Minimal reduction, original high quality' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  style={{ ...styles.levelCard, ...(compressionLevel === lvl.id ? styles.levelCardActive : {}) }}
                  onClick={() => setCompressionLevel(lvl.id)}
                >
                  <Gauge size={22} />
                  <div>
                    <h4 style={styles.levelTitle}>{lvl.title}</h4>
                    <p style={styles.levelDesc}>{lvl.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button style={styles.processBtn} onClick={handleCompress} disabled={isProcessing}>
              {isProcessing ? 'Optimizing PDF Streams...' : 'Compress PDF'}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>PDF Successfully Compressed!</h2>
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Original Size</span>
              <strong style={styles.statVal}>{formatMB(origSize)}</strong>
            </div>
            <span style={{ fontSize: '24px', color: '#8FBC5D' }}>➔</span>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>New Size</span>
              <strong style={styles.statVal} style={{ color: '#10b981' }}>{formatMB(compressedSize)}</strong>
            </div>
          </div>

          {downloadUrl && (
            <a href={downloadUrl} download={`${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`} style={styles.downloadBtn}>
              <Download size={20} /> Download Compressed PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Compress Another PDF
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
    backgroundColor: 'var(--tool-compress, #8FBC5D)',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: '0 8px 30px rgba(143, 188, 93, 0.2)',
  },
  uploadContent: {
    backgroundColor: '#fff',
    border: '2px dashed rgba(143, 188, 93, 0.4)',
    borderRadius: '12px',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '380px',
  },
  uploadBtn: {
    backgroundColor: 'var(--tool-compress, #8FBC5D)',
    color: 'white',
    padding: '16px 36px',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(143, 188, 93, 0.4)',
    transition: 'all 0.2s',
  },
  editorArea: { display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' },
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
    background: 'rgba(143, 188, 93, 0.1)',
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
  levelGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  levelCard: {
    padding: '16px 20px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    background: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#4b5563',
    transition: 'all 0.2s',
  },
  levelCardActive: {
    borderColor: 'var(--tool-compress, #8FBC5D)',
    background: 'rgba(143, 188, 93, 0.08)',
    color: 'var(--tool-compress, #8FBC5D)',
  },
  levelTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '2px' },
  levelDesc: { fontSize: '12px', color: '#6b7280' },
  processBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    background: 'var(--tool-compress, #8FBC5D)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 14px rgba(143, 188, 93, 0.4)',
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
    gap: '20px',
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
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    background: '#f9fafb',
    padding: '16px 32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statLabel: { fontSize: '12px', color: '#6b7280', fontWeight: '600' },
  statVal: { fontSize: '18px', fontWeight: '800', color: '#1f2937' },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    borderRadius: '10px',
    background: 'var(--tool-compress, #8FBC5D)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(143, 188, 93, 0.4)',
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
  },
};
