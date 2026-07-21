export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-slate-700 hover:scale-105 cursor-pointer transition-all"
          >
            No, keep it
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 hover:scale-105 cursor-pointer transition-all shadow-lg shadow-red-500/20"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}
