import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { shortenAddress } from "../utils/format";

export default function Navbar() {
  const { address, connect, loading } = useWallet();

  return (
    <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <Link to="/" className="font-extrabold text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight hover:opacity-80 transition-all">
        OracleX
      </Link>

      <div className="flex items-center gap-8 text-sm font-semibold text-gray-500">
        <Link to="/" className="hover:text-purple-600 transition-all">Markets</Link>
        <Link to="/create" className="hover:text-purple-600 transition-all">Create</Link>
      </div>

      <div className="flex items-center gap-3">
        {address ? (
          <button
            className="text-sm px-5 py-2.5 rounded-full bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-all shadow-sm border border-purple-100"
          >
            {shortenAddress(address)}
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={loading}
            className="text-sm px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
          >
            {loading ? "Connecting..." : "Connect wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}