import { InfoAvatar } from "./info-avatar";
import { Information } from "./information";
import { Preference } from "./preference";

export function AccountInfo() {
  return (
    <div>
      <InfoAvatar />
      <Information />
      <Preference />

      <div className="flex gap-3  md:flex-row flex-col md:max-w-105.25 mt-10 mb-3.5">
        <button className="flex-1 cursor-pointer py-4 bg-[#F0BB16] hover:bg-yellow-500 rounded-sm text-black font-medium transition-colors md:text-sm">
          Save Changes
        </button>
        <button className="flex-1 cursor-pointer py-4 border border-border hover:bg-muted text-foreground font-semibold rounded-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
