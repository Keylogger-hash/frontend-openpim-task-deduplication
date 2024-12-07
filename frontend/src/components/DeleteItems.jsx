import { useState } from 'react';
import Header from './Header';
import ItemCard from './ItemCard';

const DeleteItems = () => {
    const [items] = useState([
        {
          id: 1,
          title: 'Металлургическое Изделие 1',
          description: 'Description of item 1 marked for deletion.',
        },
        // Add more items here...
    ]);
    
    const handleDelete = () => {
        // Handle delete logic
    };
    
    const handleCancel = () => {
        // Handle cancel logic
    };
    
    return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-roboto">
        <Header />
        
        <main className="bg-yellow-50 min-h-screen">
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                />
            ))}
            </div>
            <div className="flex justify-between mt-8">
            <button
                onClick={handleDelete}
                className="text-white px-6 py-2 rounded-lg hover:bg-green-700"
                style={{ backgroundColor: '#8b8e4d' }}
            >
                Удалить
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