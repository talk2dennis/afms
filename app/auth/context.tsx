import { use, createContext, type PropsWithChildren, useState } from 'react';

import { useStorageState } from './useStorageState';

export const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Dennis",
    email: "dennis@test.com",
    role: "user",
  },
  {
    id: "3",
    name: "Sarah",
    email: "sarah@test.com",
    role: "user",
  },
];

// type user
type User = {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
};

const AuthContext = createContext<{
  signIn: (user: User) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  userData?: User | null;
}>({
  signIn: (user: User) => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  userData: null,
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
  const [userData, setUserData] = useState<User | null>(null);


  return (
    <AuthContext.Provider
      value={{
        signIn: (user: User) => {
          setLoading(true);
          setUserData(user);
          // delay for 2 seconds to simulate sign in process
          setTimeout(() => {
            setSession("dummy-session-token");
            setLoading(false);
          }, 2000);
        },
        signOut: () => {
          setLoading(true);
          setUserData(null);
          // delay for 2 seconds to simulate sign out process
          setTimeout(() => {
            setSession(null);
            setLoading(false);
          }, 2000);
        },
        session,
        isLoading : isLoading || loading,
        userData: userData
      }}>
      {children}
    </AuthContext.Provider>
  );
}
