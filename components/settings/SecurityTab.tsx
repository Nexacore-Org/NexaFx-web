"use client";

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Session Activity Logs</h3>
          <p className="text-sm text-gray-500">
            View active sessions and login history
          </p>
        </div>
        <button className="border px-4 py-2 rounded">View Logs</button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Device Logged in</h3>
          <p className="text-sm text-gray-500">Manage your connected devices</p>
        </div>
        <button className="border px-4 py-2 rounded">Manage</button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Log out all device</h3>
          <p className="text-sm text-gray-500">Force logout on all devices</p>
        </div>
        <button className="border px-4 py-2 rounded">Log out</button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Delete My Account</h3>
          <p className="text-sm text-gray-500">
            Permanently remove your account and data
          </p>
        </div>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          Delete
        </button>
      </div>

      <div className="flex space-x-4">
        <button className="bg-yellow-500 text-white px-6 py-2 rounded">
          Save Changes
        </button>
        <button className="border px-6 py-2 rounded">Cancel</button>
      </div>
    </div>
  );
}
