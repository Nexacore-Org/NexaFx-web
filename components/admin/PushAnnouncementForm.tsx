"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import { Megaphone, Calendar, AlertCircle } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePushAnnouncement, PushAnnouncementData } from "@/hooks/usePushAnnouncement";
import * as Yup from "yup";

// Validation schema
const pushAnnouncementSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  message: Yup.string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"], "Invalid priority level"),
  scheduledAt: Yup.string()
    .nullable()
    .test("future-date", "Scheduled date must be in the future", function(value) {
      if (!value) return true; // Optional field
      return new Date(value) > new Date();
    }),
});

export function PushAnnouncementForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const pushAnnouncementMutation = usePushAnnouncement();

  const formik = useFormik<PushAnnouncementData>({
    initialValues: {
      title: "",
      message: "",
      priority: "medium",
      scheduledAt: "",
    },
    validationSchema: pushAnnouncementSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          scheduledAt: values.scheduledAt || undefined,
        };
        
        await pushAnnouncementMutation.mutateAsync(payload);
        setShowSuccess(true);
        resetForm();
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Failed to push announcement:", error);
      }
    },
  });

  const isSubmitting = pushAnnouncementMutation.isPending;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-blue-600" />
          Push Announcement
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
              <p className="text-sm text-green-800 font-medium">
                Announcement sent successfully!
              </p>
            </div>
          </div>
        )}

        {pushAnnouncementMutation.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-800">
                {pushAnnouncementMutation.error.message || "Failed to send announcement. Please try again."}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <FormInput
            id="title"
            name="title"
            label="Announcement Title"
            placeholder="Enter announcement title"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title ? formik.errors.title : undefined}
          />

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-1">
              Message Content
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your announcement message..."
              className={`block w-full px-3 py-2.5 border ${
                formik.touched.message && formik.errors.message
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none`}
            />
            {formik.touched.message && formik.errors.message && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formik.values.message.length}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-900 mb-1">
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {formik.touched.priority && formik.errors.priority && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.priority}</p>
              )}
            </div>

            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-900 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={formik.values.scheduledAt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                min={new Date().toISOString().slice(0, 16)}
                className={`block w-full px-3 py-2.5 border ${
                  formik.touched.scheduledAt && formik.errors.scheduledAt
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              />
              {formik.touched.scheduledAt && formik.errors.scheduledAt && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.scheduledAt}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to send immediately
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formik.isValid}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Push Announcement
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => formik.resetForm()}
              disabled={isSubmitting}
              className="px-6"
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
