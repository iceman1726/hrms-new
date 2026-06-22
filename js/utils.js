// utils.js – shared helper functions and API base
const API_BASE = '/hrms/backend/api/';

function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    };
    const mergedOptions = { ...defaultOptions, ...options };
    return fetch(API_BASE + endpoint, mergedOptions).then(res => res.json());
}