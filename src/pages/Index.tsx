import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeeCalculator } from '@/components/FeeCalculator';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('authenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  return <FeeCalculator />;
};

export default Index;
