import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import mammoth from 'mammoth';

// PDF parsing disabled due to complex dependency issues
// To re-enable: npm install pdf-parse@1.1.1 (older stable version)
const parsePDF = async (buffer: Buffer): Promise<{ text: string }> => {
  // Stub - PDF parsing temporarily disabled
  return { text: '[PDF content extraction temporarily disabled]' };
};

interface ExtractedFile {
  name: string;
  type: string;
  content: string;
  size: number;
}

async function extractTextFromFile(filename: string, buffer: Buffer): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  try {
    switch (ext) {
      case 'txt':
      case 'md':
      case 'csv':
      case 'json':
      case 'html':
      case 'xml':
        return buffer.toString('utf-8');
        
      case 'docx':
        const docResult = await mammoth.extractRawText({ buffer });
        return docResult.value;
        
      case 'pdf':
        const pdfData = await parsePDF(buffer);
        return pdfData.text;
        
      case 'rtf':
        // Basic RTF - strip formatting
        let rtfText = buffer.toString('utf-8');
        rtfText = rtfText.replace(/\\[a-z]+\d* ?/g, '');
        rtfText = rtfText.replace(/[{}]/g, '');
        return rtfText;
        
      default:
        // Try as text
        const text = buffer.toString('utf-8');
        // Check if it's readable text (not binary)
        if (/^[\x00-\x7F]*$/.test(text.slice(0, 1000)) || text.length < 100) {
          return text;
        }
        return `[Binary file: ${filename}]`;
    }
  } catch (error) {
    console.error(`Error extracting ${filename}:`, error);
    return `[Error reading ${filename}]`;
  }
}

async function extractZip(buffer: Buffer): Promise<ExtractedFile[]> {
  const zip = await JSZip.loadAsync(buffer);
  const files: ExtractedFile[] = [];
  
  const filePromises = Object.keys(zip.files).map(async (filename) => {
    const file = zip.files[filename];
    
    // Skip directories and hidden files
    if (file.dir || filename.startsWith('__MACOSX') || filename.startsWith('.')) {
      return null;
    }
    
    const fileBuffer = await file.async('nodebuffer');
    const content = await extractTextFromFile(filename, fileBuffer);
    
    if (content && !content.startsWith('[Binary') && !content.startsWith('[Error')) {
      return {
        name: filename,
        type: filename.split('.').pop() || 'unknown',
        content,
        size: fileBuffer.length
      };
    }
    return null;
  });
  
  const results = await Promise.all(filePromises);
  return results.filter((f): f is ExtractedFile => f !== null);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.toLowerCase();
    
    let extractedFiles: ExtractedFile[] = [];
    let combinedText = '';
    
    if (filename.endsWith('.zip')) {
      // Extract all files from zip
      extractedFiles = await extractZip(buffer);
      combinedText = extractedFiles.map(f => 
        `=== ${f.name} ===\n${f.content}`
      ).join('\n\n');
    } else {
      // Single file
      const content = await extractTextFromFile(filename, buffer);
      extractedFiles = [{
        name: filename,
        type: filename.split('.').pop() || 'unknown',
        content,
        size: buffer.length
      }];
      combinedText = content;
    }
    
    // Calculate stats
    const totalChars = combinedText.length;
    const fileTypes = [...new Set(extractedFiles.map(f => f.type))];
    
    return NextResponse.json({
      success: true,
      stats: {
        filesExtracted: extractedFiles.length,
        totalCharacters: totalChars,
        fileTypes,
        files: extractedFiles.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          contentLength: f.content.length
        }))
      },
      combinedText,
      preview: combinedText.slice(0, 2000) + (combinedText.length > 2000 ? '...' : '')
    });
    
  } catch (error) {
    console.error('File extraction error:', error);
    return NextResponse.json({ 
      error: 'Failed to extract files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
