import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Home, Mail, Lock, UserPlus, LogIn, ExternalLink } from 'lucide-react';
import { useAuthFormLogic } from '../../hooks/useAuthFormLogic';
import { CeintellyLogo } from '../CeintellyLogo';

export function AuthForm() {
  const {
    isSignUp,
    formData,
    loading,
    message,
    handleInputChange,
    handleSubmit,
    toggleAuthMode,
    handleForgotPassword,
    handleSignUp
  } = useAuthFormLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CeintellyLogo width={60} height={60} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Rent Management
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </CardHeader>

          <CardContent>
            {message && (
              <Alert
                type={message.type}
                message={message.text}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-11"
                  required
                />
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleSignUp}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                size="lg"
              >
                {isSignUp ? (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>

            {/* Ceintelly Branding */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <a 
                  href="https://ceintelly.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span className="font-semibold">Powered by Ceintelly</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                For account management, visit <a href="https://ceintelly.org" className="text-blue-600 hover:underline">ceintelly.org</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bolt.new Badge */}
      <a 
        href="https://bolt.new/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-4 right-4 z-50 transition-transform hover:scale-110"
      >
        <img 
          src="/black_circle_360x360.png" 
          alt="Powered by Bolt.new" 
          className="w-12 h-12 sm:w-16 sm:h-16"
        />
      </a>
    </div>
  );
}