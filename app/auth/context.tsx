import { use, createContext, type PropsWithChildren, useState } from 'react';

import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export default function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session-token');
  const [loading, setLoading ] = useState(false);


  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          // Perform sign-in logic here
          setLoading(true);
          setTimeout(() => {
            setSession('secret-session-token');
            setLoading(false);
          }, 2000);
        },
        signOut: () => {
          setLoading(true);
          // delay for 5 seconds to simulate sign out process
          setTimeout(() => {
            setSession(null);
            setLoading(false);
          }, 2000);
        },
        session,
        isLoading : isLoading || loading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
