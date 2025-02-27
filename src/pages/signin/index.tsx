import {
  Avatar,
  Button,
  Container,
  Divider,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { backendUrl } from "@/pages/_app";
import { Loading } from "@/components/Loading";
import { Email, Lock } from "@mui/icons-material";
import { useMediaQuery, useTheme } from "@mui/material";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { id, tenant_id: tenantId } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


  const { data, isPending } = useQuery({
    queryKey: ["fetchViewData"],
    queryFn: async () => {
      const { id, tenant_id: tenantId } = router.query;
      const response = await fetch(
        `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/view-data`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        console.error(response);
        throw new Error(response.status.toString());
      }
      return await response.json();
    },
  });

  const handleCancel = async () => {
    const response = await fetch(
      `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/deny`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const body = await response.json();
    console.log(response.status, body);
    if (body.redirect_uri) {
      window.location.href = body.redirect_uri;
    }
  };

  const handleNext = async () => {
    const response = await fetch(
      `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/password-authentication`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      },
    );
    if (response.ok) {
      router.push(`/signin/webauthn?id=${id}&tenant_id=${tenantId}`);
    }
  };

  useEffect(() => {
    const execute = async () => {
      const response = await fetch(
        `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/authorize-with-session`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        console.error(response);
        return;
      }
      const body = await response.json();
      console.log(response.status, body);
      if (body.redirect_uri) {
        window.location.href = body.redirect_uri;
      }
    };
    console.log(data);
    if (data && data.session_enabled === true) {
      execute();
    }
  }, [data]);

  if (isPending) return <Loading />;
  if (!data) return <Loading />;
  if (data && data.session_enabled) return <Loading />;

  return (
    <>
      <Container maxWidth={isMobile ? "xs" : "sm"}>
        <Paper sx={{ p: isMobile ? 2 : 3, boxShadow: 1, borderRadius: 3 }}>
          <Stack spacing={isMobile ? 2 : 3} alignItems="center">

            <Avatar src={data.logo_uri} sx={{ width: isMobile ? 48 : 64, height: isMobile ? 48 : 64 }} />

            <Typography variant={isMobile ? "body1" : "h6"} fontWeight="medium">
              {data.client_name}
            </Typography>

            <Stack spacing={2} width="100%">
              <TextField
                  name="email"
                  label="Email"
                  placeholder="test@gmail.com"
                  inputMode="email"
                  value={email}
                  fullWidth
                  required
                  InputProps={{
                    sx: { height: 48, fontSize: 16 },
                    startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={password}
                  fullWidth
                  required
                  InputProps={{
                    sx: { height: 48, fontSize: 16 },
                    startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                    ),
                  }}
                  onChange={(e) => {
                    navigator.credentials.preventSilentAccess();
                    setPassword(e.target.value);
                  }}
              />
            </Stack>

            <Stack spacing={1} width="100%">
              <Typography variant="body2" textAlign="center" color="text.secondary">
                By signing in, you agree to our
              </Typography>
              <Stack direction="column" alignItems="center">
                <Link
                    href={data.tos_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: "none", color: "primary.main", fontWeight: "bold", display: "block" }}
                >
                  Terms of Use
                </Link>
                <Link
                    href={data.policy_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: "none", color: "primary.main", fontWeight: "bold", display: "block" }}
                >
                  Privacy Policy
                </Link>
              </Stack>
            </Stack>

            <Stack spacing={1} width="100%">
              <Button
                  variant="contained"
                  color="primary"
                  disabled={!email || !password}
                  onClick={handleNext}
                  fullWidth
                  sx={{ textTransform: "none", borderRadius: 8, height: 48, fontSize: 16 }}
              >
                Next
              </Button>
              <Button
                  variant="text"
                  color="error"
                  onClick={handleCancel}
                  sx={{ textTransform: "none", fontSize: 14 }}
              >
                Cancel
              </Button>
            </Stack>

            <Divider sx={{ width: "100%", my: 1 }} />
            <Stack spacing={1} direction="row" justifyContent="center">
              <Typography variant="body2">{"Don't have an account?"}</Typography>
              <Link
                  onClick={() => router.push(`/signup?id=${id}&tenant_id=${tenantId}`)}
                  sx={{ fontWeight: "bold", cursor: "pointer", color: "primary.main", fontSize: 14 }}
              >
                Sign Up
              </Link>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
