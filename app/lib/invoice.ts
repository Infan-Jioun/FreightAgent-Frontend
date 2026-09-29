/**
 * Invoice & Receipt Resolution & Download Utilities
 * Provides resilient resolution for local server invoice PDF URLs and direct browser downloads.
 */

export function resolveInvoiceUrl(
  rawInvoiceUrl?: string | null,
  trackingId?: string
): string {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
  // serverOrigin is e.g. "http://localhost:5000"
  const serverOrigin = apiBase.replace(/\/api\/v1$/, "");

  if (rawInvoiceUrl && typeof rawInvoiceUrl === "string" && rawInvoiceUrl.trim()) {
    let url = rawInvoiceUrl.trim();

    // Clean duplicate api/v1 segments
    url = url.replace(/\/api\/v1\/api\/v1/g, "/api/v1");

    // Full URL
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Relative URL
    if (url.startsWith("/api/v1/")) {
      return `${serverOrigin}${url}`;
    }
    if (url.startsWith("/")) {
      return `${apiBase}${url}`;
    }
    return `${apiBase}/${url}`;
  }

  // Fallback to standard backend invoice PDF endpoint
  if (trackingId) {
    return `${serverOrigin}/api/v1/payment/invoice-pdf/${encodeURIComponent(trackingId)}`;
  }

  return `${serverOrigin}/api/v1/payment/invoice-pdf/unknown`;
}

/**
 * Trigger direct file download in the browser as a .pdf blob,
 * with fallback to opening in a new tab if blob fetch fails.
 */
export async function downloadInvoicePdf(
  invoiceUrl: string,
  trackingId?: string
): Promise<void> {
  const fileName = `Invoice_${trackingId || "receipt"}.pdf`;

  try {
    const response = await fetch(invoiceUrl, {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download invoice: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn("Direct blob download failed, falling back to new tab:", error);
    if (typeof window !== "undefined") {
      window.open(invoiceUrl, "_blank", "noopener,noreferrer");
    }
  }
}

/**
 * Safely open invoice PDF in a new browser tab
 */
export function openInvoicePdf(invoiceUrl: string): void {
  if (typeof window !== "undefined") {
    window.open(invoiceUrl, "_blank", "noopener,noreferrer");
  }
}
