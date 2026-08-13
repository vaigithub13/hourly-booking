// DataContext.js
import useAuth from "app/hooks/useAuth";
import { useRouter } from "app/hooks/useRouter";
import { getRequest } from "app/utils/request";
import PropTypes from "prop-types";
import React, {
  useMemo,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  createContext
} from "react";

// Initial state for the context
const initialState = {
  categories: { isLoading: false, count: 0, rows: [], page: 1, limit: 20 },
  attributes: { isLoading: false, count: 0, type: "", rows: [], page: 1, limit: 20 },
  statusCodes: [],
  returnStatusCodes: [],
  refundTarget: [],
  metaData: {},
  locations: [],
  banners: { isLoading: false, count: 0, rows: [], page: 1, limit: 20 },
  lengths: [],
  faqs: [],
  config: null,
  sizeGuide: { sizeGuide: [], description: { en: "", ar: "" } },
  tips: null,
  notifications: { isLoading: false, count: 0, rows: [], page: 1, limit: 20 }
};

// Action types

//Notifications

const SET_NOTIFICATIONS = "SET_NOTIFICATIONS";
const SET_NOTIFICATIONS_PAGE = "SET_NOTIFICATIONS_PAGE";
const SET_NOTIFICATIONS_LIMIT = "SET_NOTIFICATIONS_LIMIT";
const SET_NOTIFICATIONS_LOADING = "SET_NOTIFICATIONS_LOADING";

const SET_FAQS = "SET_FAQS";
const SET_FAQS_LOADING = "SET_FAQS_LOADING";
const SET_CONFIG = "SET_CONFIG";
const SET_ADS_CONFIG = "SET_ADS_CONFIG";

const SET_LENGTHS = "SET_LENGTHS";
const SET_SIZE_GUIDE = "SET_SIZE_GUIDE";
const SET_TIPS = "SET_TIPS";

const SET_CATEGORIES = "SET_CATEGORIES";
const SET_CATEGORIES_PAGE = "SET_CATEGORIES_PAGE";
const SET_CATEGORIES_LIMIT = "SET_CATEGORIES_LIMIT";
const SET_CATEGORIES_LOADING = "SET_CATEGORIES_LOADING";

const SET_ATTRIBUTES = "SET_ATTRIBUTES";
const SET_ATTRIBUTES_TYPE = "SET_ATTRIBUTES_TYPE";
const SET_ATTRIBUTES_LOADING = "SET_ATTRIBUTES_LOADING";

const SET_LOCATIONS = "SET_LOCATIONS";
const SET_LOCATIONS_LOADING = "SET_LOCATIONS_LOADING";

const SET_STATUS_CODES = "SET_STATUS_CODES";
const SET_RETURN_STATUS_CODES = "SET_RETURN_STATUS_CODES";
const SET_REFUND_TARGET = "SET_REFUND_TARGET";

const SET_BANNERS = "SET_BANNERS";
const SET_BANNERS_PAGE = "SET_BANNERS_PAGE";
const SET_BANNERS_LIMIT = "SET_BANNERS_LIMIT";
const SET_BANNERS_LOADING = "SET_BANNERS_LOADING";

const SET_PRODUCT_META_DATA = "SET_PRODUCT_META_DATA";

const CLEAR_ALL_STATES = "CLEAR_ALL_STATES";

