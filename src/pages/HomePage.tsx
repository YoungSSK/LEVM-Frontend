const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#131315] text-[#e5e1e4]">
      <div className="rounded-2xl border border-[#1d1d20] bg-[#1c1b1d]/85 px-8 py-10 shadow-2xl">
        <h1 className="text-3xl font-bold">HomePage</h1>
        <p className="mt-3 text-sm text-[#cbc3d7]">
          You are now on the homepage after a successful login.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
