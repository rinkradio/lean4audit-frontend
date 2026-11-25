import apiClient from "./apiClient";

const downloadFile = async (url, fallbackFilename) => {
  const response = await apiClient.get(url, {
    responseType: "blob",
  });

  const contentType =
    response.headers["content-type"] || "application/octet-stream";

  const contentDisposition =
    response.headers["content-disposition"];

  let filename = fallbackFilename;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/i);

    if (match?.[1]) {
      filename = match[1];
    }
  }

  const blob = new Blob([response.data], {
    type: contentType,
  });

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(blobUrl);

  return true;
};

const buildExportUrl = (auditId, format, options = {}) => {
  const params = new URLSearchParams();

  if (options.observationType) {
    params.set("observation_type", options.observationType);
  }

  if (options.observationId) {
    params.set("observation_id", options.observationId);
  }

  if (Array.isArray(options.selectedObservationIds)) {
    options.selectedObservationIds.forEach((id) => {
      params.append("selected_observation_ids", id);
    });
  }

  const query = params.toString();

  return `/audits/${auditId}/export/${format}${
    query ? `?${query}` : ""
  }`;
};

export const previewAuditExcel = async (auditId, options = {}) => {
  const url = buildExportUrl(auditId, "preview", options);
  const response = await apiClient.get(url);

  return response.data;
};

export const exportAuditExcel = async (auditId, options = {}) => {
  return downloadFile(
    buildExportUrl(auditId, "excel", options),
    `audit_${auditId}_report.xlsx`
  );
};

export const exportAuditPdf = async (auditId, options = {}) => {
  return downloadFile(
    buildExportUrl(auditId, "pdf", options),
    `audit_${auditId}_report.pdf`
  );
};