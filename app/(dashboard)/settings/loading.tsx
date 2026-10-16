import { Skeleton } from "../../../components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading settings">
      <Skeleton width="12rem" height="1.5rem" />
      <div className="mt-6 space-y-4">
        <Skeleton height="6rem" />
        <Skeleton height="6rem" />
      </div>
    </div>
  );
}
