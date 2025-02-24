import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import { useRouter } from "next/router";
import { backendUrl } from "@/pages/_app";
import KeyIcon from "@mui/icons-material/Key";
import { SignupStepper } from "@/components/SigninStepper";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { id, tenant_id: tenantId } = router.query;

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/webauthn/authentication/challenge`,
        {
          credentials: "include",
        },
      );
      const { challenge } = await res.json();
      const decodedChallenge = challenge.replace(/-/g, "+").replace(/_/g, "/");

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(
            atob(decodedChallenge)
              .split("")
              .map((c) => c.charCodeAt(0)),
          ),
        },
      });

      const loginRes = await fetch(
        `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/webauthn/authentication/response`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credential),
        },
      );

      if (loginRes.ok) {
        router.push(`/signin/authorize?id=${id}&tenant_id=${tenantId}`);
        return;
      }

      setMessage("Login failed.");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during login.");
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ m: 4, p: 4, boxShadow: 3 }}>
        <Stack spacing={4}>
          <Typography variant="h5">Sign In</Typography>

          <SignupStepper activeStep={1} />

          <Box display={"flex"} gap={4} alignItems={"center"}>
            <KeyIcon sx={{ fontSize: 50, color: "primary.secondary" }} />
            <Typography variant="h5">Passkey Login</Typography>
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              disabled={loading}
              sx={{ width: "100%", textTransform: "none" }}
            >
              {loading ? <CircularProgress size={24} /> : "Next"}
            </Button>
          </Box>
          {message && (
            <Typography mt={2} color="secondary">
              {message}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
