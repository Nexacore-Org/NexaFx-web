"use client"

import { useState, useEffect } from "react"
import { useFormik } from "formik"
import { Mail, MapPin, MoveLeft, Phone, Send } from "lucide-react"
import Link from "next/link"
import { contactSchema } from "@/utils/authValidationSchema"
import ContactSkeleton from "../components/skeletons/ContactSkeleton"

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000) // Simulate API delay
    return () => clearTimeout(timer)
  }, [])

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: "general",
    },
    validationSchema: contactSchema,
    onSubmit: (values) => {
      console.log("Form submitted:", values)
    },
  })

  // ✅ Show Skeleton Loader first, then render the actual page
  if (isLoading) {
    return <ContactSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto bg-white px-3 lg:px-6 py-6 lg:py-12 text-lg">
      <Link href={"/"} className="flex my-6 px-3 text-xl items-center hover:scale-105">
        <MoveLeft className="mr-2" />
        <h2>Back to home</h2>
      </Link>
      <h1 className="text-4xl font-bold text-center mb-2">Contact Us</h1>
      <p className="text-[#71717A] text-center mb-4 lg:mb-8">Have questions or need help? We&apos;re here to help.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Existing Contact Info & Form */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-[#71717A]">
              Our team is ready to assist you with any questions or concerns you may have about our services
            </p>
            <div className="flex space-x-3 my-3">
              <div className="p-2 rounded-full bg-[#d9e9ff] w-fit h-fit">
                <Mail className="text-[#3c78f4]" />
              </div>
              <div className="text-[#71717A]">
                <p className="font-bold text-black">Email</p>
                <p className="text-[#3c78f4]">support@nexafx.com</p>
                <p>We&apos;ll respond within 24 hours</p>
              </div>
            </div>
            <div className="flex space-x-3 my-3">
              <div className="p-2 rounded-full bg-[#fdfcbd] w-fit h-fit">
                <Phone className="text-[#e8b300]" />
              </div>
              <div className="text-[#71717A]">
                <p className="font-bold text-black">Call Us</p>
                <p className="text-[#3c78f4]">+234 123 456 7890</p>
                <p>Mon-Fri: 9am-5pm WAT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-50 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Send Us a message</h2>
          <form onSubmit={formik.handleSubmit} className="space-y-4 text-[#09090B] mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block my-2">First Name</label>
                <input type="text" name="firstname" value={formik.values.firstname} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full p-2 px-3 border border-[#E4E4E7] rounded-md" />
              </div>
              <div>
                <label className="block my-2">Last Name</label>
                <input type="text" name="lastname" value={formik.values.lastname} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full p-2 px-3 border border-[#E4E4E7] rounded-md" />
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-[#3B82F6] to-[#EAB308] text-white p-3 rounded-md hover:bg-gray-800 text-lg">
              <Send className="inline mr-2 " /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
