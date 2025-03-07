import {Loading} from "@/components/Loading";
import {useRouter} from "next/router";
import {useQuery} from "@tanstack/react-query";
import {backendUrl, useAppContext} from "@/pages/_app";
import {Typography} from "@mui/material";

const SsoCallback = () => {
    const router = useRouter();
    const { id, tenantId } = useAppContext();

    const { isError } = useQuery({
        queryKey: ["fetchViewData"],
        queryFn: async () => {
            const query = router.query;
            console.log(query)

            const response = await fetch(
                `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/sso-callback`,
                {
                    credentials: "include",
                    body: new URLSearchParams(query as Record<string, string>).toString()
                },
            );

            if (!response.ok) {
                console.error(response);
                throw new Error(response.status.toString());
            }

            const authorizeResponse = await fetch(
                `${backendUrl}/${tenantId}/api/v1/authorizations/${id}/authorize`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: "signin",
                    }),
                },
            );
            const body = await authorizeResponse.json();
            console.log(authorizeResponse.status, body);
            if (body.redirect_uri) {
                window.location.href = body.redirect_uri;
            }

        },
    });

    if (isError) return <Typography>sso is failed</Typography>


    return (
      <Loading />
    );
}

export default SsoCallback;

