"use client"
import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"

export default function MagicLogin() {
  const [status, setStatus] = useState("Logging you in automatically... Please wait.")
  
  useEffect(() => {
    signIn("credentials", {
      email: "test1@gmail.com",
      password: "master123",
      redirect: true,
      callbackUrl: "/orgs"
    }).catch(err => {
      setStatus("Fatal Error: " + err.message)
    })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-3xl font-bold p-10 text-center">
      {status}
    </div>
  )
}
