import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import { useAuth, type AuthUser } from "../auth/useAuth";
import { getLoginUserInfoByUserid } from "../services/apiService";

export interface LoginUserInfo {
  user_Employee_No: number;
  sex: string;
  eligibleTypeCode: string;
  isTeamMager: boolean;
  user_Mat_Pat_Applicable: boolean;
  isTeamHead: boolean;
  isCenterHead: boolean;
  isAdmin: boolean;
  isDisplayReport: boolean;
}

type UserContextType = {
  user: AuthUser | null;
  username: string | null;

  userInfo: LoginUserInfo | null;

  isManager: boolean;
  isAdmin: boolean;

  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  username: null,
  userInfo: null,
  isManager: false,
  isAdmin: false,
  loading: true
});

export const UserProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();

  const [userInfo, setUserInfo] =
    useState<LoginUserInfo | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        if (!user?.loginUserAdID) return;

        setLoading(true);

        const response =
          await getLoginUserInfoByUserid(
            user.loginUserAdID
          );

        setUserInfo(response.data);
      } catch (error) {
        console.error(
          "Failed to load user info",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [user]);

  const isManager =
    Boolean(userInfo?.isTeamMager) ||
    Boolean(userInfo?.isTeamHead) ||
    Boolean(userInfo?.isCenterHead);

  const isAdmin =
    Boolean(userInfo?.isAdmin);

  return (
    <UserContext.Provider
      value={{
        user,
        username: user?.username ?? null,

        userInfo,

        isManager,
        isAdmin,

        loading
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () =>
  useContext(UserContext);