import React from "react"

const ContactSkeleton = () => {
  return (
    <div className="animate-pulse max-w-6xl mx-auto bg-white px-3 lg:px-6 py-6 lg:py-12 text-lg">
      {/* Back Button */}
      <div className="h-8 w-40 bg-gray-300 rounded mb-6"></div>

      {/* Title */}
      <div className="h-10 w-3/4 bg-gray-300 rounded mx-auto mb-4"></div>
      <div className="h-6 w-1/2 bg-gray-300 rounded mx-auto mb-6"></div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Contact Info Placeholder */}
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>

        {/* Right: Contact Form Placeholder */}
        <div className="bg-white p-6 rounded-lg border border-gray-50 shadow-sm">
          <div className="h-8 w-1/2 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
          <div className="h-10 bg-gray-300 rounded mb-4"></div>
          <div className="h-10 bg-gray-300 rounded mb-4"></div>
          <div className="h-28 bg-gray-300 rounded mb-4"></div>
          <div className="h-12 bg-gray-400 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}

export default ContactSkeleton
