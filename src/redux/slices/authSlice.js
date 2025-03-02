import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../../Firebase/firebase.config';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut, 
    updateProfile,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import axios from 'axios';

const provider = new GoogleAuthProvider();
const API_URL = import.meta.env.VITE_API_URL;

// Register user with profile image upload
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ userData, profileImage }, { rejectWithValue }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
            );
            
            let photoURL = userData.photoURL || null;
            
            if (profileImage) {
                try {
                    const formData = new FormData();
                    formData.append('profileImage', profileImage);
                    
                    const uploadResponse = await axios.post(
                        `${API_URL}/upload-profile-image`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                    
                    if (uploadResponse.data.success) {
                        photoURL = uploadResponse.data.imageUrl;
                    }
                } catch (uploadError) {
                    console.warn('Profile image upload failed, but continuing registration:', uploadError);
                    photoURL = 'https://via.placeholder.com/150?text=User';
                }
            }
            
            await updateProfile(userCredential.user, {
                displayName: userData.displayName,
                photoURL: photoURL
            });
            
            const token = await userCredential.user.getIdToken();
            
            try {
                await axios.post(
                    `${API_URL}/user/sync`,
                    {
                        uid: userCredential.user.uid,
                        email: userCredential.user.email,
                        displayName: userData.displayName,
                        photoURL: photoURL,
                        phone: userData.phone
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (syncError) {
                console.warn('User sync failed but registration will proceed:', syncError);
            }
            
            return {
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userData.displayName,
                    photoURL: photoURL,
                    phone: userData.phone
                },
                token
            };
        } catch (error) {
            return rejectWithValue(
                error.message || 'Could not register user'
            );
        }
    }
);

// Existing auth thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken(true);
            
            if (!token || typeof token !== 'string') {
                throw new Error('Invalid token received');
            }

            localStorage.setItem('token', token);
            return {
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    photoURL: userCredential.user.photoURL
                },
                token
            };
        } catch (error) {
            return rejectWithValue(
                error.message || 'Invalid email or password'
            );
        }
    }
);

export const googleSignIn = createAsyncThunk(
    'auth/googleSignIn',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            localStorage.setItem('token', token);
            
            const user = {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                emailVerified: result.user.emailVerified
            };
            
            try {
                const response = await fetch(`${API_URL}/user/sync`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    })
                });
                
                if (response.ok) {
                    dispatch(fetchUserProfile());
                }
            } catch (syncError) {
                console.error("Error syncing user to database:", syncError);
            }
            
            return { user, token };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token, user } = getState().auth;
            
            if (!token || !user) {
                return rejectWithValue('Authentication required');
            }

            // Use the correct endpoint path: /user/profile
            const response = await fetch(`${API_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    const syncResponse = await fetch(`${API_URL}/user/sync`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName
                        })
                    });
                    
                    if (syncResponse.ok) {
                        const retryResponse = await fetch(`${API_URL}/user/profile`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (retryResponse.ok) {
                            return await retryResponse.json();
                        }
                    }
                }
                
                const error = await response.json();
                return rejectWithValue(error.message || 'Failed to fetch profile');
            }

            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            return null;
        } catch (error) {
            return rejectWithValue(
                error.message || 'Could not log out'
            );
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (email, { rejectWithValue }) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { message: 'Password reset email sent' };
        } catch (error) {
            return rejectWithValue(
                error.message || 'Could not send reset email'
            );
        }
    }
);

// Helper function to serialize user data
const serializeUser = (user) => {
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
    };
};

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token'),
        loading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem('token')
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, { payload: { user, token } }) => {
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            localStorage.setItem('token', token);
        },
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Google Sign In
            .addCase(googleSignIn.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.user = {
                        ...state.user,
                        role: action.payload.role || 'member',
                        name: action.payload.name || state.user.displayName
                    };
                }
            });
    }
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
