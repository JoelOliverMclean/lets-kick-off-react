import { Link, useParams } from "react-router-dom";

const NoPage = () => {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-start gap-5 p-10 sm:justify-center sm:p-4">
      <h1 className="text-2xl">404 - Page not found</h1>
      <Link
        to={"/"}
        className="hover:bg-slate-80 rounded-lg border-2 border-solid border-green-500 bg-slate-900 px-4 py-3 text-center text-xl"
      >
        Back to home
      </Link>
    </div>
  );
};

export default NoPage;
