import { useState } from 'react';
const Index = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      // Add form submission logic here
    };
    const [tableOptions] = useState([
        { value: 'metal', label: 'Металлические изделия' },
        { value: 'plastic', label: 'Пластиковые изделия' },
        { value: 'textiles', label: 'Текстильные изделия' },
    ]);
    return (
      <div className="bg-gray-100 text-gray-800 min-h-screen">
        {/* Navbar */}
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
  
        {/* Main Content */}
        <main className="flex items-center justify-center h-screen">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Поиск дубликатов</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="table-select" className="block text-gray-700 mb-2">
                Выберите таблицу
              </label>
              <select
                id="table-select"
                className="block w-full border border-gray-300 rounded-lg p-2 mb-4"
              >
                {tableOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full text-white rounded-lg py-2"
                style={{ backgroundColor: '#8b8e4d' }}
              >
                Запуск
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  };
  export default Index;