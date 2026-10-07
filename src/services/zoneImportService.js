import apiClient from "./apiClient";


// ============================================================
// DOWNLOAD ZONE EXCEL TEMPLATE
// ============================================================

export const downloadZoneTemplate = async () => {
  const response = await apiClient.get(
    "/zones/template",
    {
      responseType: "blob",
    }
  );

  const contentType =
    response.headers["content-type"] ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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

  link.download =
    "zone_upload_template.xlsx";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    blobUrl
  );

  return true;
};


// ============================================================
// BULK ZONE EXCEL UPLOAD
// ============================================================

export const uploadZonesExcel = async (
  plantId,
  file
) => {
  if (!plantId) {
    throw new Error(
      "Please select a plant."
    );
  }

  if (!file) {
    throw new Error(
      "Please select an Excel file."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await apiClient.post(
      `/zones/bulk-upload?plant_id=${plantId}`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;
};