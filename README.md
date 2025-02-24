This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3100](http://localhost:3100) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

### signup

```shell
curl -v 'http://localhost:8080/67e7eae6-62b0-4500-9eff-87459f63fc66/api/v1/authorizations?prompt=create&scope=openid+profile+phone+emailaccount+transfers&response_type=code&client_id=clientSecretPost&redirect_uri=https%3A%2F%2Fwww.certification.openid.net%2Ftest%2Fa%2Fidp_oidc_basic%2Fcallback&state=aiueo&organization_id=123&organization_name=test'
```

### signin

```shell
curl -v 'http://localhost:8080/67e7eae6-62b0-4500-9eff-87459f63fc66/api/v1/authorizations?prompt=login&scope=openid+profile+phone+emailaccount+transfers&response_type=code&client_id=clientSecretPost&redirect_uri=https%3A%2F%2Fwww.certification.openid.net%2Ftest%2Fa%2Fidp_oidc_basic%2Fcallback&state=aiueo&organization_id=123&organization_name=test'
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

```
import { useState } from "react";
import { Container, Typography, Button, Box, Card, CardContent, CircularProgress } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/webauthn/register/challenge");
      const { challenge } = await res.json();

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(atob(challenge).split("").map(c => c.charCodeAt(0))),
          rp: { name: "Passkey Demo" },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "Example User"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }]
        }
      });

      const registerRes = await fetch("/api/webauthn/register/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential })
      });

      if (registerRes.ok) {
        setMessage("✅ Passkey registered successfully!");
      } else {
        setMessage("❌ Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ An error occurred during registration.");
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Card sx={{ mt: 5, p: 3, textAlign: "center", boxShadow: 3 }}>
        <CardContent>
          <PersonAddIcon sx={{ fontSize: 50, color: "primary.main" }} />
          <Typography variant="h5" gutterBottom>Register Passkey</Typography>
          <Typography variant="body2" color="text.secondary">
            Secure your account with a passkey for fast authentication.
          </Typography>
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegister}
              disabled={loading}
              sx={{ width: "100%", py: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : "Register Now"}
            </Button>
          </Box>
          {message && <Typography mt={2} color="primary">{message}</Typography>}
        </CardContent>
      </Card>
    </Container>
  );
}

```
