import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Combine, SplitSquareHorizontal, Minimize, 
  FileText, FileImage, Shield, RotateCw, Edit,
  Presentation, FileSpreadsheet, Key, Droplet,
  Layers, CheckSquare, Search, FileBadge,
  Layout, ListOrdered, Wrench, Scan
} from 'lucide-react';

export default function Home() {
  const tools = [
    {
      id: 'merge', title: 'Merge PDF',
      description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
      icon: <Combine size={32} />, link: '/merge_pdf', color: 'var(--tool-merge)'
    },
    {
      id: 'split', title: 'Split PDF',
      description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
      icon: <SplitSquareHorizontal size={32} />, link: '/split_pdf', color: 'var(--tool-split)'
    },
    {
      id: 'compress', title: 'Compress PDF',
      description: 'Reduce file size while optimizing for maximal PDF quality.',
      icon: <Minimize size={32} />, link: '/compress_pdf', color: 'var(--tool-compress)'
    },
    {
      id: 'pdf-to-word', title: 'PDF to Word',
      description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.',
      icon: <FileText size={32} />, link: '/pdf_to_word', color: 'var(--tool-convert)'
    },
    {
      id: 'pdf-to-powerpoint', title: 'PDF to PowerPoint',
      description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
      icon: <Presentation size={32} />, link: '/pdf_to_powerpoint', color: 'var(--tool-convert)'
    },
    {
      id: 'pdf-to-excel', title: 'PDF to Excel',
      description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
      icon: <FileSpreadsheet size={32} />, link: '/pdf_to_excel', color: 'var(--tool-convert)'
    },
    {
      id: 'word-to-pdf', title: 'Word to PDF',
      description: 'Make DOC and DOCX files easy to read by converting them to PDF.',
      icon: <FileText size={32} />, link: '/word_to_pdf', color: 'var(--tool-convert)'
    },
    {
      id: 'powerpoint-to-pdf', title: 'PowerPoint to PDF',
      description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
      icon: <Presentation size={32} />, link: '/powerpoint_to_pdf', color: 'var(--tool-convert)'
    },
    {
      id: 'excel-to-pdf', title: 'Excel to PDF',
      description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.',
      icon: <FileSpreadsheet size={32} />, link: '/excel_to_pdf', color: 'var(--tool-convert)'
    },
    {
      id: 'edit-pdf', title: 'Edit PDF',
      description: 'Add text, images, shapes or freehand annotations to a PDF document.',
      icon: <Edit size={32} />, link: '/edit-pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'pdf-to-jpg', title: 'PDF to JPG',
      description: 'Convert each PDF page into a JPG or extract all images contained in a PDF.',
      icon: <FileImage size={32} />, link: '/pdf_to_jpg', color: 'var(--tool-convert)'
    },
    {
      id: 'jpg-to-pdf', title: 'JPG to PDF',
      description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
      icon: <FileImage size={32} />, link: '/jpg_to_pdf', color: 'var(--tool-convert)'
    },
    {
      id: 'sign-pdf', title: 'Sign PDF',
      description: 'Sign yourself or request electronic signatures from others.',
      icon: <CheckSquare size={32} />, link: '/sign-pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'watermark', title: 'Watermark',
      description: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.',
      icon: <Droplet size={32} />, link: '/watermark', color: 'var(--tool-edit)'
    },
    {
      id: 'rotate-pdf', title: 'Rotate PDF',
      description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
      icon: <RotateCw size={32} />, link: '/rotate_pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'html-to-pdf', title: 'HTML to PDF',
      description: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.',
      icon: <Layout size={32} />, link: '/html_to_pdf', color: 'var(--tool-convert)'
    },
    {
      id: 'unlock-pdf', title: 'Unlock PDF',
      description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
      icon: <Key size={32} />, link: '/unlock_pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'protect-pdf', title: 'Protect PDF',
      description: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
      icon: <Shield size={32} />, link: '/protect-pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'organize-pdf', title: 'Organize PDF',
      description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.',
      icon: <Layers size={32} />, link: '/organize_pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'pdf-to-pdfa', title: 'PDF to PDF/A',
      description: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving.',
      icon: <FileBadge size={32} />, link: '/pdf_to_pdfa', color: 'var(--tool-convert)'
    },
    {
      id: 'repair-pdf', title: 'Repair PDF',
      description: 'Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.',
      icon: <Wrench size={32} />, link: '/repair_pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'page-numbers', title: 'Page numbers',
      description: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.',
      icon: <ListOrdered size={32} />, link: '/page_numbers', color: 'var(--tool-edit)'
    },
    {
      id: 'scan-to-pdf', title: 'Scan to PDF',
      description: 'Capture document scans from your mobile device and send them instantly to your browser.',
      icon: <Scan size={32} />, link: '/scan_to_pdf', color: 'var(--tool-edit)'
    },
    {
      id: 'ocr-pdf', title: 'OCR PDF',
      description: 'Convert non-selectable PDF text into a searchable and selectable PDF document.',
      icon: <Search size={32} />, link: '/ocr_pdf', color: 'var(--tool-edit)'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Every tool you need to work with PDFs in one place</h1>
        <h2 style={styles.subtitle}>
          Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! 
          Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
        </h2>
      </div>

      <div className="tool-grid">
        {tools.map(tool => (
          <Link 
            to={tool.link} 
            key={tool.id} 
            className="tool-card animate-fade-in"
            style={{ '--tool-color': tool.color }}
          >
            <div className="tool-icon">
              {tool.icon}
            </div>
            <h3 style={styles.cardTitle}>{tool.title}</h3>
            <p style={styles.cardDesc}>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '80px',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 24px 40px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  title: {
    fontSize: '44px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '20px',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: '400',
    color: '#666',
    lineHeight: '1.6',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  cardDesc: {
    fontSize: '15px',
    color: '#666',
    lineHeight: '1.5',
  }
};
