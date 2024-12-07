import React from 'react';
import { useState } from 'react';
const ReadyForDelete = () => {
  const [duplicateItems, setDuplicateItems] = useState([
    {
      code: 'CODE12345',
      name: 'Металлургическое Изделие 1',
      attributes: '...'
    },
    {
      code: 'CODE67890',
      name: 'Металлургическое Изделие 2',
      attributes: '...'
    },
    {
      code: 'CODE54321',
      name: 'Металлургическое Изделие 3',
      attributes: '...'
    },
  ]);
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2">
            <button className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">TaskDuplicateDetection</h1>
          </div>
          <button className="p-2">
            <img src="/settings.png" alt="Logo" style={{ width: '20px', height: 'auto' }} />
          </button>
        </div>
      </header>

      <main className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-3/4">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Подтверждение удаления дубликатов</h1>
          <p className="text-gray-600 mb-6">Проверьте правильность выбора перед удалением.</p>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">Уникальный код записи</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">Название</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">Доп атрибуты</th>
                </tr>
              </thead>
              <tbody>
                {duplicateItems.map((item, index) => (
                  <tr key={item.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 border border-gray-200">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border border-gray-200">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 border border-gray-200">{item.attributes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-6">
            <button 
              className="text-white px-6 py-2 rounded shadow hover:bg-green-700 transition"
              style={{ backgroundColor: '#8b8e4d' }}
            >
              Удалить
            </button>
            <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-300 transition">
              Отменить
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadyForDelete;