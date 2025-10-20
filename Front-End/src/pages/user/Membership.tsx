import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PUBLIC_PATH } from '@/constants/path';

export default function Membership() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to profile page (membership is now a tab in profile)
    navigate(`${PUBLIC_PATH.HOME}profile`, { replace: true });
  }, [navigate]);

  return null;
}