// Reducer function to handle state changes
const dataReducer = (state, action) => {
  switch (action.type) {
    case SET_CATEGORIES:
      return {
        ...state,
        categories: {
          ...state?.categories,
          count: action?.payload?.count,
          rows: action?.payload?.rows
        }
      };

    case SET_CATEGORIES_PAGE: {
      return {
        ...state,
        categories: { ...state.categories, page: action.payload }
      };
    }

    case SET_CATEGORIES_LIMIT:
      return {
        ...state,
        categories: { ...state.categories, limit: action.payload }
      };

    case SET_CATEGORIES_LOADING:
      return {
        ...state,
        categories: { ...state.categories, isLoading: action.payload }
      };

    case SET_ATTRIBUTES:
      return {
        ...state,
        attributes: {
          ...state?.attributes,
          count: action?.payload?.count,
          rows: action?.payload?.rows
        }
      };

    case SET_ATTRIBUTES_LOADING:
      return {
        ...state,
        attributes: { ...state.attributes, isLoading: action.payload }
      };

    case SET_ATTRIBUTES_TYPE:
      return {
        ...state,
        attributes: { ...state.attributes, type: action?.payload }
      };
    case SET_LOCATIONS:
      return {
        ...state,
        locations: action?.payload
      };

    case SET_PRODUCT_META_DATA:
      return {
        ...state,
        metaData: action?.payload || null
      };
    case SET_LENGTHS:
      return {
        ...state,
        lengths: action?.payload
      };

    case SET_SIZE_GUIDE:
      return {
        ...state,
        sizeGuide: {
          sizeGuide: action?.payload?.sizeGuide,
          description: action?.payload?.description
        }
      };
    case SET_TIPS:
      return {
        ...state,
        tips: action?.payload || null
      };
    case SET_STATUS_CODES:
      return {
        ...state,
        statusCodes: action?.payload
      };
    case SET_RETURN_STATUS_CODES:
      return {
        ...state,
        returnStatusCodes: action?.payload
      };
    case SET_REFUND_TARGET:
      return {
        ...state,
        refundTarget: action?.payload
      };
    case "SET_BANNERS":
      return {
        ...state,
        banners: {
          ...state.banners,
          count: action?.payload?.count,
          rows: action?.payload?.rows
        }
      };

    case SET_BANNERS_PAGE: {
      return {
        ...state,
        banners: { ...state.banners, page: action.payload }
      };
    }

    case SET_BANNERS_LIMIT:
      return {
        ...state,
        banners: { ...state.banners, limit: action.payload }
      };

    case SET_BANNERS_LOADING:
      return {
        ...state,
        banners: { ...state.banners, isLoading: action.payload }
      };

    case SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          count: action?.payload?.count || 0,
          rows: action?.payload?.rows || []
        }
      };
    case SET_NOTIFICATIONS_LIMIT:
      return {
        ...state,
        notifications: { ...state.notifications, limit: action.payload }
      };
    case SET_NOTIFICATIONS_PAGE:
      return {
        ...state,
        notifications: { ...state.notifications, page: action.payload }
      };
    case SET_NOTIFICATIONS_LOADING:
      return {
        ...state,
        notifications: { ...state.notifications, isLoading: action.payload }
      };
    case SET_FAQS:
      return {
        ...state,
        faqs: action?.payload || []
      };

    case SET_CONFIG:
      return {
        ...state,
        config: action.payload
      };

    case CLEAR_ALL_STATES:
      return initialState;
    default:
      return state;
  }
};

// Create the context
const DataContext = createContext();

