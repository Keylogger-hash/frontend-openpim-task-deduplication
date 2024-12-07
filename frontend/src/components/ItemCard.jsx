const ItemCard = ({ id, title, description }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center">
          <input type="checkbox" id={`item-${id}`} className="mr-2" />
          <label htmlFor={`item-${id}`} className="text-sm text-gray-700">
            Выбрать
          </label>
        </div>
      </div>
    );
  };
  
  export default ItemCard;