"use client";
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      // サインアップ
      const { error } = await supabase.auth.signUp({ email, password })
      setMessage(error ? error.message : '確認メールを送信しました')
    } else {
      // ログイン
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setMessage(error ? error.message : 'ログインしました')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#14161f]">
      <form onSubmit={handleAuth} className="bg-white/10 p-8 rounded-lg shadow-md flex flex-col gap-4 w-full max-w-xs">
        <h2 className="text-xl font-bold text-center text-white mb-2">{isSignUp ? 'サインアップ' : 'ログイン'}</h2>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded border"
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border"
          required
        />
        <button disabled={loading} className="bg-blue-600 text-white rounded py-2 font-bold">
          {loading ? '送信中...' : isSignUp ? 'サインアップ' : 'ログイン'}
        </button>
        <button type="button" className="text-blue-400 underline mt-2" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'ログインはこちら' : '新規登録はこちら'}
        </button>
        {message && <div className="text-center text-sm text-white mt-2">{message}</div>}
        <hr className="my-4 border-white/30" />
        <button
          type="button"
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: 'http://localhost:3000/auth/callback' }
            });
            if (error) alert(error.message);
          }}
          className="bg-red-500 text-white rounded px-4 py-2 w-full font-bold hover:bg-red-600 transition"
        >
          Googleでログイン
        </button>
      </form>
    </div>
  )
}