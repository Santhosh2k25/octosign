import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Camera, Save, X, Trash2 } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

// Add image compression utility
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.7);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const Profile: React.FC = () => {
  const { user, updateUserProfile, deleteUserAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    role: user?.role || 'user'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        organization: user.organization || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 10MB');
        return;
      }

      // Compress image before setting state
      const compressedFile = await compressImage(file);
      setProfileImage(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setErrorMessage('User session not found. Please try logging in again.');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setErrorMessage('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email is required');
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // First save the profile data immediately
      const updateData = {
        ...formData,
        profileImage: user.profileImage // Keep existing image URL while new one uploads
      };

      // Remove any undefined or null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined || 
            updateData[key as keyof typeof updateData] === null) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      await updateUserProfile(updateData);
      
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);

      // Then handle image upload separately if there's a new image
      if (profileImage) {
        try {
          const storage = getStorage();
          const imageRef = ref(storage, `profile-images/${user.id}/${Date.now()}_${profileImage.name}`);
          
          // Upload image in background
          const uploadResult = await uploadBytes(imageRef, profileImage);
          const newImageUrl = await getDownloadURL(uploadResult.ref);
          
          // Update profile with new image URL
          await updateUserProfile({
            ...formData,
            profileImage: newImageUrl
          });
        } catch (imageError) {
          console.error('Failed to upload image:', imageError);
          setErrorMessage('Profile saved but image upload failed. Please try uploading the image again.');
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error instanceof Error) {
        setErrorMessage(`Failed to update profile: ${error.message}`);
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setErrorMessage('Please enter your password to confirm account deletion');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await deleteUserAccount(deletePassword);
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      if (error instanceof Error) {
        if (error.message.includes('wrong-password')) {
          setErrorMessage('Incorrect password. Please try again.');
        } else if (error.message.includes('requires-recent-login')) {
          setErrorMessage('Your session has expired. Please log in again before deleting your account.');
        } else {
          setErrorMessage(`Failed to delete account: ${error.message}`);
        }
      } else {
        setErrorMessage('Failed to delete account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="text-neutral-600">Manage your profile information</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} alt="Profile preview" className="h-full w-full object-cover" />
                ) : user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-primary-700" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-primary-700 rounded-full cursor-pointer hover:bg-primary-800 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h2 className="mt-4 text-xl font-medium text-neutral-900">{user?.name}</h2>
            <p className="text-neutral-500">{user?.email}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-neutral-50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-neutral-50"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-neutral-50"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-neutral-700">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-neutral-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 ">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-error flex items-center bg-red-500 text-white"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>

              <div className="flex space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary flex items-center"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn btn-primary flex items-center"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Account</h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </p>
            
            <div className="mb-4">
              <label htmlFor="deletePassword" className="block text-sm font-medium text-neutral-700 mb-1">
                Enter your password to confirm
              </label>
              <input
                type="password"
                id="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="input w-full"
                placeholder="Your password"
                disabled={isLoading}
              />
            </div>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-lg">
                {errorMessage}
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setErrorMessage('');
                }}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-error bg-red-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 