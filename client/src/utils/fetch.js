import { useReducer } from 'react';
import isFunction from 'lodash/isFunction';
import {
  NEW_SEARCH,
  LOADING,
  SILENT_LOADING,
  RESPONSE,
  IMAGES_LOADED,
  PAGE_IMAGES_LOADED,
  FONTS_LOADED,
  NOTHING_FOUND,
  ERROR,
} from '../assets/reducerActions';

const initialState = {
  keyword: null,
  result: null,
  loading: false,
  silentLoading: false,
  isNothingFound: false,
  error: null,
};

const initialPageState = {
  result: null,
  loading: true,
  imagesLoading: true,
  fontsLoading: true,
  silentLoading: false,
  isNothingFound: false,
  error: null,
};

const useThunkReducer = (reducer, initState) => {
  const [state, dispatch] = useReducer(reducer, initState);

  const thunkDispatch = (action) => {
    if (isFunction(action)) {
      action(dispatch);
    } else {
      dispatch(action);
    }
  };

  return [state, thunkDispatch];
};

const fetchReducer = (state, action) => {
  if (action.type === NEW_SEARCH) {
    return {
      keyword: action.payload.keyword,
      result: null,
      loading: true,
      silentLoading: false,
      isNothingFound: false,
      error: null,
    };
  }
  if (action.type === LOADING) {
    return {
      ...state,
      result: null,
      loading: true,
      silentLoading: false,
      isNothingFound: false,
      error: null,
    };
  }
  if (action.type === SILENT_LOADING) {
    return {
      ...state,
      result: null,
      loading: false,
      silentLoading: true,
      isNothingFound: false,
      error: null,
    };
  }
  if (action.type === RESPONSE) {
    return {
      ...state,
      result: action.payload.response,
      silentLoading: false,
    };
  }
  if (action.type === IMAGES_LOADED) {
    return {
      ...state,
      loading: false,
    };
  }
  if (action.type === PAGE_IMAGES_LOADED) {
    if (state.fontsLoading) {
      return {
        ...state,
        imagesLoading: false,
      };
    }
    return {
      ...state,
      imagesLoading: false,
      loading: false,
    };
  }
  if (action.type === FONTS_LOADED) {
    if (state.imagesLoading) {
      return {
        ...state,
        fontsLoading: false,
      };
    }
    return {
      ...state,
      fontsLoading: false,
      loading: false,
    };
  }
  if (action.type === NOTHING_FOUND) {
    return {
      ...state,
      loading: true,
      silentLoading: false,
      isNothingFound: true,
      error: null,
    };
  }
  if (action.type === ERROR) {
    return {
      ...state,
      result: null,
      loading: false,
      silentLoading: false,
      error: action.payload.error,
    };
  }
  return state;
};

/**
 * @function useFetch
 * @description This function will call a fetch request and dispatch actions based on functionOptions.
 * @param {function} dispatch - The dispatch function to be called.
 * @param {string} url - The url of the request.
 * @param {object} options - Option for the feth request.
 * @param {object} functionOptions - Options for the function.
 * @param {boolean} silent - Set true for fetch request that doesnt return images.
 * @param {boolean} auth - Set true for authorization request.
 * @returns The parsed response or the error, if auth set to true error wont be dispatched.
 */

const useFetch = (dispatch, url, options, functionOptions) => {
  const { silent = false, auth = false, image = false } = functionOptions || {};
  if (!silent) {
    dispatch({ type: LOADING });
  }
  if (silent) {
    dispatch({ type: SILENT_LOADING });
  }
  const fetchUrl = async () => {
    try {
      const response = await fetch(url, options);
      if (image) {
        return response;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      dispatch({ type: RESPONSE, payload: { response: data } });
      return data;
    } catch (error) {
      if (auth) {
        return error;
      }
      dispatch({ type: ERROR, payload: { error } });
      return error;
    }
  };

  return fetchUrl();
};

export { useThunkReducer, fetchReducer, initialState, initialPageState, useFetch };
