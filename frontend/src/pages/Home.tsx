const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to ChemReg</h1>
        <a
          href="/login"
          className="inline-block bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default Home;