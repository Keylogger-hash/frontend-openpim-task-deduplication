import { useState } from 'react';
import Header from './Header';
import ItemCard from './ItemCard';
import {  useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DeleteItems = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [totalUniqueItems, setTotalUniqueItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [taskStatus, setTaskStatus] = useState('PENDING');

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8001/tasks/${taskId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const status = data.task_status;
                if (status === 'SUCCESS') {
                    setItems(data['task_result']['result']);
                    setTotalUniqueItems(data['task_result']['total_count'])
                    console.log(totalUniqueItems)
                    setLoading(false);
                } else if (status === 'FAILURE') {
                    throw new Error('Task failed');
                }
            } catch (err) {
                console.error('Error fetching task data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (taskId) {
            fetchTaskData();
        }
    }, [taskId]);

    const handleDelete = () => {
        navigate(`/ready-for-delete/${taskId}`)
    };
    
    const handleCancel = () => {
        navigate(-1);
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <div className="container mx-auto p-6 text-center">
                    Загрузка...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <div className="container mx-auto p-6 text-center text-red-600">
                    Ошибка: {error}
                </div>
            </div>
        );
    }
    // const [items] = useState([
    //     {
    //       id: 1,
    //       title: 'Металлургическое Изделие 1',
    //       description: 'Description of item 1 marked for deletion.',
    //     },
    //     // Add more items here...
    // ]);

    
    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-roboto">
            <Header totalUniqueItems={totalUniqueItems}/>
            
            <main className="bg-yellow-50 min-h-screen">
                <div className="container mx-auto p-6">
                {items.map((group) => (
                        <div key={group.id} className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">
                                Группа похожих товаров: {group.name}
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Основной элемент */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold">
                                        {group.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">ID: {group.id}</p>
                                    <div className="mt-2 text-green-600">Основной товар</div>
                                </div>
                                
                                {/* Дубликаты */}
                                {group.duplicates.slice(1).map((duplicate) => (
                                    <div 
                                        key={duplicate[0]} 
                                        className="bg-orange-50 p-4 rounded-lg shadow"
                                    >
                                        <h3 className="text-lg font-semibold">
                                            {duplicate[1]}
                                        </h3>
                                        <p className="text-sm text-gray-500">ID: {duplicate[0]}</p>
                                        <div className="mt-2 text-orange-600">Похожий товар</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleDelete}
                            className="text-white px-6 py-2 rounded-lg hover:bg-green-700"
                            style={{ backgroundColor: '#8b8e4d' }}
                        >
                            Удалить дубликаты
                        </button>
                        <button
                            onClick={handleCancel}
                            className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DeleteItems;