# How to Generate Cloudflare Turnstile Keys

To move from "Testing Mode" to "Production", you need to generate real API keys from Cloudflare.

## Steps

1.  **Log in to Cloudflare**: Go to [dash.cloudflare.com](https://dash.cloudflare.com/).
2.  **Navigate to Turnstile**: On the sidebar, click **Turnstile**.
3.  **Add Site**: Click the **Add Site** button.
4.  **Configure Site**:
    *   **Site Name**: Enter "Hemant Trauma Centre".
    *   **Domain**: Enter your production domain (e.g., `hemanttraumacentre.com`) AND `localhost` (for testing).
    *   **Widget Mode**: Select **Managed** (Recommended).
5.  **Get Keys**:
    *   Copy the **Site Key**.
    *   Copy the **Secret Key**.
6.  **Update Vercel**:
    *   Go to your Vercel Project Settings -> Environment Variables.
    *   Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` with your **Site Key**.
    *   Add `TURNSTILE_SECRET_KEY` with your **Secret Key**.
