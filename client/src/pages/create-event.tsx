import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../App";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertEventSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const extendedEventSchema = insertEventSchema
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    hasSeating: z.boolean().default(false),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type EventFormValues = z.infer<typeof extendedEventSchema>;

export default function CreateEvent() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const { toast } = useToast();
  const [seatingMap, setSeatingMap] = useState({ rows: 10, cols: 10, unavailableSeats: [] });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login?redirect=/create-event");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(extendedEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      location: "",
      organizerId: user?.id || 0,
      categoryId: 1,
      isFeatured: false,
      isTrending: false,
      hasSeating: false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const eventData = {
        ...data,
        organizerId: user?.id || 0,
        seatingMap: data.hasSeating ? seatingMap : null,
      };
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Event Created",
        description: "Your event has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/organizer/me"] });
      setLocation(`/events/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormValues) => {
    createEventMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (!user?.isOrganizer) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-4 text-lg text-gray-600">
          You need to be registered as an event organizer to create events.
        </p>
        <Button className="mt-6" onClick={() => setLocation("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900">Create New Event</h1>
        <p className="mt-2 text-lg text-gray-600">
          Fill out the form below to create and publish your event
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Summer Music Festival 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event, including what attendees can expect"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Grand Park, Los Angeles, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to a high-quality image for your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date and Time</CardTitle>
              <CardDescription>When will your event take place?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Options</CardTitle>
              <CardDescription>Additional settings for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="hasSeating"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Reserved Seating</FormLabel>
                      <FormDescription>
                        Enable if your event has a seating chart
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("hasSeating") && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium">Seating Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Number of Rows</label>
                      <Input
                        type="number"
                        min="1"
                        value={seatingMap.rows}
                        onChange={(e) =>
                          setSeatingMap({ ...seatingMap, rows: parseInt(e.target.value) || 1 })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Number of Columns</label>
                      <Input
                        type="number"
                        min="1"
                        value={seatingMap.cols}
                        onChange={(e) =>
                          setSeatingMap({ ...seatingMap, cols: parseInt(e.target.value) || 1 })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Event</FormLabel>
                        <FormDescription>
                          Featured events appear in special sections
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTrending"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Trending Event</FormLabel>
                        <FormDescription>
                          Mark event as currently trending
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {createEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
