const STYLES = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-200 text-gray-700",
};
export default function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STYLES[status] || "bg-gray-100"}`}>
      {String(status).replace("_", " ")}
    </span>
  );
}
