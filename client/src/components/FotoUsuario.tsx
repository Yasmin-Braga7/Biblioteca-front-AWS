import { useEffect, useState } from "react";
import { usuarios } from "@/services/api";

interface FotoUsuarioProps {
  usuarioId: number;
  className?: string;
  alt?: string;
  fallback: React.ReactNode;
  refreshKey?: number | string;
}

export function FotoUsuario({ usuarioId, className, alt = "", fallback, refreshKey }: FotoUsuarioProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelado = false;

    setErro(false);
    setUrl(null);

    usuarios
      .getFoto(usuarioId)
      .then((blobUrl) => {
        if (cancelado) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        objectUrl = blobUrl;
        setUrl(blobUrl);
      })
      .catch(() => {
        if (!cancelado) setErro(true);
      });

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [usuarioId, refreshKey]);

  if (erro || !url) {
    return <>{fallback}</>;
  }

  return <img src={url} alt={alt} className={className} onError={() => setErro(true)} />;
}
