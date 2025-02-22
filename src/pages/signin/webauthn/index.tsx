import { useState } from "react";
import { Container, Typography, Button, Box, CircularProgress } from "@mui/material";
import {useRouter} from "next/router";
import {backendUrl} from "@/pages/_app";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { id, tenant_id: tenantId } = router.query;

    const handleLogin = async () => {
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/webauthn/authentication/challenge`, {
                credentials: "include",
            });
            const { challenge } = await res.json();

            const credential = await navigator.credentials.get({
                publicKey: { challenge: new Uint8Array(atob(challenge).split("").map(c => c.charCodeAt(0))) }
            });

            const loginRes = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/webauthn/authentication/response`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credential)
            });

            if (loginRes.ok) {
                router.push(`/authorize?id=${id}&tenant_id=${tenantId}`);
                return
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
            <Typography variant="h4" gutterBottom>Passkey Login</Typography>
            <Box mt={2}>
                <Button variant="contained" color="secondary" onClick={handleLogin} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Login with Passkey"}
                </Button>
            </Box>
            {message && <Typography mt={2} color="secondary">{message}</Typography>}
        </Container>
    );
}
