import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { backendUrl } from "@/pages/_app";
import PolicyIcon from "@mui/icons-material/Policy";
import InfoIcon from "@mui/icons-material/Info";
import { Loading } from "@/components/Loading";
import KeyIcon from "@mui/icons-material/Key";
import { SignupStepper } from "@/components/SigninStepper";
import { Email, Lock } from "@mui/icons-material";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { id, tenant_id: tenantId } = router.query;
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
      <Container maxWidth={"sm"}>
        <Paper sx={{ m: 4, p: 4 }}>
          <Stack spacing={4}>
            <Typography variant={"h5"}>Sign In</Typography>

            <SignupStepper activeStep={0} />

            <Box display={"flex"} gap={4} alignItems={"center"}>
              <Avatar src={data.logo_uri} sx={{ width: 80, height: 80 }} />
              <Typography variant="h5">{data.client_name}</Typography>
            </Box>

            <TextField
              name={"email"}
              label={"email"}
              placeholder={"test@gmail.com"}
              inputMode="email"
              value={email}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              name={"password"}
              label={"password"}
              type="password"
              value={password}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => {
                navigator.credentials.preventSilentAccess()
                setPassword(e.target.value);
              }}
            />

            <List sx={{ p :0}}>
              <ListItem>
                <ListItemIcon>
                  <PolicyIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <a
                      href={data.tos_uri}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      term of use
                    </a>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <a
                      href={data.policy_uri}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      privacy policy
                    </a>
                  }
                />
              </ListItem>
            </List>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleCancel}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={!email || !password}
                onClick={handleNext}
                sx={{ textTransform: "none" }}
              >
                Next
              </Button>
            </Box>
            <Divider />
            <Box sx={{ gap: 2 }} display="flex">
              <Typography>{"Dont have an account?"}</Typography>
              <Link
                onClick={() => {
                  router.push(`/signup?id=${id}&tenant_id=${tenantId}`);
                }}
              >
                Sign Up
              </Link>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
