import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import {backendUrl, useAppContext} from "@/pages/_app";
import { useRouter } from "next/router";

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter();
  const { setUserId } = useAppContext();
  const { id, tenant_id: tenantId } = router.query;

  const handleClick = async () => {
    const response = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: email,
        password: password,
      })
    })
    if (!response.ok) {
      console.error(response.status)
      return
    }
    const body = await response.json();
    console.log(body)
    setUserId(body.id)

    const sendingEmailResponse = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/email-verification/challenge`, {
      method: "POST",
      credentials: "include",
    })

    if (!sendingEmailResponse.ok) {
      console.error("sending email verification code is failed")
    }

    router.push(`/signup/email?id=${id}&tenant_id=${tenantId}`);
  }

  return (
    <>
      <Container maxWidth={"xs"}>
        <Paper sx={{ m: 4, p: 4}}>
          <Typography variant={"h5"}>Sign Up</Typography>
          <Box mt={4} display="flex" flexDirection={"column"} sx={{ gap: 4,}}>
            <TextField
              name={"email"}
              label={"email"}
              placeholder={"test@gmail.com"}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
              }} />
            <TextField
              name={"password"}
              label={"password"}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }} />
            <Button variant={"contained"} onClick={handleClick}>
              Next
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
