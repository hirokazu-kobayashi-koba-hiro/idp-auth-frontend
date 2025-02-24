import {Box, Button, Container, Divider, Link, Paper, Stack, TextField, Typography} from "@mui/material";
import {useRouter} from "next/router";
import {backendUrl} from "@/pages/_app";
import { useState } from "react";

const EmailVerification = () => {
    const router = useRouter();
    const [verificationCode, setVerificationCode] = useState("");
    const { id, tenant_id: tenantId } = router.query;

    const handleReSend = async () => {
        const response = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/email-verification/challenge`, {
            method: "POST",
            credentials: "include",
        })
        if (!response.ok) {
            throw new Error("sending email verification code is failed")
        }
    }

    const handleNext = async () => {
        const response = await fetch(`${backendUrl}/${tenantId}/api/v1/authorizations/${id}/email-verification/verify`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                verification_code: verificationCode,
            })
        })

        if (response.ok) {
            router.push(`/signup/webauthn?id=${id}&tenant_id=${tenantId}`);
        }
    }

    return (
        <>
            <Container maxWidth={"xs"}>
                <Paper sx={{m: 4, p:4}}>
                    <Stack spacing={4}>
                        <Typography variant={"h6"}>Email Verification</Typography>
                        <Typography variant={"body1"}>email </Typography>
                        <TextField
                            label={"verification code"}
                            inputMode={"numeric"}
                            placeholder={"000000"}
                            onChange={(e) => {
                                setVerificationCode(e.target.value);
                            }}
                        />
                        <Button
                            variant={"contained"}
                            sx={{ textTransform: "none"}}
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                        <Box sx={{mt: 2}} >
                            <Divider />
                        </Box>
                        <Box sx={{mt: 2, gap: 2}} display="flex">
                            <Link
                                onClick={handleReSend}>
                                ReSend verification code
                            </Link>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </>
    )
};

export default EmailVerification;