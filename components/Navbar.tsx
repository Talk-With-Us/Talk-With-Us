const Navbar = () => {
  return (
    <nav className="navbar fixed flex w-screen bg-slate-900 bg-opacity-100 p-4 z-10">
      <div className="mr-auto flex flex-1 justify-center">
        <a href="/" className="mx-2 text-2xl font-semibold text-white ">Talk With Us</a>
      </div>
      <div className=" ml-auto flex flex-1 justify-center text-2xl font-semibold text-white">
        <a
          href="https://www.llamaindex.ai/"
          target="_blank"
          className="font-nunito mx-2 flex items-center text-lg font-bold "
        >
          <span className="hidden sm:inline">Built with LlamaIndex</span>
          <img src="logo-black.svg" className="mx-2 rounded-lg" width={40} />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
