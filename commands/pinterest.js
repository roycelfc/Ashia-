export function isPinterestUrl(text) {
  try {
    const url = new URL(text);
    return (
      url.hostname === "pinterest.com" ||
      url.hostname.endsWith(".pinterest.com") ||
      url.hostname === "pin.it"
    );
  } catch {
    return false;
  }
}
export async function downloadPinterest() {
  throw new Error(
    "El servicio de Pinterest todavía no está configurado."
  );
}
