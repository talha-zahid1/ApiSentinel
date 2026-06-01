import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ApiKeyContext = createContext(null);

export const ApiKeyProvider = ({ children }) => {
  const [rawKey, setRawKey] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize metadata from localStorage on mount
  useEffect(() => {
    const storedMetadata = localStorage.getItem('apisentinel_key_metadata');
    if (storedMetadata) {
      try {
        const parsed = JSON.parse(storedMetadata);
        
        // Calculate status dynamically (Expired check)
        if (parsed.status === 'Active' && parsed.exp_date) {
          const expDate = new Date(parsed.exp_date);
          if (expDate < new Date()) {
            parsed.status = 'Expired';
            localStorage.setItem('apisentinel_key_metadata', JSON.stringify(parsed));
          }
        }
        
        setMetadata(parsed);
      } catch (e) {
        console.error('Failed to parse stored API key metadata', e);
      }
    }
  }, []);

  const generateApiKey = async (appName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/ApiSentinel/get_api_key/', {
        app_name: appName,
      });
      console.log("RAW BACKEND RESPONSE DATA:", response.data);
      const { raw_key, prefix, exp_date, app_name } = response.data;


// Save raw key in React state only (never in localStorage)
      setRawKey(raw_key);

// Save metadata in React state AND localStorage
      const newMetadata = {
        app_name: app_name || appName,
        prefix: prefix,
        exp_date: exp_date, // This ensures it's a string
        status: 'Active',
      };
      setMetadata(newMetadata);
      localStorage.setItem('apisentinel_key_metadata', JSON.stringify(newMetadata));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || err.message || 'Failed to generate API Key.';
      setError(errMsg);
      console.log('FULL ERROR:', err.response?.data, err.message); 
      return { success: false, error: errMsg };
    }
  };

 const rotateApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pehle token refresh karo
      const freshToken = localStorage.getItem('access_token');
      
      const response = await api.post('/ApiSentinel/rotate_api_key/', {
        prefix: metadata?.prefix,
      }, {
        headers: {
          Authorization: `Bearer ${freshToken}`
        }
      });

      if (!response.data.status) {
        throw new Error(response.data.error || 'Rotation failed');
      }

      const { raw_key, prefix, exp_date, app_name } = response.data;
      
      setRawKey(raw_key);

      const updatedMetadata = {
        ...metadata,
        app_name: app_name || metadata?.app_name,
        prefix: prefix,
        exp_date: exp_date,
        status: 'Active',
      };
      
      setMetadata(updatedMetadata);
      localStorage.setItem('apisentinel_key_metadata', JSON.stringify(updatedMetadata));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      console.error("❌ ROTATE BACKEND ERROR!");
      console.error("Payload from Django:", err.response?.data);
      
      const errMsg = err.response?.data?.detail || err.message || 'Failed to rotate API Key.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const revokeApiKey = async () => {
  setLoading(true);
  setError(null);
  try {
    await api.post('/ApiSentinel/revoke_api_key/', {
      prefix: metadata?.prefix,
    });

      // Update metadata to Revoked
      const updatedMetadata = {
        ...metadata,
        status: 'Revoked',
      };
      setMetadata(updatedMetadata);
      localStorage.setItem('apisentinel_key_metadata', JSON.stringify(updatedMetadata));
      
      // Clear raw key from memory as it is no longer usable
      setRawKey(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || err.message || 'Failed to revoke API Key.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const clearKeySession = () => {
    setRawKey(null);
    setMetadata(null);
    localStorage.removeItem('apisentinel_key_metadata');
  };

  const value = {
    rawKey,
    metadata,
    loading,
    error,
    generateApiKey,
    rotateApiKey,
    revokeApiKey,
    clearKeySession,
  };

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
