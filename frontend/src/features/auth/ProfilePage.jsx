import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import ProfileImageUpload from "../../components/ui/ProfileImageUpload.jsx";
import { getProfile, updateProfile, changePassword } from "./authSlice.js";
import { passwordStrong, required } from "../../utils/validators.js";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(s => s.auth);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", profileImage: "", profileImagePublicId: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "password"

  useEffect(() => { dispatch(getProfile()); }, []);
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || "",
        profileImagePublicId: user.profileImagePublicId || ""
      });
    }
  }, [user]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const { name, email, profileImage, profileImagePublicId } = profileForm;
    dispatch(updateProfile({ name, email, profileImage, profileImagePublicId }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Validate password form
    const errors = {
      currentPassword: required(passwordForm.currentPassword),
      newPassword: passwordStrong(passwordForm.newPassword) || required(passwordForm.newPassword),
      confirmPassword: passwordForm.newPassword !== passwordForm.confirmPassword ? "Passwords do not match" : required(passwordForm.confirmPassword),
    };

    setPasswordErrors(errors);

    if (!Object.values(errors).some(Boolean)) {
      dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }));
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const handleImageChange = (imageUrl, publicId) => {
    setProfileForm(prev => ({ ...prev, profileImage: imageUrl, profileImagePublicId: publicId }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile Information
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "password" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
      </div>

      {/* Profile Information Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <ProfileImageUpload
            currentImage={profileForm.profileImage}
            currentPublicId={profileForm.profileImagePublicId}
            onImageChange={handleImageChange}
          />

          <Input
            label="Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
          />

          <Button type="submit" loading={loading} className="w-full">
            Update Profile
          </Button>
        </form>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            error={passwordErrors.currentPassword}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            error={passwordErrors.newPassword}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            error={passwordErrors.confirmPassword}
          />

          <Button type="submit" loading={loading} className="w-full">
            Change Password
          </Button>
        </form>
      )}
    </div>
  );
}
