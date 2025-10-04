import React, { createContext, useContext, useEffect, useState } from 'react'
import Amplify, { Auth } from 'aws-amplify'

// Configure Amplify using environment variables (set in .env)
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
    mandatorySignIn: false
  }
})

const AuthContext = createContext()

export function AuthProvider({children}){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async ()=>{
      try{ const u = await Auth.currentAuthenticatedUser(); setUser(u) }catch(e){ setUser(null) }
      finally{ setLoading(false) }
    })()
  }, [])

  async function signIn(username, password){
    const res = await Auth.signIn(username, password)
    setUser(res)
    return res
  }

  async function signUp({username, password, email}){
    return Auth.signUp({ username, password, attributes: { email } })
  }

  async function signOut(){ await Auth.signOut(); setUser(null) }

  return (
    <AuthContext.Provider value={{user, loading, signIn, signUp, signOut}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }