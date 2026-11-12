import { useEffect, useState } from "preact/hooks";

export default function BlockAction() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((response) => setSignedIn(response.ok))
      .catch(() => setSignedIn(false));
  }, []);

  return signedIn
    ? <a class="primary-button" href="/blocks/new">＋ Add Delivery Block</a>
    : <a class="secondary-button" href="/login">Sign in to manage blocks</a>;
}
