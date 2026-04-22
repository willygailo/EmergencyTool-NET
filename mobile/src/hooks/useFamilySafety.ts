import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { familyApi } from '../family/familyApi';

export const useFamilySafety = () => {
  const dispatch = useDispatch();
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [checkInStatus, setCheckInStatus] = useState<'all_safe' | 'pending' | 'warning'>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFamily();
  }, []);

  const loadFamily = async () => {
    setLoading(true);
    try {
      const members = await familyApi.getFamily();
      setFamilyMembers(members);
      checkAllSafe(members);
    } catch (error) {
      console.log('No family data');
    } finally {
      setLoading(false);
    }
  };

  const checkAllSafe = (members: any[]) => {
    if (members.length === 0) {
      setCheckInStatus('pending');
      return;
    }
    const allSafe = members.every((m) => m.status === 'safe');
    const anyPending = members.some((m) => m.status === 'unknown');
    if (allSafe) setCheckInStatus('all_safe');
    else if (anyPending) setCheckInStatus('pending');
    else setCheckInStatus('warning');
  };

  const checkIn = async (memberId: string, status: 'safe' | 'unsafe' | 'unknown') => {
    await familyApi.checkIn(memberId, status);
    loadFamily();
  };

  return { familyMembers, checkInStatus, loading, refreshFamily: loadFamily, checkIn };
};

export default useFamilySafety;