import React from 'react';

const Reports = () => {
  return (
    <div className="bg-gray-100 text-gray-800">
      <Header />
      <MainContent />
    </div>
  );
};

const Header = () => {
  return (
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
        <div className="flex space-x-2">
          <button className="text-white px-4 py-2 rounded-lg hover:bg-green-700" style={{backgroundColor: '#8b8e4d'}}>
            Запуск задачи
          </button>
          <button className="border border-gray-400 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
            Вернуться назад
          </button>
        </div>
      </div>
    </header>
  );
};

const MainContent = () => {
  const reports = [
    { id: 3, name: 'Отчет 3', percentage: '82%' },
    { id: 2, name: 'Отчет 2', percentage: '76%' },
    { id: 1, name: 'Отчет 1', percentage: '91%' },
  ];

  return (
    <main className="container mx-auto p-6">
      <SearchSort />
      <ReportsTable reports={reports} />
    </main>
  );
};

const SearchSort = () => {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <input
        type="text"
        placeholder="Поиск отчета"
        className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring focus:ring-green-300"
      />
      <select className="border border-gray-300 rounded-lg px-4 py-2">
        <option value="">Сортировать по проценту</option>
        <option value="ascending">По возрастанию</option>
        <option value="descending">По убыванию</option>
      </select>
      <button 
        className="text-white px-4 py-2 rounded-lg hover:bg-green-700"
        style={{backgroundColor: '#8b8e4d'}}
      >
        Поиск
      </button>
    </div>
  );
};

const ReportsTable = ({ reports }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="table-auto w-full text-left border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border-b">Выполненные отчеты о дубликатах</th>
            <th className="px-4 py-2 border-b">Процент совпадений</th>
            <th className="px-4 py-2 border-b">Действия</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-t">
              <td className="px-4 py-2">{report.name}</td>
              <td className="px-4 py-2">{report.percentage}</td>
              <td className="px-4 py-2 flex space-x-2">
                <button 
                  className="text-white px-4 py-1 rounded-lg hover:bg-green-700"
                  style={{backgroundColor: '#8b8e4d'}}
                >
                  Просмотр
                </button>
                <button className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700">
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;