import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function Preference() {
  return (
    <div className="rounded-2xl border-[#8C8C8C] border-[0.25px] bg-white dark:bg-black/5 mt-6">
      <h3 className="text-[#00000066] mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
        Preferences
      </h3>
      <div className="flex justify-between items-center gap-5 px-5">
        <div>
          <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
            Language
          </h4>
          <p className="text-[12px] text-[#535353] font-normal dark:text-white">
            Select your preferred language
          </p>
        </div>
        <div className="select-gradient">
          <Select defaultValue="english">
            <SelectTrigger className="sm:w-80.5 sm:h-14.25! text-[#1A1A1A] text-sm sm:text-lg font-medium">
              <SelectValue className="" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="dark">Frances</SelectItem>
              <SelectItem value="system">Portuges</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-between items-center gap-5 px-5 pt-6 pb-6.25">
        <div className="max-w-124.25">
          <h4 className="text-[#000000CC] font-semibold text-[15px] sm:text-lg dark:text-white">
            Fiat Display
          </h4>
          <p className="text-[12px] text-[#535353] font-normal dark:text-white max-sm:hidden ">
            Lorem ipsum dolor sit amet consectetur. Commodo tellus velit lectus
            cursus ac odio elit ultrices. Felis sed id dui viverra dignissim
            consectetur orci.
          </p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2.5 max-sm:text-[13px] font-medium">
            <Checkbox className="h-4 w-4 sm:h-8 sm:w-8" /> NGN
          </div>
          <div className="flex items-center gap-2.5 max-sm:text-[13px] font-medium">
            <Checkbox className="h-4 w-4 sm:h-8 sm:w-8" /> USDT/USDC
          </div>
        </div>
      </div>
    </div>
  );
}
