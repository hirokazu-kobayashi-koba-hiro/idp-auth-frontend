import { useState } from "react";
import {Container, Typography, Button, Box, CircularProgress, Card, CardContent} from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {useRouter} from "next/router";
import {backendUrl, useAppContext} from "@/pages/_app";

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { userId } = useAppContext();
    const { id, tenant_id: tenantId } = router.query;

    const handleRegister = async () => {
        setLoading(true);
        setMessage("");

        try {

            const res = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/webauthn/registration/challenge`, {
                credentials: "include",
            });
            const { challenge } = await res.json();

            const userIdBytes = new TextEncoder().encode(userId || "");

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: new Uint8Array(atob(challenge).split("").map(c => c.charCodeAt(0))),
                    rp: { name: "Passkey Demo" },
                    user: {
                        id: userIdBytes,
                        name: uuidv4(),
                        displayName: "test"
                    },
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }]
                }
            });

            const registerRes = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/webauthn/registration/response`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credential)
            });

            if (registerRes.ok) {
                setMessage("Passkey registration successful!");
                router.push(`/authorize?id=${id}&tenant_id=${tenantId}`);
                return
            }
            setMessage("Registration failed.");
        } catch (error) {
            console.error(error);
            setMessage("An error occurred during registration.");
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
