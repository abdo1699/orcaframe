"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

// Demo accounts
const USERS = [
  { email: "admin@example.com", password: "admin123", role: "admin" },
  { email: "viewer@example.com", password: "view123", role: "viewer" },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const user = USERS.find((u) => u.email === form.email && u.password === form.password);
      if (user) {
        localStorage.setItem("userRole", user.role);
        toast.success("Login successful!");
        const redirectPath = user.role === "admin" ? "/add-data" : "/dashboard";
        window.location.replace(redirectPath);
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative h-12 w-48">
            <Image src="/orcaframe-logo.png" alt="OrcaFrame Logo" fill className="object-contain" priority />
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Sign in to your account</CardTitle>
            <p className="text-sm text-center text-gray-500">Enter your email and password to continue</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                    onClick={() => toast.info("Please contact support to reset your password")}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-11 text-base"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0">
            <p className="text-sm text-center text-gray-500 w-full">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                onClick={() => toast.info("Please contact support to create an account")}
              >
                Contact sales
              </button>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} OrcaFrame. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
