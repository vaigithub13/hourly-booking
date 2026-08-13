export const accountReducers = (state, action) => {
  switch (action.type) {
    case "SET_ACCOUNTS":
      return {
        ...state,
        count: action?.payload?.count,
        rows: action?.payload?.accountingData
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action?.payload
      };
    case "SET_USER":
      return {
        ...state,
        name: action?.payload
      };
  }
};

export const adsReducer = (state, action) => {
  switch (action.type) {
    case "SET_ADS":
      return {
        ...state,
        count: action?.payload?.count || 0,
        rows: action?.payload?.rows || []
      };
    case "SET_ADS_LOADING":
      return {
        ...state,
        isLoading: action?.payload
      };
    case "SET_ADS_STATUS":
      return {
        ...state,
        status: action?.payload
      };
  }
};

export const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        count: action?.payload?.count,
        rows: action?.payload?.rows
      };
    case "SET_LOADING":
      return { ...state, isLoading: action?.payload };
    case "SET_HIDDEN":
      return { ...state, isHidden: action?.payload };
    case "SET_BLOCKED":
      return { ...state, blocked: action?.payload };
    case "SET_VERIFIED":
      return { ...state, verified: action?.payload };
    case "SET_SEARCH":
      return { ...state, search: action?.payload };
    default:
      return state;
  }
};

export const productsReducer = (state, action) => {
  switch (action.type) {
    case "SET_PRODUCTS":
      return {
        ...state,
        count: action?.payload?.count,
        rows: action?.payload?.products
      };

    case "SET_PRODUCTS_USER": {
      return {
        ...state,
        vendorId: action.payload
      };
    }

    case "SET_PRODUCTS_NAME": {
      return {
        ...state,
        name: action.payload
      };
    }
    case "SET_PRODUCTS_STATUS": {
      return {
        ...state,
        approved: action?.payload
      };
    }
    case "SET_PRODUCTS_CATEGORY": {
      return {
        ...state,
        categoryId: action.payload || []
      };
    }

    case "SET_PRODUCTS_LOADING":
      return {
        ...state,
        isLoading: action.payload
      };
    case "SET_PRODUCTS_READY_TO_SHIP":
      return {
        ...state,
        readyToShip: action.payload
      };
    default:
      return state;
  }
};

export const ordersReducer = (state, action) => {
  switch (action.type) {
    case "SET_ORDERS":
      return {
        ...state,
        isLoading: false,
        count: action?.payload?.count,
        rows: action?.payload?.rows
      };
    case "SET_LOADING":
      return { ...state, isLoading: action?.payload };
    case "SET_STATUS":
      return { ...state, status: action?.payload };
    case "SET_CUSTOMER":
      return { ...state, userId: action?.payload };
    case "SET_VENDOR":
      return { ...state, vendorId: action?.payload };
    case "SET_CODES":
      return { ...state, statusCodes: action?.payload };
    default:
      return state;
  }
};

export const requestReducer = (state, action) => {
  switch (action.type) {
    case "SET_REQUESTS":
      return {
        ...state,
        isLoading: false,
        count: action?.payload?.count,
        rows: action?.payload?.rows
      };
    case "SET_LOADING":
      return { ...state, isLoading: action?.payload };
    case "SET_STATUS":
      return { ...state, status: action?.payload };
    case "SET_CUSTOMER":
      return { ...state, userId: action?.payload };
    case "SET_VENDOR":
      return { ...state, vendorId: action?.payload };
    case "SET_CODES":
      return { ...state, statusCodes: action?.payload };
    default:
      return state;
  }
};

export const requestRequestReducer = (state, action) => {
  switch (action.type) {
    case "SET_RETURN_REQUESTS":
      return {
        ...state,
        isLoading: false,
        count: action?.payload?.count,
        rows: action?.payload?.rows
      };
    case "SET_LOADING":
      return { ...state, isLoading: action?.payload };
    case "SET_CUSTOMER":
      return { ...state, userId: action?.payload };
    case "SET_VENDOR":
      return { ...state, vendorId: action?.payload };
    default:
      return state;
  }
};

export const returnReducer = (state, action) => {
  switch (action.type) {
    case "SET_RETURNS":
      return {
        ...state,
        isLoading: false,
        rows: action?.payload?.rows || [],
        count: action?.payload?.count || 0
      };

    case "SET_LOADING":
      return { ...state, isLoading: action?.payload };

    case "SET_USER":
      return {
        ...state,
        userId: action?.payload
      };

    case "SET_VENDOR":
      return {
        ...state,
        vendorId: action?.payload
      };
  }
};

export const queryReducer = (state, action) => {
  switch (action.type) {
    case "SET_QUERIES":
      return {
        ...state,
        count: action?.payload?.count || 0,
        rows: action?.payload?.rows || []
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action?.payload
      };
    case "SET_STATUS":
      return {
        ...state,
        status: action?.payload
      };
  }
};

export const vendorReducer = (state, action) => {
  switch (action.type) {
    case "SET_VENDORS":
      return {
        ...state,
        count: action?.payload?.count || 0,
        rows: action?.payload?.rows || 0
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action?.payload
      };
    case "SET_BLOCKED":
      return {
        ...state,
        blocked: action?.payload
      };
    case "SET_APPROVED":
      return {
        ...state,
        status: action?.payload
      };
    case "SET_NAME":
      return {
        ...state,
        name: action?.payload
      };
  }
};
