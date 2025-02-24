import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../../Firebase/firebase.config';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('token', token);
            return userCredential.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('token', token);
            return userCredential.user;
        } catch (error) {
            return rejectWithValue(error.message);
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
            return rejectWithValue(error.message);
        }
    }
);

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
                state.user = action.payload;
                state.isAuthenticated = true;
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
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Google Sign In
            .addCase(googleSignIn.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    }
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
