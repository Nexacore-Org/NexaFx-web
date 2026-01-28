export function Information() {
  return (
    <div className=" rounded-2xl border-[#8C8C8C] border-[0.25px] bg-white dark:bg-black/5 mt-10">
      <h3 className="text-[#00000066] mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
        Account Information
      </h3>
      <div className="flex justify-between items-center gap-5 px-5">
        <div>
          <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
            Email Address
          </h4>
          <p className="text-[12px] text-[#535353] font-normal dark:text-white">
            If you need to change your e-mail address, please contact{" "}
            <span className="underline">Customer Service</span>
          </p>
        </div>
        <span className="text-sm">a***n@yahoo.com</span>
      </div>
      <div className="flex justify-between items-center gap-5 px-5 pt-6 pb-6.25">
        <div>
          <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
            Verify Phone Number
          </h4>
          <p className="text-[12px] text-[#535353] font-normal dark:text-white">
            Verify your phone number
          </p>
        </div>
        <button className="button-verify rounded-[25px] w-26.5 h-8.25 cursor-pointer text-[14px] font-semibold">
          <span className="sm:bg-white max-sm:text-[#FFFEF9] dark:text-black rounded-[25px]">
            Verify
          </span>
        </button>
      </div>
    </div>
  );
}
