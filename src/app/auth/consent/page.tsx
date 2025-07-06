"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ConsentPage() {
  const [agreed, setAgreed] = useState(false);
  const [referrer, setReferrer] = useState('');

  // 실제 동의 처리 함수(추후 API 연동 필요)
  const handleConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: users 테이블에 has_agreed_to_terms, agreed_at 업데이트 및 추천인 처리
    alert('동의가 완료되었습니다.');
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">개인정보 수집·이용 동의</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4 text-gray-800">
        <section>
          <h2 className="font-semibold text-lg mb-2">1. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>이메일, 닉네임, 프로필 이미지(소셜 로그인 시)</li>
            <li>결제 정보(구독 결제 시)</li>
            <li>IP주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">2. 개인정보 수집·이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>회원 가입 및 관리, 서비스 제공, 부정 이용 방지</li>
            <li>구독 결제 및 관리, 고객 문의 및 지원</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">3. 개인정보 보유·이용 기간</h2>
          <p className="text-sm">회원 탈퇴 시까지(단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)</p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">4. 동의 거부 권리 및 불이익</h2>
          <p className="text-sm">
            개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 단, 필수 항목 동의 거부 시 회원가입 및 서비스 이용이 제한될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-2">5. 추천인 이메일(선택)</h2>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mt-1 text-sm"
            placeholder="추천인 이메일(선택)"
            value={referrer}
            onChange={e => setReferrer(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">입력 시, 이미 가입된 회원만 추천인으로 등록됩니다.</p>
        </section>
        <div className="flex items-center mt-4">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="w-4 h-4 mr-2"
          />
          <label htmlFor="agree" className="text-sm font-medium">
            (필수) 개인정보 수집·이용에 동의합니다.
          </label>
        </div>
        <div className="flex justify-between mt-4 text-xs">
          <Link href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</Link>
          <Link href="/terms" className="text-blue-600 hover:underline">이용약관</Link>
        </div>
        <button
          type="submit"
          onClick={handleConsent}
          disabled={!agreed}
          className={`w-full mt-6 py-3 rounded font-bold text-white transition ${
            agreed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          동의
        </button>
      </div>
    </div>
  );
}
