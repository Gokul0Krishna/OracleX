import { explorerTx } from "../utils/contracts";

export default function VerdictPanel({ market, onClaim, txPending, txHash, userStakes }) {
  const won = market.outcome
    ? BigInt(userStakes?.yes ?? "0") > 0n
    : BigInt(userStakes?.no ?? "0") > 0n;

  const evidenceText = market.aiEvidence.replace(/^\[AI \d+% confident\] /, "");
  const confidence   = market.aiEvidence.match(/\[AI (\d+)% confident\]/)?.[1];

  return (
    <div className="space-y-6">
      {/* Outcome banner */}
      <div className={`rounded-2xl p-6 text-center border-2 shadow-sm ${market.outcome ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
        <div className={`text-5xl font-extrabold tracking-tight ${market.outcome ? "text-emerald-600" : "text-rose-600"}`}>
          {market.outcome ? "YES" : "NO"}
        </div>
        <div className="text-sm font-semibold text-gray-500 mt-2 uppercase tracking-widest">Final Outcome</div>
      </div>

      {/* AI evidence */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 space-y-4 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-sm font-bold text-amber-900 uppercase tracking-wide">AI Oracle Verdict</span>
          </div>
          {confidence && (
            <span className="text-xs bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full font-bold shadow-sm">
              {confidence}% confidence
            </span>
          )}
        </div>
        <p className="text-base text-amber-950 leading-relaxed font-medium">{evidenceText}</p>
        <p className="text-xs font-semibold text-amber-700/70 border-t border-amber-200/50 pt-3">
          Stored permanently on Shardeum Sphinx — immutable and fully auditable
        </p>
      </div>

      {/* Explorer link */}
      {txHash && (
        <a href={explorerTx(txHash)} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 underline transition-colors bg-purple-50 p-3 rounded-xl border border-purple-100">
          View resolution tx on Shardeum Explorer
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      )}

      {/* Claim button */}
      {won && (
        <button
          onClick={onClaim}
          disabled={txPending}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
        >
          {txPending ? "Claiming..." : "🎉 Claim your winnings"}
        </button>
      )}

      {!won && (BigInt(userStakes?.yes ?? "0") > 0n || BigInt(userStakes?.no ?? "0") > 0n) && (
        <div className="text-center text-sm font-medium text-gray-500 bg-gray-50 py-4 rounded-xl border border-gray-100">
          You were on the losing side this time. Better luck next prediction!
        </div>
      )}
    </div>
  );
}