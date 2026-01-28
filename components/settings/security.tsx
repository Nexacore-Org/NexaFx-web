import { Trash2 } from "lucide-react";

export function Security() {
  return (
    <div>
      <div className=" rounded-2xl border-[#8C8C8C] border-[0.25px] bg-white dark:bg-black/5">
        <h3 className="text-[#00000066] mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
          General
        </h3>

        <div className="space-y-6 pb-5">
          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                Session Activity Logs
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button className="button-verify shrink-0 rounded-[19px] w-21.5 h-7 cursor-pointer text-[14px] font-semibold">
              <span className="bg-white dark:text-black rounded-[19px]">
                View Logs
              </span>
            </button>
          </div>

          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                Device Logged in
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button className="button-verify shrink-0 rounded-[19px] w-21.5 h-7 cursor-pointer text-[14px] font-semibold">
              <span className="bg-white dark:text-black rounded-[19px]">
                Manage
              </span>
            </button>
          </div>
          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124 .25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                Log out all device
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button className="flex shrink-0 text-sm w-23.5 justify-center items-center gap-1.5 cursor-pointer border h-8 border-[#BFBFBF] hover:bg-gray-50 text-[#0D0D0D] dark:text-white font-semibold transition-colors">
              <Trash2 className="size-4" /> Log out
            </button>
          </div>
          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                Delete My Account
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <button className="flex shrink-0 text-sm w-23.5 justify-center items-center gap-1.5 cursor-pointer bg-[#E90004] h-8 text-white font-semibold rounded-[8px]">
              <Trash2 className="size-4 text-white" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 md:flex-row flex-col md:max-w-105.25 mt-10 mb-3.5 ml-auto">
        <button className="flex-1 cursor-pointer py-4 bg-[#F0BB16] hover:bg-yellow-500 rounded-sm text-[#0D0D0D] font-medium transition-colors md:text-sm">
          Save Changes
        </button>
        <button className="flex-1 cursor-pointer py-4 border border-[#BFBFBF] hover:bg-gray-50 text-[#0D0D0D] dark:text-white font-semibold rounded-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
