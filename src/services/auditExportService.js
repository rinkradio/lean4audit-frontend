import apiClient from "./apiClient";

const downloadFile = async (
  url,
  fallbackFilename
) => {
  const response = await apiClient.get(url, {
    responseType: "blob",
  });

  const contentType =
    response.headers["content-type"] ||
    "application/octet-stream";

  const contentDisposition =
    response.headers["content-disposition"];

  let filename = fallbackFilename;

  if (contentDisposition) {
    const match =
      contentDisposition.match(
        /filename="?([^"]+)"?/i
      );

    if (match?.[1]) {
      filename = match[1];
    }
  }

  const blob = new Blob(
    [response.data],
    {
      type: contentType,
    }
  );

  const blobUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = blobUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    blobUrl
  );

  return true;
};


export const exportAuditExcel = async (
  auditId
) => {
  return downloadFile(
    `/audits/${auditId}/export/excel`,
    `audit_${auditId}_report.xlsx`
  );
};


export const exportAuditPdf = async (
  auditId
) => {
  return downloadFile(
    `/audits/${auditId}/export/pdf`,
    `audit_${auditId}_report.pdf`
  );
};