import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckSquare, Download, Check, AlertCircle, RefreshCw, File, Eraser, Pen } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function SignPdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [sigType, setSigType] = useState('draw'); // 'draw' or 'type'
  const [typedName, setTypedName] = useState('');
  const [penColor, setPenColor] = useState('#000000');
  const [targetPage, setTargetPage] = useState(1);
  const [posX, setPosX] = useState('bottom_right'); // 'bottom_right', 'bottom_left', 'center'
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (sigType === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [sigType, penColor]);

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
      setTargetPage(count); // Default to last page for signature
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not read PDF.');
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureDataUrl = () => {
    if (sigType === 'draw') {
      return canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
    } else {
      // Create canvas for typed cursive signature
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400;
      tempCanvas.height = 120;
      const ctx = tempCanvas.getContext('2d');
      ctx.fillStyle = penColor;
      ctx.font = 'italic bold 36px "Segoe Script", "Brush Script MT", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName || 'Signature', 200, 60);
      return tempCanvas.toDataURL('image/png');
    }
  };

  const handleSign = async () => {
    if (!file) return;
    const sigDataUrl = getSignatureDataUrl();
    if (!sigDataUrl) {
      setErrorMsg('Please provide a signature.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const sigImageBytes = await fetch(sigDataUrl).then(res => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigImageBytes);

      const pageIndex = Math.max(0, Math.min(pageCount - 1, targetPage - 1));
      const page = pdfDoc.getPage(pageIndex);
      const { width, height } = page.getSize();

      const sigWidth = 160;
      const sigHeight = (sigWidth / sigImage.width) * sigImage.height;

      let x = width - sigWidth - 50;
      let y = 50;

      if (posX === 'bottom_left') {
        x = 50;
        y = 50;
      } else if (posX === 'center') {
        x = (width - sigWidth) / 2;
        y = (height - sigHeight) / 2;
      }

      page.drawImage(sigImage, {
        x,
        y,
        width: sigWidth,
        height: sigHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `${file.name.replace(/\.pdf$/i, '')}_signed.pdf`;

      setDownloadUrl(url);
      setSuccess(true);

      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      a.click();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error signing PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setTypedName('');
    clearCanvas();
    setSuccess(false);
    setDownloadUrl(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Sign PDF</h1>
        <p style={styles.subtitle}>Create your electronic signature and stamp it securely onto your PDF documents.</p>
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
            <CheckSquare size={64} color="var(--tool-edit, #AB6993)" style={{ marginBottom: '20px' }} />
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
              <File size={40} color="var(--tool-edit, #AB6993)" />
            </div>
            <div style={styles.fileDetails}>
              <h4 style={styles.fileName}>{file.name}</h4>
              <p style={styles.fileMeta}>{pageCount} pages • {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button style={styles.changeBtn} onClick={reset}>Change File</button>
          </div>

          <div style={styles.optionsCard}>
            <h3 style={styles.optionsTitle}>Signature Pad</h3>

            <div style={styles.typeSelector}>
              <button
                style={{ ...styles.typeTab, ...(sigType === 'draw' ? styles.typeTabActive : {}) }}
                onClick={() => setSigType('draw')}
              >
                <Pen size={16} /> Draw Signature
              </button>
              <button
                style={{ ...styles.typeTab, ...(sigType === 'type' ? styles.typeTabActive : {}) }}
                onClick={() => setSigType('type')}
              >
                Type Name
              </button>
            </div>

            {sigType === 'draw' ? (
              <div style={styles.drawBox}>
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={140}
                  style={styles.canvas}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <button style={styles.clearBtn} type="button" onClick={clearCanvas}>
                  <Eraser size={14} /> Clear
                </button>
              </div>
            ) : (
              <div style={styles.formGroup}>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your full name..."
                  style={styles.textInput}
                />
                <div style={styles.signaturePreviewText}>
                  {typedName || 'Your Signature Here'}
                </div>
              </div>
            )}

            <div style={styles.grid3}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Ink Color:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['#000000', '#1e40af', '#047857'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      style={{
                        ...styles.colorCircle,
                        backgroundColor: col,
                        outline: penColor === col ? '3px solid #6366f1' : 'none',
                      }}
                      onClick={() => setPenColor(col)}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Target Page:</label>
                <select
                  value={targetPage}
                  onChange={(e) => setTargetPage(parseInt(e.target.value, 10))}
                  style={styles.selectInput}
                >
                  {Array.from({ length: pageCount }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1} {i + 1 === pageCount ? '(Last Page)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Position:</label>
                <select
                  value={posX}
                  onChange={(e) => setPosX(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="bottom_right">Bottom Right</option>
                  <option value="bottom_left">Bottom Left</option>
                  <option value="center">Center</option>
                </select>
              </div>
            </div>

            <button style={styles.processBtn} onClick={handleSign} disabled={isProcessing}>
              {isProcessing ? 'Signing Document...' : 'Apply Signature & Download PDF'}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <Check size={48} color="#fff" />
          </div>
          <h2 style={styles.successTitle}>PDF Successfully Signed!</h2>
          <p style={styles.successSub}>Your signed document is ready and downloaded.</p>
          {downloadUrl && (
            <a href={downloadUrl} download={`${file.name.replace(/\.pdf$/i, '')}_signed.pdf`} style={styles.downloadBtn}>
              <Download size={20} /> Download Signed PDF
            </a>
          )}
          <button style={styles.resetBtn} onClick={reset}>
            <RefreshCw size={18} /> Sign Another PDF
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
    background: 'rgba(171, 105, 147, 0.1)',
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
  typeSelector: { display: 'flex', gap: '10px', marginBottom: '16px' },
  typeTab: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  typeTabActive: {
    borderColor: 'var(--tool-edit, #AB6993)',
    background: 'rgba(171, 105, 147, 0.1)',
    color: 'var(--tool-edit, #AB6993)',
  },
  drawBox: {
    position: 'relative',
    border: '2px dashed #d1d5db',
    borderRadius: '10px',
    background: '#fdfdfd',
    marginBottom: '20px',
  },
  canvas: { width: '100%', height: '140px', cursor: 'crosshair', display: 'block' },
  clearBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '6px 10px',
    borderRadius: '6px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  formGroup: { marginBottom: '16px' },
  inputLabel: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' },
  textInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
  },
  signaturePreviewText: {
    fontFamily: 'cursive, "Segoe Script", sans-serif',
    fontSize: '28px',
    color: '#1e40af',
    textAlign: 'center',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    marginTop: '10px',
    border: '1px dashed #d1d5db',
  },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  colorCircle: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', cursor: 'pointer' },
  selectInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    background: '#fff',
  },
  processBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    background: 'var(--tool-edit, #AB6993)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 14px rgba(171, 105, 147, 0.4)',
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
