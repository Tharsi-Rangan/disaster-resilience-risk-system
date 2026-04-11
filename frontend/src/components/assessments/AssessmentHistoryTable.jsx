export default function AssessmentHistoryTable({ history, onDelete }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Assessment History</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Risk Score</th>
              <th className="px-3 py-2">Risk Level</th>
              <th className="px-3 py-2">Weather</th>
              <th className="px-3 py-2">Flood</th>
              <th className="px-3 py-2">Earthquake</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-3 py-4 text-center text-slate-500">
                  No assessment history found
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item._id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{item.riskScore}</td>
                  <td className="px-3 py-2">{item.riskLevel}</td>
                  <td className="px-3 py-2">{item.weatherScore}</td>
                  <td className="px-3 py-2">{item.floodScore}</td>
                  <td className="px-3 py-2">{item.earthquakeScore}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onDelete(item._id)}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
