
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, User as UserIcon, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function MuhdoProfilePage() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedAlgorithms, setExpandedAlgorithms] = useState({});

  const params = new URLSearchParams(location.search);
  const profileId = params.get('profile_id');
  const testType = params.get('test_type');

  useEffect(() => {
    loadProfile();
  }, [profileId, testType]);

  const loadProfile = async () => {
    if (!profileId) {
      setError('No profile ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      let response;
      // Determine which API to call based on test_type
      // test_type can be: 'genetics', 'epigenetic', or 'other'
      if (testType === 'genetics') {
        console.log('📊 Loading DNA profile...');
        response = await base44.functions.invoke('getDnaProfile', { profile_id: profileId });
      } else if (testType === 'epigenetic') {
        console.log('🧬 Loading Epigenetic profile...');
        response = await base44.functions.invoke('getEpigeneticProfile', { profile_id: profileId });
      } else {
        // Default to epigenetic if type is unclear
        console.log('🧬 Loading profile (defaulting to Epigenetic)...');
        response = await base44.functions.invoke('getEpigeneticProfile', { profile_id: profileId });
      }

      if (response.data.success) {
        setProfile(response.data.profile);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleAlgorithm = (algorithmId, accordionType) => {
    const key = `${algorithmId}-${accordionType}`;
    setExpandedAlgorithms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getScoreColor = (scoreGauge) => {
    if (scoreGauge <= 2) return 'bg-red-500';
    if (scoreGauge <= 4) return 'bg-orange-400';
    if (scoreGauge <= 6) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const renderScoreBar = (scoreGauge) => {
    const colors = [
      'bg-red-500', 'bg-red-400', 'bg-orange-500', 'bg-orange-400',
      'bg-yellow-400', 'bg-yellow-300', 'bg-green-400', 'bg-green-500', 'bg-green-600'
    ];
    
    return (
      <div className="flex gap-1 my-4">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`h-8 flex-1 ${color} ${index < scoreGauge ? 'opacity-100' : 'opacity-30'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 pt-12">
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 pt-12">
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl("LabResults")} className="inline-flex items-center text-gray-600 mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Lab Results
          </Link>
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{error || 'Profile not found'}</h3>
              <p className="text-gray-500">Unable to load profile data</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isDna = testType === 'genetics';
  const isEpigenetic = testType === 'epigenetic';
  const sections = isDna ? profile.dna_sections : profile.epigenetic_sections;

  return (
    <div className="bg-gray-50 min-h-screen p-4 pt-12 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl("LabResults")} className="inline-flex items-center text-gray-600">
            <ChevronLeft className="w-5 h-5 mr-1" />
          </Link>
          <h1 className="text-lg font-semibold">
            {isDna ? 'DNA Profile' : isEpigenetic ? 'Epigenetic Profile' : 'Profile'}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.full_name || `${profile.first_name} ${profile.last_name}`}</h2>
                  <p className="text-blue-500 text-sm mt-1">🔗 View User Profile</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">{profile.algorithm_set_name}</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Profile ID:</span>
                <span className="font-medium text-gray-800">{profile.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kit ID:</span>
                <span className="font-medium text-gray-800">{profile.kit_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Organisation:</span>
                <span className="font-medium text-gray-800">{profile.organisation_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Results Date/Time:</span>
                <span className="font-medium text-gray-800">
                  {format(new Date(profile.date_time), 'dd/MM/yyyy HH:mm:ss')}
                </span>
              </div>
              {profile.date_time_refreshed && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Refreshed:</span>
                  <span className="font-medium text-gray-800">
                    {format(new Date(profile.date_time_refreshed), 'dd/MM/yyyy HH:mm:ss')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sections List */}
        {sections && sections.map((section) => (
          <Card key={section.id} className="bg-white rounded-2xl border-0 shadow-sm mb-4">
            <CardHeader>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-700">{section.name}</h3>
                {expandedSections[section.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </CardHeader>

            {expandedSections[section.id] && (
              <CardContent className="space-y-6">
                {section.algorithms && section.algorithms.map((algorithm) => (
                  <div key={algorithm.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{algorithm.name}</h4>
                    
                    {/* Score Results for Epigenetic */}
                    {algorithm.score_results && algorithm.score_results.length > 0 && (
                      <div className="mb-4">
                        {algorithm.score_results.map((scoreResult, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-2xl font-bold">{scoreResult.chronological_age || 'N/A'}</p>
                                <p className="text-sm text-gray-500">Your Age (Chronological Age)</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-2xl font-bold">{scoreResult.score_results_age || scoreResult.outcome?.score_gauge || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{scoreResult.score_title}</p>
                            </div>
                            {scoreResult.outcome && renderScoreBar(scoreResult.outcome.score_gauge)}
                            {scoreResult.plain_outcome && (
                              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mt-4">
                                <p className="text-sm text-gray-700">{scoreResult.plain_outcome}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Outcome for DNA */}
                    {algorithm.outcome && !algorithm.score_results && (
                      <div className="mb-4">
                        {renderScoreBar(algorithm.outcome.score_gauge)}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{algorithm.outcome.name}</p>
                        </div>
                      </div>
                    )}

                    {/* AI Outcomes */}
                    {algorithm.ai_outcomes && algorithm.ai_outcomes.map((outcome, idx) => (
                      <div key={idx} className="mb-2">
                        <button
                          onClick={() => toggleAlgorithm(algorithm.id, outcome.title)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <span className="font-medium text-gray-700">{outcome.title}</span>
                          {expandedAlgorithms[`${algorithm.id}-${outcome.title}`] ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedAlgorithms[`${algorithm.id}-${outcome.title}`] && (
                          <div className="p-4 bg-white border border-gray-200 rounded-b-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{outcome.body}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Audit Items (for Epigenetic - gene details) */}
                    {algorithm.audit_items && algorithm.audit_items.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleAlgorithm(algorithm.id, 'audit')}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <span className="font-medium text-gray-700">Epigenetic Audit</span>
                          {expandedAlgorithms[`${algorithm.id}-audit`] ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedAlgorithms[`${algorithm.id}-audit`] && (
                          <div className="p-4 space-y-3 bg-white border border-gray-200 rounded-b-lg">
                            {algorithm.audit_items.map((item, idx) => (
                              <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold text-blue-900">{item.gene_name}</p>
                                    <p className="text-xs text-blue-700">{item.gene_description}</p>
                                  </div>
                                  <Badge className="bg-blue-200 text-blue-800">
                                    {item.score_gauge}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mt-2">{item.outcome_title}</p>
                                <p className="text-xs text-gray-600">{item.outcome_description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Information Items */}
                    {algorithm.information_items && algorithm.information_items.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleAlgorithm(algorithm.id, 'info')}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <span className="font-medium text-gray-700">About</span>
                          {expandedAlgorithms[`${algorithm.id}-info`] ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedAlgorithms[`${algorithm.id}-info`] && (
                          <div className="p-4 space-y-3 bg-white border border-gray-200 rounded-b-lg">
                            {algorithm.information_items.map((item, idx) => (
                              <div key={idx} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{item.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
