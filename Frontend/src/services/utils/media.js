const MEDIA_BASE_URL =
  import.meta.env.VITE_RAILWAY_BUCKET_URL ||
  import.meta.env.VITE_PUBLIC_BUCKET_URL ||
  import.meta.env.VITE_S3_PUBLIC_URL ||
  import.meta.env.VITE_MEDIA_BASE_URL ||
  '';

export const resolveMediaUrl = (value) => {
  if (!value) return '';

  const stringValue = String(value).trim();
  if (
    stringValue.startsWith('data:') ||
    stringValue.startsWith('blob:') ||
    /^https?:\/\//i.test(stringValue) ||
    stringValue.startsWith('//')
  ) {
    return stringValue;
  }

  const baseUrl = MEDIA_BASE_URL.replace(/\/$/, '');
  const path = stringValue.replace(/^\/+/, '');
  return baseUrl ? `${baseUrl}/${path}` : stringValue;
};
