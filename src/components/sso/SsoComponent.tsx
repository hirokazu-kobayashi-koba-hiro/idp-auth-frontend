import { Button, Stack, Typography } from "@mui/material";
import { backendUrl } from "@/pages/_app";
import { useState } from "react";
import { useAtom } from "jotai";
import { authSessionIdAtom, authSessionTenantIdAtom } from "@/state/AuthState";

export const SsoComponent = ({}) => {
  const [authSessionId] = useAtom(authSessionIdAtom);
  const [authSessiontenantId] = useAtom(authSessionTenantIdAtom);
  const [message, setMessage] = useState("");

  const handleClick = async (idpId: string) => {
    const response = await fetch(
      `${backendUrl}/${authSessiontenantId}/api/v1/authorizations/${authSessionId}/federations`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          federatable_idp_id: idpId,
        }),
      },
    );

    if (response.ok) {
      const body = await response.json();
      console.log(response.status, body);
      if (body.redirect_uri) {
        window.location.href = body.redirect_uri;
        return;
      }
    }
    setMessage("failed sso. system error occurred");
  };

  return (
    <Stack spacing={1}>
      <Button
        variant={"outlined"}
        sx={{ textTransform: "none" }}
        fullWidth
        onClick={async () => {
          await handleClick("1e68932e-ed4a-43e7-b412-460665e42df3");
        }}
      >
        Signin with Google
      </Button>
      <Button variant={"outlined"} sx={{ textTransform: "none" }} fullWidth>
        Signin with GitHub
      </Button>
      {message && <Typography variant={"caption"} color={"error"}>{message}</Typography>}
    </Stack>
  );
};
