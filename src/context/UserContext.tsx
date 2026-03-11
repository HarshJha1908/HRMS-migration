import { createContext, useContext, useEffect, useState } from "react";
import { getLoginUser } from "../services/apiService";

type UserContextType = {
  username: string | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  username: null,
  loading: true
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadUser = async () => {
      try {

        const data = await getLoginUser();

        if (data?.username) {
          setUsername(data.username);
          sessionStorage.setItem("username", data.username);
          
        }

      } catch (err) {
        console.error("User fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

  }, []);

  return (
    <UserContext.Provider value={{ username, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);