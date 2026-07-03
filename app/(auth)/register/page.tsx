"use client";

import { useState } from "react";
import styles from "../login/login.module.css";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row relative overflow-hidden">
      {/* Right Column - Decorative Panel (hidden on mobile, visible on md:) */}
      <div className="hidden md:flex w-full lg:w-1/2 relative order-1 lg:order-2">
        {/* Background Image */}
        {/* <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        /> */}
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-linear-to-br from-yellow-500/20 via-transparent to-orange-500/20" />
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12 text-center">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Begin Your Logbook Journey
            </h2>
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed">
              Join today and start documenting every session, reflection, and
              milestone — all in one secure, searchable place.
            </p>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-yellow-500/10 rounded-2xl backdrop-blur-sm animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-orange-500/10 rounded-full backdrop-blur-sm animate-pulse delay-700" />
        </div>
      </div>

      {/* Left Column - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center pt-6 sm:p-8 relative order-2 lg:order-1">
        {/* Card */}
        <div className="relative w-full max-w-md mx-4 pt-6 sm:p-8 z-10">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 ">
              <Image
                src={"/clock-v3.png"}
                height={200}
                width={200}
                alt="logo"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Create Account
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              Start tracking your work sessions today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center ${styles.shake}`}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-zinc-300"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1.5 text-xs ${
                        req.met ? "text-green-400" : "text-zinc-500"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${req.met ? "opacity-100" : "opacity-30"}`}
                      />
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-zinc-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
                />
              </div>
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-1.5 text-xs text-green-400 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Passwords match
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-2 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-zinc-900 font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
