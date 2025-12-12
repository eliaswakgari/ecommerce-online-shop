import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProfileApi, loginApi, logoutApi, registerApi, updateProfileApi, changePasswordApi, forgotPasswordApi, resetPasswordApi } from "../../api/authApi.js";
import toast from "react-hot-toast";

const initialState = {
  user: null,
  loading: false,
  error: null
};

export const registerUser = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const { data } = await registerApi(payload);
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const login = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  try {
    const { data } = await loginApi(payload);
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const getProfile = createAsyncThunk("auth/getProfile", async (_, thunkAPI) => {
  try {
    const { data } = await getProfileApi();
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, thunkAPI) => {
  try {
    const { data } = await updateProfileApi(payload);
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const changePassword = createAsyncThunk("auth/changePassword", async (payload, thunkAPI) => {
  try {
    const { data } = await changePasswordApi(payload);
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const { data } = await logoutApi();
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (payload, thunkAPI) => {
  try {
    const { data } = await forgotPasswordApi(payload);
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async ({ resetToken, password }, thunkAPI) => {
  try {
    const { data } = await resetPasswordApi(resetToken, { password });
    return data;
  } catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(registerUser.pending, (s)=>{s.loading=true; s.error=null;})
      .addCase(registerUser.fulfilled, (s, {payload})=>{s.loading=false; s.user=payload; toast.success("Registered");})
      .addCase(registerUser.rejected, (s,{payload})=>{s.loading=false; s.error=payload; toast.error(String(payload));})

      .addCase(login.pending, (s)=>{s.loading=true; s.error=null;})
      .addCase(login.fulfilled, (s,{payload})=>{s.loading=false; s.user=payload; toast.success("Logged in");})
      .addCase(login.rejected, (s,{payload})=>{s.loading=false; s.error=payload; toast.error(String(payload));})

      .addCase(getProfile.fulfilled, (s,{payload})=>{s.user=payload;})
      .addCase(getProfile.rejected, (s)=>{s.user=null;})

      .addCase(updateProfile.fulfilled, (s,{payload})=>{s.user=payload; toast.success("Profile updated");})
      .addCase(updateProfile.rejected, (s,{payload})=>{toast.error(String(payload));})

      .addCase(changePassword.fulfilled, (s,{payload})=>{toast.success("Password changed successfully");})
      .addCase(changePassword.rejected, (s,{payload})=>{toast.error(String(payload));})

      .addCase(logout.fulfilled, (s)=>{s.user=null; toast.success("Logged out");})

      .addCase(forgotPassword.pending, (s)=>{s.loading=true; s.error=null;})
      .addCase(forgotPassword.fulfilled, (s,{payload})=>{s.loading=false; toast.success("Password reset email sent");})
      .addCase(forgotPassword.rejected, (s,{payload})=>{s.loading=false; s.error=payload; toast.error(String(payload));})

      .addCase(resetPassword.pending, (s)=>{s.loading=true; s.error=null;})
      .addCase(resetPassword.fulfilled, (s,{payload})=>{s.loading=false; toast.success("Password reset successful");})
      .addCase(resetPassword.rejected, (s,{payload})=>{s.loading=false; s.error=payload; toast.error(String(payload));});
  }
});

export default authSlice.reducer;
