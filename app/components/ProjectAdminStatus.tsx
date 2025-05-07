'use client';

import React, {useState, useEffect} from 'react';

interface ProjectStatus {
  status: string;
  json: any; // Adjust type as needed based on actual API response
}

async function getProjectStatus(): Promise<ProjectStatus | null> {
  try {
    const response = await fetch('/api/project-status');
    if (!response.ok) {
      console.error('Failed to fetch project status:', response.statusText);
      return null;
    }
    const data = (await response.json()) as ProjectStatus;
    console.warn('Client-side fetched project data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching project status client-side:', error);
    return null;
  }
}

const ProjectStatusChecker: React.FC = () => {
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const projectStatus = await getProjectStatus();
        if (projectStatus === null) {
          // If we can't reach the API, assume the site is unlocked
          // This is a fallback to prevent blocking legitimate users
          setIsLocked(false);
          setError('Unable to verify project status. Site is accessible.');
        } else {
          setIsLocked(projectStatus.status === 'locked');
          setError(null);
        }
      } catch (err) {
        // If there's an error, assume the site is unlocked
        setIsLocked(false);
        setError('Unable to verify project status. Site is accessible.');
      }
    };

    checkStatus();
  }, []); // Empty dependency array ensures this runs once on mount

  if (isLocked === null) {
    // Optional: Render a loading state or nothing while fetching
    return null;
  }

  return (
    <>
      {isLocked && (
        <div className="fixed inset-0 bg-black bg-opacity-80 text-white flex justify-center items-center text-center p-5 z-50">
          <div>
            <div className="text-4xl font-bold mb-4">talyawy.dev</div>
            <div>Please complete payment to unlock website</div>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-0 right-0 bg-yellow-500 text-black p-2 m-2 rounded shadow-lg text-sm">
          {error}
        </div>
      )}
    </>
  );
};

export default ProjectStatusChecker;