// Context provider component
const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user } = useAuth();
  const router = useRouter();

  // Actions to set user, dashboard data, users, malls, shops, and categories

  //banners
  const setBanners = (banners) => dispatch({ type: SET_BANNERS, payload: banners });
  const setBannersPage = (page) => dispatch({ type: SET_BANNERS_PAGE, payload: page });
  const setBannersLimit = (limit) => dispatch({ type: SET_BANNERS_LIMIT, payload: limit });
  const setBannersLoading = (loading) => dispatch({ type: SET_BANNERS_LOADING, payload: loading });

  //categories
  const setCategories = (categories) => dispatch({ type: SET_CATEGORIES, payload: categories });
  const setCategoriesPage = (page) => dispatch({ type: SET_CATEGORIES_PAGE, payload: page });
  const setCategoriesLimit = (limit) => dispatch({ type: SET_CATEGORIES_LIMIT, payload: limit });
  const setCategoriesLoading = (loading) =>
    dispatch({ type: SET_CATEGORIES_LOADING, payload: loading });

  //attributes
  const setAttributes = (attributes) => dispatch({ type: SET_ATTRIBUTES, payload: attributes });
  const setAttributesType = (type) => dispatch({ type: SET_ATTRIBUTES_TYPE, payload: type });
  const setAttributesLoading = (loading) =>
    dispatch({ type: SET_ATTRIBUTES_LOADING, payload: loading });

  //locations
  const setLocations = (loc) => dispatch({ type: SET_LOCATIONS, payload: loc });
  //lengths
  const setLengths = (len) => dispatch({ type: SET_LENGTHS, payload: len });
  //meta-data
  const setMetaData = (d) => dispatch({ type: SET_PRODUCT_META_DATA, payload: d });
  //size guide
  const setSizeGuide = (data) => dispatch({ type: SET_SIZE_GUIDE, payload: data });
  // tip
  const setTips = (tips) => dispatch({ type: SET_TIPS, payload: tips });
  //config
  const setConfig = (data) => dispatch({ type: SET_CONFIG, payload: data });
  //status codes
  const setStatusCodes = (codes) => dispatch({ type: SET_STATUS_CODES, payload: codes });
  //return status codes
  const setReturnStatusCodes = (data) => dispatch({ type: SET_RETURN_STATUS_CODES, payload: data });
  //set Refund target

  const setRefundTarget = (data) => dispatch({ type: SET_REFUND_TARGET, payload: data });
  //notifications
  const setNotifications = (nots) => dispatch({ type: SET_NOTIFICATIONS, payload: nots });
  const setNotificationsPage = (page) => dispatch({ type: SET_NOTIFICATIONS_PAGE, payload: page });
  const setNotificationsLimit = (limit) =>
    dispatch({ type: SET_NOTIFICATIONS_LIMIT, payload: limit });
  const setNotificationsLoading = (loading) =>
    dispatch({ type: SET_NOTIFICATIONS_LOADING, payload: loading });

  //faqs
  const setFaqs = (faqs) => dispatch({ type: SET_FAQS, payload: faqs });

  const clearAllStatesAction = () => dispatch({ type: CLEAR_ALL_STATES });

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const res = await getRequest(`/categories/`, router);
    setCategoriesLoading(false);
    setCategories(res?.data);
  }, []);

  const fetchConfig = useCallback(async () => {
    const res = await getRequest("/configurations");
    setConfig(res?.data);
  }, []);

  const fetchBanners = useCallback(async () => {
    setBannersLoading(true);
    const res = await getRequest("/banners/admin?&isSortDesc=true");
    setBannersLoading(false);
    setBanners(res?.data);
  }, []);

  const fetchAttributes = useCallback(async () => {
    setAttributesLoading(true);
    let url = "/custom_attributes/";
    if (state.attributes.type !== "") {
      url += `?type=${state.attributes.type}`;
    }
    const res = await getRequest(url);
    setAttributesLoading(false);
    setAttributes(res?.data);
  }, [state.attributes.type]);

  const fetchLocations = useCallback(async () => {
    const res = await getRequest("/locations/");
    setLocations(res?.data?.locations);
  }, []);

  const fetchLengths = useCallback(async () => {
    const res = await getRequest("/products-lengths/");
    setLengths(res?.data);
  }, []);

  const fetchMetaData = useCallback(async () => {
    const res = await getRequest("/products/metadata");
    setMetaData(res?.data);
  }, []);

  const fetchTips = useCallback(async () => {
    const res = await getRequest("/tips/");
    setTips(res?.data);
  }, []);

  const fetchNotifications = useCallback(async () => {
    const offset = (state.notifications.page - 1) * state.notifications.limit;
    setNotificationsLoading(true);
    const res = await getRequest(
      `/notifications/user?offset=${offset}&limit=${state.notifications.limit}`
    );
    setNotificationsLoading(false);
    setNotifications(res?.data);
  }, [state.notifications.page, state.notifications.limit]);

  const fetchStatusCodes = useCallback(async () => {
    const res = await getRequest("/order/meta-data");
    setStatusCodes(res?.data?.orderStatusEnum);
    setReturnStatusCodes(res?.data?.returnOrderStatusEnum);
    setRefundTarget(res?.data?.refundTargetEnum);
  }, []);

  const fetchSizeGuide = useCallback(async () => {
    const res = await getRequest("/size-guides");
    setSizeGuide(res?.data);
  }, []);

  const fetchFaqs = useCallback(async () => {
    const res = await getRequest("/faqs/admin");
    setFaqs(res?.data);
  }, []);

  const clearAllStates = useCallback(() => {
    clearAllStatesAction();
  }, []);

  useEffect(() => {
    if (user && user?.role === "admin") {
      fetchLocations();
      fetchBanners();
      fetchConfig();
      fetchTips();
      fetchNotifications();
      fetchLengths();
      fetchSizeGuide();
      fetchFaqs();
    }
  }, [
    user,
    fetchBanners,
    fetchNotifications,
    fetchSizeGuide,
    fetchTips,
    fetchConfig,
    fetchFaqs,
    fetchLengths,
    fetchLocations
  ]);

  useEffect(() => {
    if (user !== null) {
      fetchCategories();
      fetchAttributes();
      fetchStatusCodes();
      fetchMetaData();
    }
  }, [user, fetchCategories, fetchMetaData, fetchStatusCodes, fetchAttributes]);

  // Memoize the context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...state,
      setCategories,
      setCategoriesPage,
      setCategoriesLimit,
      setAttributes,
      setAttributesType,
      setNotifications,
      setFaqs,
      setLocations,
      setSizeGuide,
      setTips,
      setBanners,
      setConfig,
      setLengths,
      fetchBanners
    }),
    [state] // Only recompute the value when state changes
  );

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

// Custom hook to use the context
const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

DataProvider.propTypes = {
  children: PropTypes.node
};

export { DataProvider, useDataContext };
