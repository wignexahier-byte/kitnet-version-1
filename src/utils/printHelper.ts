/**
 * Utilitário universal e seguro para impressão e cópia de contratos,
 * 100% compatível com iframes, navegadores mobile (iOS Safari/Android)
 * e bloqueadores de popups.
 */

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Falha silenciosa para tentar fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Erro ao copiar para área de transferência:', err);
    return false;
  }
}

export function printContractDocument(title: string, rawText: string, htmlContent?: string): void {
  const content = htmlContent || `
    <div style="white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.55; color: #0f172a;">
      ${rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>
  `;

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 11.5px;
            line-height: 1.55;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 16px;
          }
          h1, h2, h3, h4 {
            color: #0f172a;
            margin-top: 0;
          }
          .contract-header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .contract-title {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .contract-subtitle {
            font-size: 10px;
            color: #475569;
            text-transform: uppercase;
          }
          .contract-clause {
            margin-bottom: 14px;
            text-align: justify;
          }
          .clause-heading {
            font-weight: 700;
            font-size: 11.5px;
            color: #0f172a;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .signatures-block {
            margin-top: 36px;
            page-break-inside: avoid;
          }
          .signatures-row {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 28px;
          }
          .signature-box {
            flex: 1;
            text-align: center;
            border-top: 1px solid #0f172a;
            padding-top: 6px;
            font-size: 10.5px;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  // 1. Tenta abrir janela de impressão (modo ideal em desktop fora de iframe)
  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank');
  } catch (e) {
    printWindow = null;
  }

  if (printWindow && !printWindow.closed) {
    try {
      printWindow.document.open();
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      setTimeout(() => {
        try {
          printWindow?.focus();
          printWindow?.print();
        } catch (err) {
          console.warn('Erro ao chamar print na popup, tentando fallback:', err);
          fallbackIframePrint(fullHtml);
        }
      }, 400);
      return;
    } catch (err) {
      console.warn('Erro ao manipular popup de impressão:', err);
    }
  }

  // 2. Fallback obrigatório: Iframe invisível (indispensável para iframes, iOS Safari e popup blockers)
  fallbackIframePrint(fullHtml);
}

function fallbackIframePrint(html: string): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.error('Erro ao acionar impressão no iframe:', err);
          // Último recurso: aciona a impressão da própria janela
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 500);
    }
  } catch (e) {
    console.error('Falha geral no sistema de impressão:', e);
    window.print();
  }
}
