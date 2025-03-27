"use client"

import { useFormik } from "formik"
import { Mail, MapPin, MoveLeft, Phone, Send } from "lucide-react"
import Link from "next/link"
import { contactSchema } from "@/utils/authValidationSchema"


export default function ContactPage() {
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
      // Here you would typically send the form data to your backend
    },
  })

  return (
    <div className="max-w-6xl mx-auto bg-white px-3 lg:px-6 py-6 lg:py-12 text-lg">
      <Link href={"/"} className="flex my-6 px-3 text-xl items-center hover:scale-105]">
        <MoveLeft className="mr-2" />
        <h2>Back to home</h2>
      </Link>
      <h1 className="text-4xl font-bold text-center mb-2">Contact Us</h1>
      <p className="text-[#71717A] text-center mb-4 lg:mb-8">Have questions or need help? We&apos;re here to help.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Contact Form */}
        <div className="space-y-6">
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

            <div className="flex space-x-3 my-3">
              <div className="p-2 rounded-full bg-[#d9e9ff] w-fit h-fit">
                <MapPin className="text-[#3c78f4]" />
              </div>
              <div className="text-[#71717A]">
                <p className="font-bold text-black">Visit Us</p>
                <p>NexaFx Headquarters</p>
                <p>123 Financial District</p>
                <p>Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#EFF6FF] to-[#FEF9C3] p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Office Hours</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="font-medium">9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium">10:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium">Closed</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-50 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Send Us a message</h2>
          <form onSubmit={formik.handleSubmit} className="space-y-4 text-[#09090B] mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block my-2">First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={formik.values.firstname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 px-3 border ${formik.touched.firstname && formik.errors.firstname ? "border-red-500" : "border-[#E4E4E7]"
                    } rounded-md`}
                />
                {formik.touched.firstname && formik.errors.firstname && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.firstname}</p>
                )}
              </div>
              <div>
                <label className="block my-2">Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formik.values.lastname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 px-3 border ${formik.touched.lastname && formik.errors.lastname ? "border-red-500" : "border-[#E4E4E7]"
                    } rounded-md`}
                />
                {formik.touched.lastname && formik.errors.lastname && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.lastname}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block my-2">Email</label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full p-2 px-3 border ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-[#E4E4E7]"
                  } rounded-md`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block my-2">Phone (optional)</label>
              <input
                type="text"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-2 px-3 border border-[#E4E4E7] rounded-md"
              />
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Inquiry Type</h3>
              <div className="flex justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="inquiryType"
                    value="general"
                    checked={formik.values.inquiryType === "general"}
                    onChange={formik.handleChange}
                    className="accent-black"
                  />
                  General Inquiry
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="inquiryType"
                    value="support"
                    checked={formik.values.inquiryType === "support"}
                    onChange={formik.handleChange}
                    className="accent-black"
                  />
                  Technical Support
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="inquiryType"
                    value="billing"
                    checked={formik.values.inquiryType === "billing"}
                    onChange={formik.handleChange}
                    className="accent-black"
                  />
                  Billing
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="inquiryType"
                    value="other"
                    checked={formik.values.inquiryType === "other"}
                    onChange={formik.handleChange}
                    className="accent-black"
                  />
                  Other
                </label>
              </div>
            </div>

            <div>
              <label className="block my-2">Message</label>
              <textarea
                name="message"
                value={formik.values.message}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full p-2 px-3 border ${formik.touched.message && formik.errors.message ? "border-red-500" : "border-[#E4E4E7]"
                  } rounded-md h-28`}
              ></textarea>
              {formik.touched.message && formik.errors.message && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#EAB308] text-white p-3 rounded-md hover:bg-gray-800 text-lg"
              disabled={formik.isSubmitting}
            >
              <Send className="inline mr-2 " /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

