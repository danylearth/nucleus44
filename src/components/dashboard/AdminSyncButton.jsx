import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('listBloodResults', {});
      
      if (response.data.success) {
        setLastSync({
          timestamp: new Date(),
          newFiles: response.data.new_files_matched,
          unmatched: response.data.unmatched_files_count
        });
      } else {
        setError('Sync failed');
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-0 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Blood Results Sync</h3>
          {lastSync && (
            <p className="text-xs text-gray-500 mt-1">
              Last synced: {lastSync.timestamp.toLocaleTimeString()} 
              • {lastSync.newFiles} new files
            </p>
          )}
        </div>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">Sync failed</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {lastSync && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 font-medium">Sync successful</p>
            <p className="text-xs text-green-600 mt-1">
              {lastSync.newFiles} new results processed
              {lastSync.unmatched > 0 && ` • ${lastSync.unmatched} unmatched files`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}