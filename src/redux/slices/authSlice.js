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
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
            
            // Upload profile image if provided
            let photoURL = userData.photoURL;
            
            if (profileImage) {
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
                
                photoURL = uploadResponse.data.imageUrl;
            }
            
            await updateProfile(userCredential.user, {
                displayName: userData.displayName,
                photoURL: photoURL
            });
            
            const token = await userCredential.user.getIdToken();
            
            return {
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userData.displayName,
                    photoURL: photoURL
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
    async (_, { rejectWithValue }) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            localStorage.setItem('token', token);
            return result.user;
        } catch (error) {
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

export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token, user } = getState().auth;
            
            if (!token || !user) {
                return rejectWithValue('Authentication required');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Failed to fetch profile');
            }

            const data = await response.json();
            
            
            return {
                ...user,
                role: data.user.role
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return rejectWithValue(error.message);
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
                state.user = serializeUser(action.payload);
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
            
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                
                state.user = {
                    ...state.user,
                    role: action.payload.role
                };
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
