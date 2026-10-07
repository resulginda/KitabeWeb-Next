import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './GoogleSignInButton.css';

/** Firebase projesi kitabeapp-eadd6 web istemcisi (gizli değil); sunucu bu kimliği kabul ediyor. */
const GOOGLE_WEB_CLIENT_ID = '306650499924-v1juk296rfpajktf2nm7mungj8n80lmc.apps.googleusercontent.com';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

type GsiButtonOptions = {
  type: 'standard';
  theme: 'outline' | 'filled_blue';
  size: 'large';
  text: 'continue_with' | 'signin_with';
  shape: 'rectangular' | 'pill';
  logo_alignment: 'left' | 'center';
  width: number;
  locale?: string;
};

type GsiApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    ux_mode?: 'popup';
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: GsiButtonOptions) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GsiApi } };
  }
}

let gsiLoader: Promise<GsiApi> | null = null;

function loadGsi(): Promise<GsiApi> {
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);
  if (!gsiLoader) {
    gsiLoader = new Promise<GsiApi>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const api = window.google?.accounts?.id;
        if (api) resolve(api);
        else reject(new Error('Google Identity Services yüklenemedi'));
      };
      script.onerror = () => {
        gsiLoader = null;
        reject(new Error('Google Identity Services yüklenemedi'));
      };
      document.head.appendChild(script);
    });
  }
  return gsiLoader;
}

type Props = {
  /** Google'ın verdiği ID token (JWT) */
  onCredential: (idToken: string) => void;
  text?: 'continue_with' | 'signin_with';
};

const GoogleSignInButton = ({ onCredential, text = 'continue_with' }: Props) => {
  const { i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    loadGsi()
      .then((gsi) => {
        const el = containerRef.current;
        if (cancelled || !el) return;
        // initialize genel bir ayar; sayfadaki son buton geri çağırmayı devralır
        gsi.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: (response) => {
            if (response.credential) callbackRef.current(response.credential);
          },
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        el.innerHTML = '';
        gsi.renderButton(el, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'center',
          width: Math.max(200, Math.min(400, Math.floor(el.clientWidth || 320))),
          locale: i18n.language,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [i18n.language, text]);

  if (failed) return null;
  return <div ref={containerRef} className="kb-google-btn" />;
};

export default GoogleSignInButton;
