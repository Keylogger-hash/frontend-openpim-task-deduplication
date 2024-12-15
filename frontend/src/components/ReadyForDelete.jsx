import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import SuccessDelete from './SuccessDelete';
const ReadyForDelete = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [duplicateItems, setDuplicateItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStatus, setTaskStatus] = useState('PENDING');
  const [totalUniqueItems, setTotalUniqueItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    const checkTaskStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8001/tasks/${taskId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const status = data.task_status;
        setTaskStatus(status);

        if (status === 'SUCCESS') {
          const allDuplicates = data.task_result.result.reduce((acc, group) => {
            // Пропускаем первый элемент (основной) и добавляем остальные
            const duplicates = group.duplicates.slice(1).map(duplicate => ({
              id: duplicate[0],
              name: duplicate[1],
              groupName: group.name
            }));
            return [...acc, ...duplicates];
          }, []);
          console.log(allDuplicates)
          setDuplicateItems(allDuplicates);
          setTotalUniqueItems(data['task_result']['total_count'])
          setLoading(false);
        } else if (status === 'FAILURE') {
          throw new Error('Task failed');
        }
      } catch (err) {
        console.error('Error checking task status:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const pollTaskStatus = () => {
      const intervalId = setInterval(async () => {
        if (taskStatus !== 'SUCCESS' && taskStatus !== 'FAILURE') {
          await checkTaskStatus();
        } else {
          clearInterval(intervalId);
        }
      }, 2000); // Проверка каждые 2 секунды

      return () => clearInterval(intervalId);
    };

    if (taskId) {
      pollTaskStatus();
    }
  }, [taskId, taskStatus]);

  const handleDelete = async () => {
    try {
      // Отправляем только выбранные элементы
      const response = await fetch(`http://localhost:8001/delete-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          Array.from(selectedItems).map(num=>parseInt(num))
        )
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      navigate('/success-delete');
    } catch (err) {
      console.error('Error deleting items:', err);
      setError(err.message);
    }
  };
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = duplicateItems.map(item => item.id);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Обработчик выбора отдельного элемента
  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };
  const handleCancel = () => {
    navigate(-1);
  };

  if (loading || taskStatus !== 'SUCCESS') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header totalUniqueItems={totalUniqueItems}/>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <div className="mb-4">
              <svg className="animate-spin h-10 w-10 mx-auto text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              Задача выполняется...
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Статус: {taskStatus}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header totalUniqueItems={totalUniqueItems}/>
        <div className="container mx-auto p-6 text-center text-red-600">
          Ошибка: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header totalUniqueItems={totalUniqueItems} />
      <main className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-3/4">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Подтверждение удаления дубликатов
          </h1>
          <p className="text-gray-600 mb-6">
            Выберите элементы для удаления
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-green-600"
                      checked={selectedItems.size === duplicateItems.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">Название</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">Дубликат слова</th>
                </tr>
              </thead>
              <tbody>
                {duplicateItems.map((item) => (
                  <tr key={`${item.groupId}-${item.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 border border-gray-200">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-green-600"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border border-gray-200">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border border-gray-200">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 border border-gray-200">
                      {item.groupName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-6">
            <button 
              onClick={handleDelete}
              className="text-white px-6 py-2 rounded shadow hover:bg-green-700 transition"
              style={{ backgroundColor: '#8b8e4d' }}
              disabled={selectedItems.size === 0}
            >
              Удалить выбранные ({selectedItems.size})
            </button>
            <button 
              onClick={handleCancel}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-300 transition"
            >
              Отменить
            </button>
          </div>
        </div>
      </main>
    </div>
  );

};

export default ReadyForDelete;