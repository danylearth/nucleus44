
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Download,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Eye,
  Check // Added User icon
} from "lucide-react";
import { format } from "date-fns";
import { listBloodResults } from "@/functions/listBloodResults";
import { downloadBloodResult } from "@/functions/downloadBloodResult";
import { User as UserEntity, LabResult } from "@/entities/all"; // Import User entity and LabResult

export default function BloodResultsPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [files, setFiles] = useState([]); // For admin view (unmatched HL7 files)
  const [userResults, setUserResults] = useState([]); // For user view (matched LabResult entities)
  const [matchedCount, setMatchedCount] = useState(0); // Only relevant for admin view
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null); // Only relevant for admin view
  const [viewingFile, setViewingFile] = useState(null); // Only relevant for admin view

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentUser = await UserEntity.me();
      setUser(currentUser);
      const isAdminUser = currentUser.role === 'admin';
      setIsAdmin(isAdminUser);

      if (isAdminUser) {
        // Admin: Load the queue of unmatched files
        await loadAdminBloodResults();
      } else {
        // Regular User: Load their own completed results
        await loadUserLabResults(currentUser.email);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load user data or results.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminBloodResults = async () => {
    try {
      // Clear previous admin errors if any
      setError(null);
      const response = await listBloodResults();

      console.log('📥 Blood results response (Admin):', response.data);

      if (response.data.success) {
        setFiles(response.data.files || []);
        setMatchedCount(response.data.matched_files || 0);
        if (response.data.matched_files > 0) {
          alert(`✅ Successfully auto-matched ${response.data.matched_files} blood test(s) to patients!`);
        }
      } else {
        setError(response.data.message || 'No unmatched blood results found');
      }
    } catch (err) {
      console.error('Error loading admin blood results:', err);
      setError('Failed to load blood results from server.');
    }
  };

  const loadUserLabResults = async (userEmail) => {
    try {
      // Clear previous user errors if any
      setError(null);
      const results = await LabResult.filter({ created_by: userEmail }, '-test_date');
      setUserResults(results);
    } catch (err) {
       console.error('Error loading user lab results:', err);
       setError('Failed to load your lab results.');
    }
  };

  const handleDownload = async (filename) => {
    try {
      setDownloadingFile(filename);
      console.log('📥 Downloading file:', filename);

      const response = await downloadBloodResult({ filename, action: 'download' });

      console.log('✅ Download response received, type:', typeof response.data);

      // Handle different response types
      let content;
      if (typeof response.data === 'string') {
        content = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        content = new TextDecoder().decode(response.data);
      } else if (response.data instanceof Blob) {
        content = await response.data.text();
      } else {
        content = JSON.stringify(response.data);
      }

      // Create blob as text file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      console.log('✅ Download complete!');
    } catch (err) {
      console.error('❌ Error downloading file:', err);
      alert(`Failed to download file: ${err.message}`);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleView = async (filename) => {
    try {
      setViewingFile(filename);
      console.log('👁️ Viewing file:', filename);

      const response = await downloadBloodResult({ filename, action: 'view' });

      console.log('✅ View response received, type:', typeof response.data);

      // Handle different response types
      let text;
      if (typeof response.data === 'string') {
        text = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        text = new TextDecoder().decode(response.data);
      } else if (response.data instanceof Blob) {
        text = await response.data.text();
      } else {
        text = JSON.stringify(response.data, null, 2);
      }

      // Show HL7 as text in new window with better formatting
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                padding: 20px;
                background-color: #f5f5f5;
              }
              pre {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                overflow-x: auto;
              }
            </style>
          </head>
          <body>
            <h2>${filename}</h2>
            <pre>${text}</pre>
          </body>
        </html>
      `);
      newWindow.document.title = filename;

      console.log('✅ File opened in new tab!');
    } catch (err) {
      console.error('❌ Error viewing file:', err);
      alert(`Failed to view file: ${err.message}`);
    } finally {
      setViewingFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between p-4 pt-12">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Loading Blood Results</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4 space-y-4 animate-pulse">
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Admin View Component
  const AdminView = () => (
    <>
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Unmatched Blood Results</h1>
        <Button variant="ghost" size="icon" onClick={loadAdminBloodResults}>
          <Download className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      <div className="px-4 space-y-6">
        {matchedCount > 0 && (
          <Card className="bg-green-50 rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  {matchedCount} test{matchedCount !== 1 ? 's' : ''} auto-matched!
                </p>
                <p className="text-sm text-green-700">
                  Blood tests were automatically assigned to patients
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          {files.length > 0 && (
            <p className="text-gray-500 text-sm mb-4">
              {files.length} unmatched result{files.length !== 1 ? 's' : ''} requiring manual review in <Link to={createPageUrl("Admin")} className="text-teal-500 underline">Admin Panel</Link>.
            </p>
          )}
        </div>

        {!error && files.length === 0 && (
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No unmatched blood results</h3>
              <p className="text-gray-500 text-sm">
                All blood tests have been processed or auto-matched.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {files.map((file) => (
            <Card key={file.name} className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{file.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {file.modified_date ? format(new Date(file.modified_date), 'MMMM d, yyyy') : 'Date not available'}
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-600 text-xs font-medium">
                        {file.size ? `${(file.size / 1024).toFixed(0)} KB` : 'N/A'}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-600 text-xs font-medium">
                        HL7
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleView(file.name)}
                    disabled={viewingFile === file.name}
                  >
                    {viewingFile === file.name ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </>
                    )}
                  </Button>

                  <Button
                    variant="default"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDownload(file.name)}
                    disabled={downloadingFile === file.name}
                  >
                    {downloadingFile === file.name ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );

  // User View Component
  const UserView = () => (
    <>
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">My Lab Results</h1>
        <div className="w-10"></div> {/* Placeholder for alignment */}
      </div>

      <div className="px-4 space-y-4">
        {userResults.length === 0 ? (
           <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lab Results Yet</h3>
              <p className="text-gray-500 text-sm">
                Your results will appear here once they are processed.
              </p>
            </CardContent>
          </Card>
        ) : (
          userResults.map((result) => (
            <Link to={createPageUrl(`LabResultDetail?id=${result.id}`)} key={result.id}>
              <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.test_name}</h3>
                      <p className="text-sm text-gray-500">{format(new Date(result.test_date), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {error && (
        <Card className="m-4 bg-red-50 border-red-200">
          <CardContent className="p-4 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </CardContent>
        </Card>
      )}
      {isAdmin ? <AdminView /> : <UserView />}
    </div>
  );
}
