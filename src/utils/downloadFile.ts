// utils/downloadFile.ts
export const downloadFile = async (url: string, fileName: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || "document";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // fallback — open in a new tab if the blob fetch is blocked
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
