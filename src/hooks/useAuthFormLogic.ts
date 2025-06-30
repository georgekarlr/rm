import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthFormData } from '../types/auth';

export function useAuthFormLogic() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // Redirect to ceintelly.org for sign up
        handleSignUp();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setMessage(null);
    setFormData({ email: '', password: '' });
  };

  const handleForgotPassword = () => {
    // Redirect to ceintelly.org/forgot-password
    window.location.href = 'https://ceintelly.org/forgot-password';
  };

  const handleSignUp = () => {
    // Redirect to ceintelly.org for sign up
    window.location.href = 'https://ceintelly.org';
  };

  return {
    isSignUp,
    formData,
    loading,
    message,
    handleInputChange,
    handleSubmit,
    toggleAuthMode,
    handleForgotPassword,
    handleSignUp
  };
}