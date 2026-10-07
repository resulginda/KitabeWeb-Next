import { useState } from 'react';

type Props = {
  url?: string | null;
  /** Fotoğraf yoksa ya da yüklenemezse gösterilen baş harfler */
  fallback: string;
};

/** Yuvarlak avatar kutusunun içi: profil fotoğrafı, yoksa baş harfler. */
const AvatarContent = ({ url, fallback }: Props) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!url || failedUrl === url) return <>{fallback}</>;
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(url)}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover', display: 'block' }}
    />
  );
};

export default AvatarContent;
