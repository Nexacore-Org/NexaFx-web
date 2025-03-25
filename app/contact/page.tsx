"use client";

import { Mail, MapPin, MoveLeft, Phone, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, inquiryType: e.target.value });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white px-3 lg:px-6 py-6 lg:py-12 text-lg">
      <Link href={"/"} className="flex my-6 px-3 text-xl items-center hover:scale-105]">
        <MoveLeft className="mr-2"/>
        <h2>Back to home</h2>
      </Link>
      <h1 className="text-4xl font-bold text-center mb-2">Contact Us</h1>
      <p className="text-[#71717A] text-center mb-4 lg:mb-8">Have questions or need help? We&apos;re here to help.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Contact Form */}
        <div className="space-y-6">
          <div className="bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-[#71717A]">Our team is ready to assist you with any questions or concerns you may have about our services</p>
            <div className="flex space-x-3 my-3">
                <div className="p-2 rounded-full bg-[#d9e9ff] w-fit h-fit">
                    <Mail  className="text-[#3c78f4]"/>
                </div>
                <div className="text-[#71717A]">
                    <p className="font-bold text-black">
                    Email
                    </p>
                    <p  className="text-[#3c78f4]">
                    support@nexafx.com
                    </p>
                    <p>
                    We&apos;ll respond within 24 hours
                    </p>
                </div>
            </div>
            <div className="flex space-x-3 my-3">
                <div className="p-2 rounded-full bg-[#fdfcbd] w-fit h-fit">
                    <Phone className="text-[#e8b300]"/>
                </div>
                <div className="text-[#71717A]">
                    <p className="font-bold text-black">
                    Call Us
                    </p>
                    <p  className="text-[#3c78f4]">
                    +234 123 456 7890
                    </p>
                    <p>
                    Mon-Fri: 9am-5pm WAT
                    </p>
                </div>
            </div>

            <div className="flex space-x-3 my-3">
                <div className="p-2 rounded-full bg-[#d9e9ff] w-fit h-fit">
                    <MapPin  className="text-[#3c78f4]"/>
                </div>
                <div className="text-[#71717A]">
                    <p className="font-bold text-black">
                    Visit Us
                    </p>
                    <p>
                    NexaFx Headquarters
                    </p>
                    <p>
                    123 Financial District
                    </p>
                    <p>
                    Lagos, Nigeria
                    </p>
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
          <form onSubmit={handleSubmit} className="space-y-4 text-[#09090B] mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block my-2">First Name</label>
                <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full p-2 px-3 border border-[#E4E4E7] rounded-md"
                    required
                />
              </div>
              <div>
                <label className="block my-2">Last Name</label>
                <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full p-2 px-3 border border-[#E4E4E7] rounded-md"
                    required
                />
              </div>
            </div>
            <div>
                <label className="block my-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 px-3 border border-[#E4E4E7] rounded-md"
                    required
                />
            </div>

            <div>
                    <label className="block my-2">Phone (optional)</label>
                    <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                        checked={formData.inquiryType === "general"}
                        onChange={handleRadioChange}
                        className="accent-black"
                    />
                    General Inquiry
                    </label>
                    <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="inquiryType"
                        value="support"
                        checked={formData.inquiryType === "support"}
                        onChange={handleRadioChange}
                        className="accent-black"
                    />
                    Technical Support
                    </label>
                    <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="inquiryType"
                        value="billing"
                        checked={formData.inquiryType === "billing"}
                        onChange={handleRadioChange}
                        className="accent-black"
                    />
                    Billing
                    </label>
                    <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="inquiryType"
                        value="other"
                        checked={formData.inquiryType === "other"}
                        onChange={handleRadioChange}
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
                value={formData.message}
                onChange={handleChange}
                className="w-full p-2 px-3 border border-[#E4E4E7] rounded-md h-28"
                required
                >

                </textarea>
            </div>

            

            <button type="submit" className="w-full bg-gradient-to-r from-[#3B82F6] to-[#EAB308] text-white p-3 rounded-md hover:bg-gray-800 text-lg">
              <Send className="inline mr-2 "/> Send Message
            </button>
          </form>
        </div>

        
        
      </div>
    </div>
  );
}
