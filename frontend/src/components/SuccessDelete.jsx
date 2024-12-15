// SuccessDelete.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const SuccessDelete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Автоматическое перенаправление через 3 секунды
    const timer = setTimeout(() => {
      navigate('/reports');
    }, 300000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto mt-10">
          <div className="text-center">
            <div className="mb-4">
              <svg 
                className="h-16 w-16 text-green-500 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Успешное удаление
            </h2>
            <p className="text-gray-600 mb-6">
              Дубликаты были успешно удалены из базы данных
            </p>
            <div className="text-sm text-gray-500">
              Вы будете перенаправлены на страницу отчетов через несколько секунд...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessDelete;