import { Switch } from "../ui/switch";

export function Notification() {
  return (
    <div>
      <div className=" rounded-2xl border-[#8C8C8C] border-[0.25px] bg-white dark:bg-black/5 ">
        <h3 className="text-[#00000066] mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
          Notification Push
        </h3>

        <div className="space-y-6 pb-5">
          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                In-app notification
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <Switch className="gradient-blue-yellow border-none" size="lg" />
          </div>

          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                Sms notification
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <Switch className="gradient-blue-yellow border-none" size="lg" />
          </div>
          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124 .25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                Email notification
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <Switch className="gradient-blue-yellow border-none" size="lg" />
          </div>
          <div className="flex justify-between items-center gap-6 px-5">
            <div className="max-w-124.25">
              <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
                Transaction Alert
              </h4>
              <p className="text-[12px] text-[#535353] font-normal dark:text-white">
                Lorem ipsum dolor sit amet consectetur. Commodo tellus velit
                lectus cursus ac odio elit ultrices. Felis sed id dui viverra
                dignissim consectetur orci.
              </p>
            </div>
            <Switch className="gradient-blue-yellow border-none" size="lg" />
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
