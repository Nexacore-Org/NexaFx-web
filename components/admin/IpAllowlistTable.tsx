'use client';

import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import type { IpAllowlistEntry } from '@/lib/api/admin';

interface IpAllowlistTableProps {
  entries: IpAllowlistEntry[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export function IpAllowlistTable({ entries, onToggle, onDelete }: IpAllowlistTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">IP Address / CIDR</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Label</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Added By</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Date Added</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-mono text-gray-900">{entry.ipAddress}</td>
              <td className="py-3 px-4 text-gray-700">{entry.label}</td>
              <td className="py-3 px-4 text-gray-700">{entry.addedBy}</td>
              <td className="py-3 px-4 text-gray-600">{entry.dateAdded}</td>
              <td className="py-3 px-4">
                <Switch
                  checked={entry.isActive}
                  onCheckedChange={(checked) => onToggle(entry.id, checked)}
                  size="sm"
                />
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
