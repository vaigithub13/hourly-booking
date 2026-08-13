import {
  createContext,
  useEffect,
  useReducer
} from "react";
import axios from "axios";
// CUSTOM COMPONENT
import {
  MatxLoading
} from "app/components";
import {
  getRequest,
  postRequest
} from "app/utils/request";
import {
  useRouter
} from "app/hooks/useRouter";

const initialState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const {
        isAuthenticated,
        user
      } = action.payload;
      return {
        ...state,
        isAuthenticated,
        isInitialized: true,
        user
      };
    }

    case "LOGIN": {
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user
      };
    }

    case "LOGOUT": {
      return {
        ...state,
        isAuthenticated: false,
        user: null
      };
    }

    case "REGISTER": {
      const {
        user
      } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user
      };
    }

    default:
      return state;
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT",
  login: () => {},
  logout: () => {},
  register: () => {}
});

export const AuthProvider = ({
  children
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  const login = async (email, password) => {
    const response = await postRequest("/admin/login", {
      emailOrPhone: email,
      password
    }, router);
    const {
      accessToken,
      refreshToken
    } = response.data;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage?.setItem("refreshToken", refreshToken);
    }

    dispatch({
      type: "LOGIN",
      payload: {
        user: response.data
      }
    });
  };

  const register = async (email, username, password) => {
    const response = await axios.post("/api/auth/register", {
      email,
      username,
      password
    });
    const {
      user
    } = response.data;

    dispatch({
      type: "REGISTER",
      payload: {
        user
      }
    });
  };

  const logout = () => {
    dispatch({
      type: "LOGOUT"
    });
    localStorage.clear();
    router.push("session/signin");
  };

  useEffect(() => {
    (async () => {
      try {
        if (localStorage.getItem("accessToken")) {
          const res = await getRequest("/admin/getAdminByToken");
          dispatch({
            type: "INIT",
            payload: {
              isAuthenticated: res ? true : false,
              user: res ? res?.data : null
            }
          });
        } else {
          dispatch({
            type: "INIT",
            payload: {
              isAuthenticated: false,
              user: null
            }
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // SHOW LOADER
  if (!state.isInitialized) return <MatxLoading / > ;

  return ( <
    AuthContext.Provider value = {
      {
        ...state,
        method: "JWT",
        login,
        logout,
        register
      }
    } > {
      children
    } <
    /AuthContext.Provider>
  );
};

export default AuthContext;