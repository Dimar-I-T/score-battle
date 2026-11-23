"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, SessionState } from "@/lib/types";

export default function useSession(): SessionState {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const tokenFromLocal = localStorage.getItem("token");
    if (!tokenFromLocal) {
      alert("Unauthorized, please login.");
      setIsLoading(false);
      router.push("/auth/login");
      return;
    }

    setToken(tokenFromLocal);
    alert("token: " + tokenFromLocal);

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${tokenFromLocal}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert("Session has expired, please login.");
          router.push("/auth/login");
          return;
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const cachedUser = localStorage.getItem("user");
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch {
            }
          }
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          const cachedUser = localStorage.getItem("user");
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch {
            }
          }
          return;
        }

        if (result.data) {
          setUser(result.data);
          localStorage.setItem("user", JSON.stringify(result.data));
        }
      } catch (error) {
        console.error("Failed to fetch data user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return { user, isLoading, token };
}