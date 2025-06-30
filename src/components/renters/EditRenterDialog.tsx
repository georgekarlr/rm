import React, { useState, useEffect } from 'react';
import { Edit, X, Save, Loader2, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerRentersRefresh, type Renter } from '../../hooks/useRenters';

interface SocialMedia {
  platform: string;
  handle: string;
}

interface EditRenterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  renter: Renter | null;
}

export function EditRenterDialog({ isOpen, onClose, onSuccess, renter }: EditRenterDialogProps) {
  const { currentUser } = useCurrentUser();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    otherInfo: ''
  });
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([{ platform: '', handle: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update form when renter changes
  useEffect(() => {
    if (renter) {
      setFormData({
        firstName: renter.firstName,
        middleName: renter.middleName,
        lastName: renter.lastName,
        email: renter.email,
        phoneNumber: renter.phoneNumber,
        otherInfo: renter.otherInfo
      });
      
      // Set social media or default empty field
      if (renter.socialMedia && renter.socialMedia.length > 0) {
        setSocialMedia(renter.socialMedia);
      } else {
        setSocialMedia([{ platform: '', handle: '' }]);
      }
    } else {
      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        otherInfo: ''
      });
      setSocialMedia([{ platform: '', handle: '' }]);
    }
    setMessage(null);
  }, [renter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addSocialMediaField = () => {
    setSocialMedia([...socialMedia, { platform: '', handle: '' }]);
  };

  const removeSocialMediaField = (index: number) => {
    if (socialMedia.length > 1) {
      setSocialMedia(socialMedia.filter((_, i) => i !== index));
    }
  };

  const updateSocialMedia = (index: number, field: 'platform' | 'handle', value: string) => {
    const updated = socialMedia.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setSocialMedia(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.name) {
      setMessage({ type: 'error', text: 'Current user name is required' });
      return;
    }

    if (!renter) {
      setMessage({ type: 'error', text: 'No renter selected for editing' });
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setMessage({ type: 'error', text: 'Phone number is required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Filter out empty social media entries
      const validSocialMedia = socialMedia.filter(item => 
        item.platform.trim() && item.handle.trim()
      );

      console.log('🔄 Updating renter:', {
        renterId: renter.id,
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        socialMedia: validSocialMedia,
        otherInfo: formData.otherInfo.trim(),
        username: currentUser.name
      });

      // Convert social media to JSONB array format as required by the function
      const jsonbSocialMedia = validSocialMedia.map(item => ({
        platform: item.platform.trim(),
        handle: item.handle.trim()
      }));

      // Call the Supabase function to update renter
      const { data, error } = await supabase.rpc('update_renter_and_log', {
        p_renter_id: renter.id,
        p_first_name: formData.firstName.trim(),
        p_middle_name: formData.middleName.trim() || null,
        p_last_name: formData.lastName.trim(),
        p_email: formData.email.trim(),
        p_phone_number: formData.phoneNumber.trim(),
        p_social_media: jsonbSocialMedia,
        p_other_info: formData.otherInfo.trim() || null,
        p_username: currentUser.name
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(error.message);
      }

      // Check the response from the function
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          console.log('✅ Renter updated successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Renter "${formData.firstName} ${formData.lastName}" has been updated successfully!` 
          });

          // Trigger global refresh to update all components
          triggerRentersRefresh();

          // Call success callback after a short delay
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        } else {
          // Function returned success: false
          setMessage({ 
            type: 'error', 
            text: result.message || 'Failed to update renter' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to update renter. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error updating renter:', error);
      
      let errorMessage = 'Failed to update renter';
      if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'A renter with this email already exists';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to update renters';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Renter not found or has been deleted';
        } else if (error.message.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen || !renter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Edit className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Renter</h2>
              <p className="text-sm text-gray-600">Update renter information</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Current User Info */}
            <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-800">
                  Editing as: {currentUser?.name} ({currentUser?.user_type})
                </span>
              </div>
            </div>

            {/* Current Renter Info */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Current Renter:</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {renter.firstName} {renter.middleName && renter.middleName + ' '}{renter.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{renter.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{renter.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                  disabled={submitting}
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
                <Input
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="M"
                  disabled={submitting}
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
                <Input
                  label="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  disabled={submitting}
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                  required
                  disabled={submitting}
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
                <Input
                  label="Phone Number *"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                  disabled={submitting}
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Social Media */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Social Media (Optional)
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSocialMediaField}
                    disabled={submitting}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Social Media
                  </Button>
                </div>

                <div className="space-y-3">
                  {socialMedia.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Input
                          label={index === 0 ? "Platform" : ""}
                          value={item.platform}
                          onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                          placeholder="e.g., Twitter, Instagram, LinkedIn"
                          disabled={submitting}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          label={index === 0 ? "Handle/Username" : ""}
                          value={item.handle}
                          onChange={(e) => updateSocialMedia(index, 'handle', e.target.value)}
                          placeholder="e.g., @username, username"
                          disabled={submitting}
                        />
                      </div>
                      {socialMedia.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeSocialMediaField(index)}
                          disabled={submitting}
                          className="text-red-600 border-red-300 hover:bg-red-50 mb-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Update social media profiles for better communication and verification.
                </p>
              </div>

              {/* Other Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  name="otherInfo"
                  value={formData.otherInfo}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about this renter (preferences, special requirements, etc.)"
                  disabled={submitting}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              {/* Message */}
              {message && (
                <Alert
                  type={message.type}
                  message={message.text}
                />
              )}
            </form>
          </div>
        </div>

        {/* Actions - Fixed */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phoneNumber.trim() || submitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Renter...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Renter
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}