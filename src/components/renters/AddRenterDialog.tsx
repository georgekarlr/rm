import React, { useState } from 'react';
import { UserPlus, X, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { supabase } from '../../lib/supabase';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { triggerRentersRefresh } from '../../hooks/useRenters';

interface SocialMedia {
  platform: string;
  handle: string;
}

interface AddRenterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRenterDialog({ isOpen, onClose, onSuccess }: AddRenterDialogProps) {
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

      console.log('🔄 Adding renter:', {
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

      // Call the Supabase function to create renter
      const { data, error } = await supabase.rpc('create_renter_and_log', {
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
          console.log('✅ Renter added successfully:', data);

          // Show success message
          setMessage({ 
            type: 'success', 
            text: result.message || `Renter "${formData.firstName} ${formData.lastName}" has been added successfully!` 
          });

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
            text: result.message || 'Failed to add renter' 
          });
        }
      } else {
        setMessage({ type: 'error', text: 'Unable to add renter. Please try again.' });
      }

    } catch (error: any) {
      console.error('❌ Error adding renter:', error);
      
      let errorMessage = 'Failed to add renter';
      if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'A renter with this email already exists';
        } else if (error.message.includes('permission') || error.message.includes('access')) {
          errorMessage = 'You do not have permission to add renters';
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
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        otherInfo: ''
      });
      setSocialMedia([{ platform: '', handle: '' }]);
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Renter</h2>
              <p className="text-sm text-gray-600">Create a new renter profile</p>
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
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  Adding renter as: {currentUser?.name} ({currentUser?.user_type})
                </span>
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
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="M"
                  disabled={submitting}
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  label="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                  disabled={submitting}
                  className="focus:ring-blue-500 focus:border-blue-500"
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
                  className="focus:ring-blue-500 focus:border-blue-500"
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
                  className="focus:ring-blue-500 focus:border-blue-500"
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
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
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
                  Add social media profiles to help with communication and verification.
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              {/* Message */}
              {message && (
                <Alert
                  type={message.type}
                  message={message.text}
                />
              )}

              {/* Help Text */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Social Media Examples:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>• <strong>Twitter:</strong> @username</div>
                  <div>• <strong>Instagram:</strong> username_photos</div>
                  <div>• <strong>LinkedIn:</strong> firstname-lastname</div>
                  <div>• <strong>Facebook:</strong> firstname.lastname</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Note:</strong> All fields marked with * are required. Social media and additional information are optional but can be helpful for communication and record-keeping.
                </p>
              </div>
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
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Renter...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Renter
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}