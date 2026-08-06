"use client";

import { SWRConfig } from "swr";
import { AuthProvider } from "@/contexts/AuthContext";
import API from "@/lib/api";


const Provider = ({ children }) => {
    return (
        <SWRConfig
            value={{
                fetcher: (url) => API.get(url).then((res) => res.data),
                revalidateOnFocus: false,
                revalidateOnReconnect: true
            }} 
        >
            <AuthProvider>
                {children}
            </AuthProvider>
        </SWRConfig>
    )
}

export default Provider;

