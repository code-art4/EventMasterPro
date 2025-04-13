import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../App";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const extendedUserSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof extendedUserSchema>;

export default function Register() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const { toast } = useToast();
  const [redirectPath, setRedirectPath] = useState("/");

  // Get redirect path from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split("?")[1]);
    const redirect = urlParams.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation(redirectPath);
    }
  }, [authLoading, isAuthenticated, redirectPath, setLocation]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(extendedUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      isOrganizer: false,
      avatarUrl: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      // Remove confirmPassword as it's not in the API schema
      const { confirmPassword, ...userData } = data;
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });
      
      // Redirect to the specified path
      window.location.href = redirectPath;
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="yourusername" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be your unique identifier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-avatar.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link to your profile picture
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isOrganizer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Register as an Event Organizer
                      </FormLabel>
                      <FormDescription>
                        Check this if you want to create and manage events
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-primary-600 hover:text-primary-700"
              onClick={() => setLocation(`/login${redirectPath !== "/" ? `?redirect=${redirectPath}` : ""}`)}
            >
              Sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
