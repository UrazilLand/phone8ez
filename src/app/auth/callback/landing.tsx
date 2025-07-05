"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackLanding() {
  const router = useRouter();

  useEffect(() => {
    // URL 해시에서 토큰 추출
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      // 서버에 쿠키 저장 요청
      fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token, refresh_token }),
      }).then(() => {
        router.replace("/dashboard");
      });
    } else {
      router.replace("/auth/login?error=token_missing");
    }
  }, [router]);

  return <div>로그인 처리 중입니다...</div>;
} 