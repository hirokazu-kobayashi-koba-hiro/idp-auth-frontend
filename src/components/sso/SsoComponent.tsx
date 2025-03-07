import { Button, Stack } from "@mui/material";
import { backendUrl, useAppContext } from "@/pages/_app";

export const SsoComponent = ({}) => {
  const { id, tenantId } = useAppContext();

  const handleClick = async (idpId: string) => {
    const response = await fetch(
      `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/password-authentication`,
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
      }
    }
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
    </Stack>
  );
};
