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
          <h2 className="text-lg font-bold">Найденные совпадения</h2>
        </div>
      </header>
    );
  };
  
  export default Header;