import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">ChemReg</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Mini SDS workspace</h1>
        <p className="mt-4 text-base text-slate-600">
          Open the SDS management workspace to create, edit and submit one-page SDS forms as backend-ready JSON.
        </p>
        <Link
          to="/sds"
          className="mt-8 inline-flex rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          Open SDS form
        </Link>
      </div>
    </div>
  );
};

export default Home;