import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllUsers } from '@/functions/getAllUsers';
import { assignPatientToClinic } from '@/functions/assignPatientToClinic';
import { matchBloodResult } from '@/functions/matchBloodResult';
import { base44 } from '@/api/base44Client';
import { Shield, Copy, Check, Users, Building2, FileText } from 'lucide-react';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [bloodFiles, setBloodFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Assignment form state
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedClinic, setSelectedClinic] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    // Blood result matching state
    const [selectedFile, setSelectedFile] = useState('');
    const [selectedUserForFile, setSelectedUserForFile] = useState('');
    const [isMatching, setIsMatching] = useState(false);

    React.useEffect(() => {
        loadClinics();
        loadBloodFiles();
        handleLoadUsers();
    }, []);

    const loadClinics = async () => {
        try {
            const allClinics = await base44.entities.Clinic.list('-created_date');
            setClinics(allClinics);
        } catch (error) {
            console.error('Error loading clinics:', error);
        }
    };

    const loadBloodFiles = async () => {
        try {
            // ✅ FIXED: Load unmatched blood results directly from database
            const unmatchedResults = await base44.entities.LabResult.filter({
                blood_result_filename: { $ne: null },
                user_id: null
            });
            
            // Convert to file format for the selector
            const files = unmatchedResults.map(result => ({
                name: result.blood_result_filename,
                id: result.id
            }));
            
            setBloodFiles(files);
            console.log('📋 Loaded', files.length, 'unmatched blood files');
        } catch (error) {
            console.error('Error loading blood files:', error);
        }
    };

    const handleLoadUsers = async () => {
        setIsLoading(true);
        setError(null);
        setUsers([]);
        try {
            const response = await getAllUsers();
            if (response.data?.success) {
                setUsers(response.data.users);
            } else {
                setError(response.data.error || 'Failed to fetch users.');
            }
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignToClinic = async () => {
        if (!selectedPatient || !selectedClinic) {
            alert('Please select both patient and clinic');
            return;
        }

        setIsAssigning(true);
        try {
            const response = await assignPatientToClinic({
                patient_id: selectedPatient,
                clinic_id: selectedClinic
            });

            if (response.data.success) {
                alert(response.data.message);
                setSelectedPatient('');
                setSelectedClinic('');
                handleLoadUsers();
            } else {
                alert(response.data.error || 'Failed to assign patient');
            }
        } catch (error) {
            console.error('Assignment error:', error);
            alert('Failed to assign patient to clinic');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleMatchBloodResult = async () => {
        if (!selectedFile || !selectedUserForFile) {
            alert('Please select both file and user');
            return;
        }

        setIsMatching(true);
        try {
            const response = await matchBloodResult({
                filename: selectedFile,
                user_id: selectedUserForFile
            });

            if (response.data.success) {
                alert(`Blood result matched successfully to user!`);
                setSelectedFile('');
                setSelectedUserForFile('');
                loadBloodFiles();
            } else {
                alert(response.data.error || 'Failed to match blood result');
            }
        } catch (error) {
            console.error('Matching error:', error);
            alert('Failed to match blood result');
        } finally {
            setIsMatching(false);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="p-4 pt-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-gray-900" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* User Management */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        User Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleLoadUsers} disabled={isLoading}>
                        {isLoading ? 'Fetching Users...' : 'Fetch All Users'}
                    </Button>
                    {error && <p className="text-red-500 bg-red-50 p-3 rounded-md mt-4">{error}</p>}
                </CardContent>
            </Card>

            {/* Assign Patient to Clinic */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Assign Patient to Clinic
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label>Select Patient</Label>
                            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.filter(u => u.role === 'user').map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Select Clinic</Label>
                            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a clinic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clinics.map(clinic => (
                                        <SelectItem key={clinic.id} value={clinic.id}>
                                            {clinic.clinic_name} ({clinic.clinic_type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleAssignToClinic}
                            disabled={isAssigning || !selectedPatient || !selectedClinic}
                            className="w-full"
                        >
                            {isAssigning ? 'Assigning...' : 'Assign Patient to Clinic'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Match Blood Results */}
            <Card className="bg-white rounded-2xl border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-500" />
                        Match Blood Test Results
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Manually match unmatched blood test files to users
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="file-select">Blood Test File</Label>
                            <Select value={selectedFile} onValueChange={setSelectedFile}>
                                <SelectTrigger id="file-select">
                                    <SelectValue placeholder="Select blood test file" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bloodFiles.length === 0 ? (
                                        <SelectItem value="no-files" disabled>No unmatched files</SelectItem>
                                    ) : (
                                        bloodFiles.map((file) => (
                                            <SelectItem key={file.name} value={file.name}>
                                                {file.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-select-file">Patient</Label>
                            <Select value={selectedUserForFile} onValueChange={setSelectedUserForFile}>
                                <SelectTrigger id="user-select-file">
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.length === 0 ? (
                                        <SelectItem value="no-users" disabled>No users loaded</SelectItem>
                                    ) : (
                                        users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.full_name} ({user.email})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        onClick={handleMatchBloodResult}
                        disabled={isMatching || !selectedFile || !selectedUserForFile}
                        className="w-full bg-teal-500 hover:bg-teal-600"
                    >
                        {isMatching ? 'Matching...' : 'Match Blood Result to Patient'}
                    </Button>
                </CardContent>
            </Card>

            {/* User List */}
            <Card>
                <CardHeader>
                    <CardTitle>User List</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

                    {users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => {
                                        const userClinic = clinics.find(c => c.id === user.clinic_id);
                                        return (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button onClick={() => copyToClipboard(user.id, user.id)} className="flex items-center gap-2 hover:text-gray-900 focus:outline-none">
                                                        <span className="font-mono text-xs">{user.id.substring(0, 8)}...</span>
                                                        {copiedId === user.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.full_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {userClinic ? userClinic.clinic_name : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_date).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        !isLoading && <p className="text-gray-500">No users fetched yet. Click the button to load them.</p>
                    )}

                    {isLoading && <p className="text-gray-500">Loading user data...</p>}
                </CardContent>
            </Card>
        </div>
    );
}