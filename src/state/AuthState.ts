import { atomWithStorage, createJSONStorage } from "jotai/utils";

const sessionStorage =
    typeof window !== "undefined"
        ? createJSONStorage(() => window.localStorage)
        : undefined;

export const authSessionIdAtom = atomWithStorage(
  "authSessionId",
  "",
  sessionStorage,
  {
    getOnInit: true,
  },
);

export const authSessionTenantIdAtom = atomWithStorage(
  "authSessionTenantId",
  "",
  sessionStorage,
  {
    getOnInit: true,
  },
);
