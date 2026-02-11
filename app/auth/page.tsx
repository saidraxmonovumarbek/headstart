'use client'

import { signIn } from "next-auth/react"
import { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [shake, setShake] = useState(false)

  const handleLogin = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    const res = await signIn('credentials', {
  redirect: false,
  email,
  password,
  callbackUrl: "/admin",
})

    if (res?.error) {
      setErrorMessage('Incorrect email or password')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    if (res?.ok) {
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()

      if (session?.user?.role === 'admin') {
  window.location.href = '/admin'
} else if (session?.user?.role === 'teacher') {
  window.location.href = '/teacher'
} else {
  window.location.href = '/student'
}
    }
  }

  const handleRegister = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    let data = null;

try {
  data = await res.json();
} catch (err) {
  data = { error: "Invalid server response" };
}

    if (!res.ok) {
      setErrorMessage(data.error || 'User already exists')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setSuccessMessage('Account created successfully')
    setIsLogin(true)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative">

      {/* Background */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/weareheadstart.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/20 -z-10" />

      {/* DESKTOP CARD */}
<div className="hidden md:block relative mx-auto w-[800px] max-w-[90%] h-[430px] bg-white/90 rounded-3xl shadow-2xl overflow-hidden">

        {/* FORM CONTAINER */}
<div className="absolute inset-0 z-0 overflow-hidden">
  <div
    className={`flex h-full w-[200%] transition-transform duration-700 ease-in-out ${
      isLogin ? 'translate-x-0' : '-translate-x-1/2'
    }`}
  >

{/* LOGIN */}
<div className="w-1/2 flex items-center justify-start pl-16">
  <div className="w-[300px] flex flex-col items-start">

    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
      Login
    </h2>

    {errorMessage && isLogin && (
      <div className={`text-red-500 text-sm mb-3 ${shake ? 'animate-shake' : ''}`}>
        {errorMessage}
      </div>
    )}

    {successMessage && isLogin && (
      <div className="text-green-600 text-sm mb-3">
        {successMessage}
      </div>
    )}

    <div className="space-y-4">
      <Input
        icon={<Mail size={18} />}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        icon={<Lock size={18} />}
        placeholder="Password"
        isPassword
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="w-full py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold"
      >
        Login
      </button>
    </div>

  </div>
</div>


{/* REGISTER */}
<div className="w-1/2 flex items-center justify-end pr-16">
  <div className="w-[250px] flex flex-col items-start">

    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
      Register
    </h2>

    {errorMessage && !isLogin && (
      <div className={`text-red-500 text-sm mb-3 ${shake ? 'animate-shake' : ''}`}>
        {errorMessage}
      </div>
    )}

    {successMessage && !isLogin && (
      <div className="text-green-600 text-sm mb-3">
        {successMessage}
      </div>
    )}

    <div className="space-y-4">
      <Input
        icon={<User size={18} />}
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        icon={<Mail size={18} />}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        icon={<Lock size={18} />}
        placeholder="Password"
        isPassword
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="w-full py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold"
      >
        Register
      </button>
    </div>

  </div>
</div>

</div>
</div>

        {/* GREEN PANEL */}
<div
  className={`absolute top-0 left-0 h-full w-1/2 bg-green-600 text-white flex flex-col items-center justify-center p-10 transition-all duration-700 ease-in-out ${
    isLogin
      ? 'translate-x-full rounded-l-[120px]'
      : 'translate-x-0 rounded-r-[120px]'
  }`}
>
  {isLogin ? (
    <>
      <h2 className="text-2xl font-bold mb-4">Hello, Welcome!</h2>
      <p className="mb-6 text-center text-sm">
        Don't have an account?
      </p>
      <button
  onClick={() => setIsLogin(false)}
  className="px-6 py-2 border border-white rounded-xl hover:bg-white hover:text-green-600 transition text-sm font-semibold"
>
  Register
</button>
    </>
  ) : (
    <>
      <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
      <p className="mb-6 text-center text-sm">
        Already have an account?
      </p>
      <button
        onClick={() => setIsLogin(true)}
        className="px-6 py-2 border border-white rounded-xl hover:bg-white hover:text-green-600 transition text-sm font-semibold"
      >
        Login
      </button>
    </>
  )}
</div>

      </div>

    {/* MOBILE VERSION */}
<div className="md:hidden w-full max-w-[95%] mx-auto bg-white/95 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">

  {/* TOP GREEN PANEL */}
  <div
    className={`overflow-hidden transition-all duration-500 ease-in-out ${
      isLogin ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
    }`}
  >
    <div className="bg-green-600 text-white text-center p-8 rounded-b-[40px]">
      <h2 className="text-xl font-bold mb-2">Hello, Welcome!</h2>
      <p className="text-sm mb-4">Don't have an account?</p>
      <button
        onClick={() => setIsLogin(false)}
        className="px-5 py-2 border border-white rounded-xl hover:bg-white hover:text-green-600 transition text-sm font-semibold"
      >
        Register
      </button>
    </div>
  </div>

  {/* FORM */}
  <div className="p-8 transition-all duration-500 ease-in-out">
    <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center transition-all duration-500">
      {isLogin ? "Login" : "Register"}
    </h2>

    {errorMessage && (
      <div className={`text-red-500 text-sm mb-3 text-center ${shake ? 'animate-shake' : ''}`}>
        {errorMessage}
      </div>
    )}

    {successMessage && (
      <div className="text-green-600 text-sm mb-3 text-center">
        {successMessage}
      </div>
    )}

    <div className="space-y-4 transition-all duration-500 ease-in-out">

      <div
        className={`transition-all duration-500 ease-in-out ${
          isLogin ? "max-h-0 opacity-0 overflow-hidden" : "max-h-40 opacity-100"
        }`}
      >
        <Input
          icon={<User size={18} />}
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <Input
        icon={<Mail size={18} />}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        icon={<Lock size={18} />}
        placeholder="Password"
        isPassword
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={isLogin ? handleLogin : handleRegister}
        className="w-full py-3 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold"
      >
        {isLogin ? "Login" : "Register"}
      </button>

    </div>
  </div>

  {/* BOTTOM GREEN PANEL */}
  <div
    className={`overflow-hidden transition-all duration-500 ease-in-out ${
      !isLogin ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
    }`}
  >
    <div className="bg-green-600 text-white text-center p-8 rounded-t-[40px]">
      <h2 className="text-xl font-bold mb-2">Welcome Back!</h2>
      <p className="text-sm mb-4">Already have an account?</p>
      <button
        onClick={() => setIsLogin(true)}
        className="px-5 py-2 border border-white rounded-xl hover:bg-white hover:text-green-600 transition text-sm font-semibold"
      >
        Login
      </button>
    </div>
  </div>

</div>

    </div>
  )
}

function Input({
  icon,
  placeholder,
  type = 'text',
  isPassword = false,
  value,
  onChange
}: {
  icon: React.ReactNode
  placeholder: string
  type?: string
  isPassword?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [show, setShow] = useState(false)

  const actualType = isPassword ? (show ? 'text' : 'password') : type

  return (
  <div className="relative w-full">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
      {icon}
    </span>

    <input
  type={actualType}
  placeholder={placeholder}
  value={value}
  onChange={onChange}
  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
/>

    {isPassword && (
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
      >
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    )}
  </div>
)
}