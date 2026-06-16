/** AdSense / Funding Choices — preconnect (LCP bağlantı gecikmesi) */
export function AdResourceHints() {
  return (
    <>
      <link rel="preconnect" href="https://fundingchoicesmessages.google.com" />
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
    </>
  );
}
