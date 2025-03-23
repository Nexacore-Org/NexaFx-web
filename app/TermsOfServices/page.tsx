"use client"
import { ArrowLeft } from "lucide-react";
import { termsData } from "./Data"
import { useRouter } from "next/navigation";

export default function TermsOfService() {



    const router = useRouter();


    return (


        <>

            <header className=" w-full  pl-[12%] pt-4 pb-3 "  >
                <button onClick={() => router.back()} className=" text-sm cursor-pointer flex flex-row items-center justify-center gap-1.5 "  > <ArrowLeft size={20} /> <span>Back to home</span> </button>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-1">Terms of Service</h1>
                    <p className="text-sm text-gray-500">Last updated: March 15, 2023</p>
                </div>

                {termsData.sections.map((section) => (
                    <section key={section.id} className={`mb-6 `}>
                        <h2 className="font-semibold mb-2">
                            {section.id}. {section.title}
                        </h2>
                        {section.content.map((paragraph, index) => (
                            <p key={index} className="text-sm mb-3">
                                {paragraph} {section.id === 11 ? <a href="#" className="text-blue-500 underline" >legal@nexafx.com</a> : null}
                            </p>
                        ))}


                    </section>
                ))}
            </div>

        </>
    )
}

